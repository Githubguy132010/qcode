/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { GET } from '@/app/api/scrape/route'
import { NextRequest } from 'next/server'
import puppeteer from 'puppeteer'

// Mock the whole puppeteer library
jest.mock('puppeteer')

// Type assertion for the mocked module
const puppeteerMock = puppeteer as jest.Mocked<typeof puppeteer>

describe('/api/scrape', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 400 if store parameter is missing', async () => {
    const req = new NextRequest('http://localhost/api/scrape')
    const res = await GET(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Store parameter is required')
  })

  it('should return 400 for an unsupported store', async () => {
    const req = new NextRequest('http://localhost/api/scrape?store=unsupported')
    const res = await GET(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Store not supported')
  })

  it('should return 200 and coupon data for a supported store (amazon)', async () => {
    const mockCoupons = [{ code: 'TESTCODE', store: 'Amazon', discount: '10%' }]

    // Mock the implementation for this specific test
    const mockBrowser: any = {
      newPage: jest.fn().mockResolvedValue({
        goto: jest.fn().mockResolvedValue(undefined),
        evaluate: jest.fn().mockResolvedValue(mockCoupons),
        close: jest.fn().mockResolvedValue(undefined),
      }),
      close: jest.fn().mockResolvedValue(undefined),
    }
    puppeteerMock.launch.mockResolvedValue(mockBrowser)

    const req = new NextRequest('http://localhost/api/scrape?store=amazon')
    const res = await GET(req)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual(mockCoupons)
    expect(puppeteer.launch).toHaveBeenCalled()
  })

  it('should handle errors during scraping and return an empty array', async () => {
    // Mock a failure in launching puppeteer
    puppeteerMock.launch.mockRejectedValue(new Error('Puppeteer launch failed'))

    const req = new NextRequest('http://localhost/api/scrape?store=amazon')
    const res = await GET(req)

    // The scrapeAmazon function catches the error and returns an empty array
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual([])
  })
})
