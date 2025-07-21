import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ChangelogEntry, AIGeneratedSummary } from '@/types/changelog'

// Rate limiting storage (in-memory for this example)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_MAX = 10 // Max 10 requests per hour per IP
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in milliseconds

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const ip = forwarded ? forwarded.split(',')[0] : realIP || 'unknown'
  return `ai-summary:${ip}`
}

function checkRateLimit(key: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    // First request or window expired
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return { allowed: true }
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, resetTime: record.resetTime }
  }

  record.count++
  rateLimitStore.set(key, record)
  return { allowed: true }
}

export async function POST(request: NextRequest) {
  try {
    // Check rate limiting
    const rateLimitKey = getRateLimitKey(request)
    const rateLimitResult = checkRateLimit(rateLimitKey)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          resetTime: rateLimitResult.resetTime 
        },
        { status: 429 }
      )
    }

    // Validate API key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('GEMINI_API_KEY environment variable not set')
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { entries }: { entries: ChangelogEntry[] } = body

    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: 'Invalid entries data' },
        { status: 400 }
      )
    }

    // Limit the number of entries to prevent excessive token usage
    const limitedEntries = entries.slice(0, MAX_ENTRIES) // Max 20 entries

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    // Prepare the changelog data for AI analysis
    const changelogText = limitedEntries.map(entry => {
      const type = entry.type === 'pr' ? 'Pull Request' : 'Commit'
      const date = new Date(entry.date).toLocaleDateString()
      return `${type} by ${entry.author} on ${date}:
Title: ${entry.title}
Description: ${entry.description.substring(0, DESCRIPTION_TRUNCATION_LIMIT)}${entry.description.length > DESCRIPTION_TRUNCATION_LIMIT ? '...' : ''}
---`
    }).join('\n\n')

    const prompt = `You are analyzing recent changes to QCode, a Progressive Web App for managing discount codes built with Next.js, TypeScript, and Tailwind CSS.

Here are the recent changes (${limitedEntries.length} entries):

${changelogText}

Please analyze these changes and provide a JSON response with the following structure:
{
  "title": "A concise, user-friendly title summarizing the update (e.g., '5 new improvements available')",
  "summary": "A brief, engaging summary (2-3 sentences) explaining what changed and why users should care",
  "highlights": [
    "3-5 bullet points starting with emojis, highlighting key changes in user-friendly language",
    "Focus on user benefits rather than technical details",
    "Use emojis like 🎉 for new features, 🐛 for bug fixes, ✨ for UI improvements, 🔧 for performance, 📱 for mobile improvements"
  ],
  "userImpact": "A single sentence explaining how these changes benefit the user directly"
}

Guidelines:
- Write for end users, not developers
- Focus on user benefits and experience improvements
- Be enthusiastic but honest
- Keep it concise and scannable
- If changes are mostly technical, emphasize stability and performance benefits
- For QCode specifically, focus on discount code management, organization, search, notifications, and offline capabilities

Respond with valid JSON only.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse the AI response
    let aiResponse: AIGeneratedSummary
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response')
      }
      aiResponse = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      console.error('Raw response:', text)
      throw parseError
    }

    // Validate the response structure
    if (!aiResponse.title || !aiResponse.summary || !aiResponse.highlights || !aiResponse.userImpact) {
      throw new Error('Invalid AI response structure')
    }

    // Ensure highlights is an array
    if (!Array.isArray(aiResponse.highlights)) {
      throw new Error('Highlights is not an array')
    }

    return NextResponse.json(aiResponse)

  } catch (error) {
    console.error('AI Summary API Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI summary' },
      { status: 500 }
    )
  }
}
