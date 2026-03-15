
import { AIRecommendation } from "../types";

export const analyzeMood = async (moodText: string, language: string = 'English'): Promise<AIRecommendation> => {
  const response = await fetch("/api/analyze-mood", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ moodText, language })
  });

  if (!response.ok) {
    throw new Error("Failed to analyze mood");
  }

  return response.json();
};

export const analyzePhoto = async (base64Image: string, language: string = 'English'): Promise<AIRecommendation> => {
  const response = await fetch("/api/analyze-photo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ base64Image, language })
  });

  if (!response.ok) {
    throw new Error("Failed to analyze photo");
  }

  return response.json();
};
