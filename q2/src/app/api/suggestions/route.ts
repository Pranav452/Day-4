import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { partial, context = 'image-question' } = await request.json();

    if (!partial || typeof partial !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Partial text is required' },
        { status: 400 }
      );
    }

    // Don't suggest for very short inputs
    if (partial.length < 3) {
      return NextResponse.json({
        success: true,
        suggestions: []
      });
    }

    // Try local model first (if available), then fallback to pattern matching
    const suggestions = await generateSuggestions(partial, context);

    return NextResponse.json({
      success: true,
      suggestions
    });

  } catch (error) {
    console.error('Suggestions API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate suggestions' 
      },
      { status: 500 }
    );
  }
}

async function generateSuggestions(partial: string, context: string): Promise<string[]> {
  try {
    // Option 1: Try Hugging Face Inference API (if API key is available)
    const hfApiKey = process.env.HUGGING_FACE_API_KEY;
    
    if (hfApiKey) {
      try {
        const hfSuggestions = await callHuggingFaceModel(partial, hfApiKey);
        if (hfSuggestions.length > 0) {
          return hfSuggestions;
        }
      } catch (hfError) {
        console.log('Hugging Face API unavailable, using pattern matching fallback');
      }
    }

    // Option 2: Try local model (if available in production)
    const localSuggestions = await tryLocalModel(partial);
    if (localSuggestions.length > 0) {
      return localSuggestions;
    }

    // Option 3: Fallback to smart pattern matching
    return getPatternBasedSuggestions(partial);

  } catch (error) {
    console.error('All suggestion methods failed, using pattern matching:', error);
    return getPatternBasedSuggestions(partial);
  }
}

async function callHuggingFaceModel(partial: string, apiKey: string): Promise<string[]> {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-small",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `Complete this image question: "${partial}"`,
          parameters: {
            max_length: 50,
            num_return_sequences: 3,
            temperature: 0.7,
            do_sample: true,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Process and filter Hugging Face responses
    const suggestions = data[0]?.generated_text
      ? [data[0].generated_text.trim()]
      : [];

    return suggestions
      .filter(s => s.length > partial.length && s.length <= 100)
      .slice(0, 3);

  } catch (error) {
    console.error('Hugging Face model error:', error);
    return [];
  }
}

async function tryLocalModel(partial: string): Promise<string[]> {
  try {
    // This would call your local model if deployed as a separate service
    const localApiUrl = process.env.LOCAL_MODEL_API_URL;
    
    if (!localApiUrl) {
      return [];
    }

    const response = await fetch(`${localApiUrl}/suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: partial })
    });

    if (!response.ok) {
      throw new Error('Local model unavailable');
    }

    const data = await response.json();
    return data.suggestions || [];

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('Local model not available:', errorMessage);
    return [];
  }
}

function getPatternBasedSuggestions(partial: string): string[] {
  const lower = partial.toLowerCase();
  
  // Smart pattern matching for common image questions
  const patterns = {
    'what': [
      'What objects are in this image?',
      'What is the main subject of this image?',
      'What colors are most prominent?',
      'What is happening in this scene?',
      'What text can you read?'
    ],
    'how': [
      'How many people are in this image?',
      'How many objects can you count?',
      'How would you describe the lighting?',
      'How old does this appear to be?'
    ],
    'where': [
      'Where was this photo taken?',
      'Where is the main focus?',
      'Where do you see text?'
    ],
    'describe': [
      'Describe the scene in detail',
      'Describe the main subject',
      'Describe the background',
      'Describe the colors and lighting'
    ],
    'identify': [
      'Identify all objects in this image',
      'Identify the main subject',
      'Identify any text visible',
      'Identify the setting or location'
    ],
    'count': [
      'Count the number of people',
      'Count the objects visible',
      'Count how many items you see'
    ],
    'read': [
      'Read any text in this image',
      'Read the signs or labels',
      'Read what is written here'
    ]
  };

  // Find matching patterns
  for (const [key, suggestions] of Object.entries(patterns)) {
    if (lower.startsWith(key) || lower.includes(key)) {
      return suggestions
        .filter(s => 
          s.toLowerCase().startsWith(lower) || 
          s.toLowerCase().includes(lower)
        )
        .slice(0, 3);
    }
  }

  // Default suggestions
  return [
    `${partial} do you see in this image?`,
    `${partial} is the main focus here?`,
    `${partial} can you identify?`
  ].filter(s => s.length <= 100).slice(0, 3);
} 