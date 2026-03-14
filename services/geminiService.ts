

import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AIRecommendation } from "../types";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in the environment.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeMood = async (moodText: string, language: string = 'English'): Promise<AIRecommendation> => {
  const ai = getAI();

  let languageSpecificInstructions = "";
  if (language === 'Hindi') {
    languageSpecificInstructions = `
    - For Hindi: Do NOT just suggest romantic songs. Match the actual vibe of the description (e.g., if it's energetic, give high-energy tracks; if it's travel, give travel anthems).
    - You can include 1-2 popular Punjabi tracks that are currently trending in the Hindi music scene as they are often paired.
    - Focus on current trending artists like Arijit Singh, Jubin Nautiyal, King, Badshah, and indie artists like Anuv Jain.`;
  } else if (language === 'Bengali') {
    languageSpecificInstructions = `
    - For Bengali: Focus on a mix of modern hits and aesthetic indie/folk-pop.
    - Prioritize artists like Anupam Roy, Shreya Ghoshal, Fossils, and Sahana Bajpaie.
    - Ensure the songs match the specific 'aesthetic' or 'mood' of the description.`;
  } else if (language === 'Punjabi') {
    languageSpecificInstructions = `
    - For Punjabi: Focus on current trending hits from artists like AP Dhillon, Talwiinder, Shubh, and Diljit Dosanjh.`;
  }

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a world-class music curator. Analyze the following mood description and curate a list of 10 tracks that perfectly capture this emotional landscape. Think like someone choosing the absolute best suitable song for an Instagram Story or Status.
    
    Mood: "${moodText}"
    Preferred Language: "${language}"
    
    CRITICAL: You MUST ONLY provide tracks that are in the "${language}" language. If the language is "Mix", you can provide a variety, but limit Punjabi songs to only 1 or 2.
    
    ${languageSpecificInstructions}
    
    1. Identify a primary "vibe" keyword.
    2. Provide 10 real, popular, and trending tracks strictly in the "${language}" language that are the "best suitable" for this mood.
    3. For each track, write a compelling 1-sentence explanation of how it complements the specific emotions or setting in the user's description.
    4. Include 2-3 specific tags per song (e.g., "Mellow", "High Energy", "Lyrical").
    5. Provide a "30-second main lyric snippet" (the most iconic or relevant lines) for each song.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          vibe: { type: Type.STRING },
          suggestedTags: { type: Type.ARRAY, items: { type: Type.STRING } },
          description: { type: Type.STRING },
          recommendedTracks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                artist: { type: Type.STRING },
                whyMatch: { type: Type.STRING },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                spotifyId: { type: Type.STRING, description: "Spotify Track ID" },
                lyricsSnippet: { type: Type.STRING, description: "30-second main lyric snippet" }
              },
              required: ["title", "artist", "whyMatch", "tags", "lyricsSnippet"]
            }
          }
        },
        required: ["vibe", "suggestedTags", "description", "recommendedTracks"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    throw new Error("Invalid response from AI");
  }
};

export const analyzePhoto = async (base64Image: string, language: string = 'English'): Promise<AIRecommendation> => {
  const ai = getAI();

  let languageSpecificInstructions = "";
  if (language === 'Hindi') {
    languageSpecificInstructions = `
    - For Hindi: Do NOT just suggest romantic songs. Match the actual visual vibe of the photo (e.g., if it's a party photo, give party songs; if it's a nature photo, give soulful/travel tracks).
    - You can include 1-2 popular Punjabi tracks that are currently trending in the Hindi music scene.
    - Focus on current trending artists like Arijit Singh, Jubin Nautiyal, King, Badshah, and indie artists like Anuv Jain.`;
  } else if (language === 'Bengali') {
    languageSpecificInstructions = `
    - For Bengali: Focus on a mix of modern hits and aesthetic indie/folk-pop.
    - Prioritize artists like Anupam Roy, Shreya Ghoshal, Fossils, and Sahana Bajpaie.
    - Ensure the songs match the specific 'aesthetic' or 'mood' of the photo.`;
  } else if (language === 'Punjabi') {
    languageSpecificInstructions = `
    - For Punjabi: Focus on current trending hits from artists like AP Dhillon, Talwiinder, Shubh, and Diljit Dosanjh.`;
  }

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image.split(',')[1] } },
        { text: `As a visual-to-audio expert, analyze the lighting, composition, and 'feel' of this photo. 
        CRITICAL: Suggest 10 real, popular, and trending songs STRICTLY in the "${language}" language that act as the perfect, "best suitable" soundtrack for this visual aesthetic. 
        If the language is "Mix", limit Punjabi songs to only 1 or 2.
        
        ${languageSpecificInstructions}
        
        Think like someone choosing the perfect song for an Instagram Story or Status that makes the photo truly come alive.
        For each, explain the visual-audio connection, provide relevant tags, and include a '30-second main lyric snippet' (the most iconic lines).` }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          vibe: { type: Type.STRING },
          suggestedTags: { type: Type.ARRAY, items: { type: Type.STRING } },
          description: { type: Type.STRING },
          recommendedTracks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                artist: { type: Type.STRING },
                whyMatch: { type: Type.STRING },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                spotifyId: { type: Type.STRING, description: "Spotify Track ID" },
                lyricsSnippet: { type: Type.STRING, description: "30-second main lyric snippet" }
              },
              required: ["title", "artist", "whyMatch", "tags", "lyricsSnippet"]
            }
          }
        },
        required: ["vibe", "suggestedTags", "description", "recommendedTracks"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    throw new Error("Invalid response from AI");
  }
};
