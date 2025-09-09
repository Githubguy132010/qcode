import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import puppeteer from 'puppeteer'
import type { DiscountCodeFormData } from '@/types/discount-code'

// Scraper for Amazon
async function scrapeAmazon(): Promise<DiscountCodeFormData[]> {
  let browser = null
  try {
    console.log('Launching browser...')
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()

    console.log('Navigating to Amazon coupons page...')
    await page.goto('https://www.amazon.com/gp/coupons', {
      waitUntil: 'networkidle2',
    })

    console.log('Scraping page for coupons...')
    const coupons = await page.evaluate(() => {
      const results: DiscountCodeFormData[] = []
      // This selector is a guess and might need adjustment.
      const items = document.querySelectorAll('.coupon-tile')

      items.forEach(item => {
        try {
          // Extract coupon code from the 'clip' button input element
          const clipButton = item.querySelector('input[data-asin]')
          const code = clipButton ? clipButton.getAttribute('data-asin') || 'N/A' : 'N/A'

          const description = item.querySelector('.coupon-title')?.textContent?.trim() || ''
          const discount = item.querySelector('.promo-discount-text')?.textContent?.trim() || ''
          const termsLink = item.querySelector<HTMLAnchorElement>('a.terms-and-conditions-link')
          const termsAndConditions = termsLink ? termsLink.title : ''

          // Expiry date is often not directly available, might need to be inferred or omitted.

          if (code !== 'N/A') {
            results.push({
              code,
              store: 'Amazon',
              discount,
              description,
              category: 'Anders', // A default category
              termsAndConditions,
              expiryDate: '', // Placeholder for expiry date
            })
          }
        } catch (e) {
          console.error('Error parsing a single coupon item:', e)
        }
      })
      return results
    })

    console.log(`Found ${coupons.length} coupons.`)
    return coupons
  } catch (error) {
    console.error('Error scraping Amazon:', error)
    return [] // Return empty array on error
  } finally {
    if (browser) {
      console.log('Closing browser...')
      await browser.close()
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const store = searchParams.get('store')

  if (!store) {
    return NextResponse.json({ error: 'Store parameter is required' }, { status: 400 })
  }

  let scrapedData: DiscountCodeFormData[] = []

  try {
    switch (store.toLowerCase()) {
      case 'amazon':
        scrapedData = await scrapeAmazon()
        break
      default:
        return NextResponse.json({ error: 'Store not supported' }, { status: 400 })
    }

    return NextResponse.json(scrapedData)
  } catch (error) {
    console.error(`Scraping failed for store: ${store}`, error)
    return NextResponse.json({ error: `Failed to scrape ${store}.` }, { status: 500 })
  }
}
