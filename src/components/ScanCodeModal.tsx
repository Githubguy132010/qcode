"use client"

import { useEffect, useRef, useState } from 'react'
import { X, Camera, ScanLine, AlertTriangle, Image as ImageIcon, Type as TypeIcon } from 'lucide-react'
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser'
import { parseScannedText } from '@/utils/scan-parser'
import type { DiscountCodeFormData } from '@/types/discount-code'
import { useTranslation } from 'react-i18next'

interface ScanCodeModalProps {
  isOpen: boolean
  onClose: () => void
  onDetect: (formData: Partial<DiscountCodeFormData>) => void
}

export default function ScanCodeModal({ isOpen, onClose, onDetect }: ScanCodeModalProps) {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const stopScanner = () => {
      try {
        controlsRef.current?.stop()
        controlsRef.current = null
        if (videoRef.current?.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream
          stream.getTracks().forEach(track => track.stop())
        }
      } catch {}
      setIsScanning(false)
    }

    const startScanner = async () => {
      setError(null)
      setIsScanning(true)
      try {
        const codeReader = new BrowserMultiFormatReader()
        codeReaderRef.current = codeReader
        const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices()
        const backCamera = videoInputDevices.find(d => /back|rear|environment/i.test(d.label))
        const deviceId = backCamera?.deviceId ?? videoInputDevices[0]?.deviceId
        if (!deviceId) throw new Error('No camera found')

        const controls = await codeReader.decodeFromVideoDevice(deviceId, videoRef.current!, (result, err: unknown) => {
          if (result) {
            const text = result.getText()
            const parsed = parseScannedText(text)
            onDetect({
              code: parsed.code ?? text,
              discount: parsed.discount ?? '',
              expiryDate: parsed.expiryDate ?? '',
              store: parsed.store ?? '',
              source: 'scan',
              barcodeData: text,
              tags: parsed.tags ?? [],
            })
            controlsRef.current?.stop()
            controlsRef.current = null
            // allow camera to stop
            if (videoRef.current?.srcObject) {
              const stream = videoRef.current.srcObject as MediaStream
              stream.getTracks().forEach(track => track.stop())
            }
            onClose()
          }
          if (err && err instanceof Error && !err.message.includes('No MultiFormat Readers')) {
            console.debug('Transient scan error:', err.message)
          }
        })
        controlsRef.current = controls
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Camera error'
        setError(message)
      }
    }

    startScanner()
    return () => stopScanner()
  }, [isOpen, onClose, onDetect])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="theme-card rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
          <div className="flex items-center gap-2">
            <ScanLine size={18} />
            <h3 className="text-lg font-semibold">{t('scan.title', 'Scan code')}</h3>
          </div>
          <button onClick={onClose} className="p-2 theme-text-muted hover:theme-text-secondary">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div className="relative rounded-lg overflow-hidden aspect-video bg-black">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline autoPlay />
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center text-white/80">
                <Camera className="mr-2" /> {t('scan.cameraStarting', 'Starting camera...')}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={async () => {
                try {
                  setError(null)
                  // Capture current frame
                  const video = videoRef.current
                  if (!video) throw new Error('Video not ready')
                  const canvas = canvasRef.current || document.createElement('canvas')
                  canvasRef.current = canvas
                  canvas.width = video.videoWidth || 1280
                  canvas.height = video.videoHeight || 720
                  const ctx = canvas.getContext('2d')
                  if (!ctx) throw new Error('Canvas not supported')
                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                  const dataUrl = canvas.toDataURL('image/png')
                  // Lazy-load Tesseract to avoid heavy initial bundle
                  const { recognize } = await import('tesseract.js')
                  const { data: { text } } = await recognize(dataUrl, 'eng')
                  const parsed = parseScannedText(text)
                  if (parsed.code || parsed.discount || parsed.expiryDate || parsed.store) {
                    onDetect({
                      code: parsed.code ?? '',
                      discount: parsed.discount ?? '',
                      expiryDate: parsed.expiryDate ?? '',
                      store: parsed.store ?? '',
                      source: 'scan',
                      tags: parsed.tags ?? [],
                    })
                    onClose()
                  } else {
                    setError(t('scan.ocrNoText', 'Could not detect text. Try again.'))
                  }
                } catch (e: unknown) {
                  const message = e instanceof Error ? e.message : 'OCR error'
                  setError(message)
                }
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[var(--filter-bg)] hover:bg-[var(--input-border)] theme-text-secondary text-sm"
            >
              <TypeIcon size={16} /> {t('scan.useOcr', 'Use OCR (fallback)')}
            </button>
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[var(--filter-bg)] hover:bg-[var(--input-border)] theme-text-secondary text-sm cursor-pointer">
              <ImageIcon size={16} /> {t('scan.uploadImage', 'Upload image')}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  try {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const url = URL.createObjectURL(file)
                    const { recognize } = await import('tesseract.js')
                    const { data: { text } } = await recognize(url, 'eng')
                    URL.revokeObjectURL(url)
                    const parsed = parseScannedText(text)
                    if (parsed.code || parsed.discount || parsed.expiryDate || parsed.store) {
                      onDetect({
                        code: parsed.code ?? '',
                        discount: parsed.discount ?? '',
                        expiryDate: parsed.expiryDate ?? '',
                        store: parsed.store ?? '',
                        source: 'scan',
                        tags: parsed.tags ?? [],
                      })
                      onClose()
                    } else {
                      setError(t('scan.ocrNoText', 'Could not detect text. Try again.'))
                    }
                  } catch (e: unknown) {
                    const message = e instanceof Error ? e.message : 'OCR error'
                    setError(message)
                  }
                }}
              />
            </label>
          </div>
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
              <AlertTriangle className="mt-0.5" size={18} />
              <p className="text-sm">{t('scan.error', 'Camera error')}: {error}</p>
            </div>
          )}
          <p className="text-xs theme-text-secondary">
            {t('scan.help', 'Align the code within the frame. QR and barcodes are supported.')}
          </p>
        </div>
      </div>
    </div>
  )
}
