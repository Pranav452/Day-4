import { NextRequest, NextResponse } from 'next/server';
import { callGeminiVision } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, question } = body;

    // Validate input
    if (!image || !question) {
      return NextResponse.json(
        { success: false, error: 'Image and question are required' },
        { status: 400 }
      );
    }

    if (typeof image !== 'string' || typeof question !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid input format' },
        { status: 400 }
      );
    }

    if (question.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Question too long (max 500 characters)' },
        { status: 400 }
      );
    }

    // Call Gemini Vision API
    const result = await callGeminiVision(image, question);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        result,
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error. Please try again.' 
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS (if needed)
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
} 