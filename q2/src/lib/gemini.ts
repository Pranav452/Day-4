export interface GeminiRequest {
  image: string; // base64 encoded image
  question: string;
}

export interface GeminiResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export async function callGeminiVision(imageData: string, question: string): Promise<GeminiResponse> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not found. Please set GEMINI_API_KEY in your environment variables.');
    }

    // Convert base64 image to proper format for Gemini
    const base64Data = imageData.includes('base64,') 
      ? imageData.split('base64,')[1] 
      : imageData;

    // Detect mime type from base64 data or default to jpeg
    let mimeType = "image/jpeg";
    if (imageData.includes('data:image/')) {
      const mimeMatch = imageData.match(/data:image\/([^;]+)/);
      if (mimeMatch) {
        mimeType = `image/${mimeMatch[1]}`;
      }
    }

    const requestBody = {
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            },
            {
              text: question
            }
          ]
        }
      ]
    };

    // Using the newer Gemini 1.5 Flash model (faster and better than deprecated pro-vision)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error?.message || 
        `Gemini API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    
    // Handle the response structure
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        return {
          success: true,
          data: candidate.content.parts[0].text
        };
      }
    }

    // Handle cases where no valid response is generated
    if (data.candidates && data.candidates[0] && data.candidates[0].finishReason) {
      const finishReason = data.candidates[0].finishReason;
      if (finishReason === 'SAFETY') {
        throw new Error('Content was blocked due to safety filters. Try rephrasing your question.');
      } else if (finishReason === 'RECITATION') {
        throw new Error('Content was blocked due to recitation concerns. Try a different image or question.');
      }
    }

    throw new Error('No valid response generated. Please try a different image or question.');

  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert image to base64'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
} 