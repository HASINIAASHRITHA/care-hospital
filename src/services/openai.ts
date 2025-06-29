import { useToast } from '@/hooks/use-toast';

// Types for symptom analysis
export interface SymptomAnalysisRequest {
  symptoms: string;
  age?: number;
  gender?: string;
  additionalInfo?: string;
}

export interface SymptomAnalysisResult {
  possibleConditions: string[];
  recommendedDepartment: string;
  urgencyLevel: 'mild' | 'moderate' | 'emergency';
  description: string;
  precautions: string[];
  followUpRecommendation: string;
}

// OpenAI API integration
export const analyzeSymptoms = async (request: SymptomAnalysisRequest): Promise<SymptomAnalysisResult> => {
  try {
    const { symptoms, age, gender, additionalInfo } = request;
    
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is missing');
    }
    
    // Format the prompt with structured patient information
    const userPrompt = `
      A patient reports: "${symptoms}"
      ${age ? `Age: ${age}` : ''}
      ${gender ? `Gender: ${gender}` : ''}
      ${additionalInfo ? `Additional information: ${additionalInfo}` : ''}
      
      Based on these symptoms, please provide:
      1. Possible conditions (most likely first)
      2. Recommended department to visit
      3. Urgency level (mild/moderate/emergency)
      4. Brief description of what might be happening
      5. Precautions the patient should take
      6. Follow-up recommendations
      
      Format your response as a JSON object with the following structure:
      {
        "possibleConditions": ["condition1", "condition2", ...],
        "recommendedDepartment": "department name",
        "urgencyLevel": "mild/moderate/emergency",
        "description": "description text",
        "precautions": ["precaution1", "precaution2", ...],
        "followUpRecommendation": "recommendation text"
      }
    `;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a medical AI assistant that helps with preliminary symptom analysis. Provide your answers in the requested JSON format. Always include a disclaimer that this is not a replacement for professional medical advice.'
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const resultText = data.choices[0]?.message?.content;
    
    if (!resultText) {
      throw new Error('No analysis result returned from the AI');
    }

    // Parse JSON from the response text
    // We extract just the JSON part in case the AI returns additional text
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response as JSON');
    }
    
    const result: SymptomAnalysisResult = JSON.parse(jsonMatch[0]);
    return result;

  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    throw error;
  }
};

// Save symptom check results to Firebase (optional)
export const saveSymptomCheck = async (userId: string, symptoms: string, result: SymptomAnalysisResult) => {
  try {
    // Implementation for saving to Firebase would go here
    console.log('Saving symptom check to Firebase:', { userId, symptoms, result });
    // For now, we're just logging the data
    return true;
  } catch (error) {
    console.error('Error saving symptom check:', error);
    return false;
  }
};
