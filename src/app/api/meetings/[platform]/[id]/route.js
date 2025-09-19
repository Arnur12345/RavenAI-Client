import { NextResponse } from 'next/server'
import { getApiKey, getApiBaseUrl } from '@/lib/transcription-service'

export async function DELETE(request, { params }) {
  try {
    const { platform, id } = await params
    const apiKey = getApiKey()
    const apiBaseUrl = getApiBaseUrl()
    
    if (!apiKey || !apiBaseUrl) {
      return NextResponse.json(
        { error: 'API configuration missing' },
        { status: 400 }
      )
    }

    const response = await fetch(`${apiBaseUrl}/meetings/${platform}/${id}`, {
      method: 'DELETE',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.error || `API request failed: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error deleting meeting:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  try {
    const { platform, id } = await params
    const body = await request.json()
    const apiKey = getApiKey()
    const apiBaseUrl = getApiBaseUrl()
    
    if (!apiKey || !apiBaseUrl) {
      return NextResponse.json(
        { error: 'API configuration missing' },
        { status: 400 }
      )
    }

    const response = await fetch(`${apiBaseUrl}/meetings/${platform}/${id}`, {
      method: 'PATCH',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.error || `API request failed: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating meeting:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
