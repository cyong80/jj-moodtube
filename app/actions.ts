"use server";

import {GoogleGenAI} from '@google/genai';
import { google } from "googleapis";
const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

export async function getMoodPlaylist(base64Image: string) {
  try {
   
    const imageData = base64Image.split(",")[1];
    const result = await ai.models.generateContent({ 
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: "You are a professional Music DJ. Analyze the image and return a JSON object: { 'mood': 'string', 'description': 'string', 'searchQuery': 'string' }" },
            { inlineData: { data: imageData, mimeType: "image/jpeg" } },
            { text: "Analyze the mood of this person and their surroundings." },
            { text: "응답은 한글로 해줘" }
          ]
        }
      ]
    });

    const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const analysis = JSON.parse(textResponse.replace(/```json|```/g, ""));

    // const analysis = {
    //     mood: 'Pensive & Quiet',
    //     description: 'The image captures a person in an extremely dim, almost dark environment, likely late at night. Their face is faintly illuminated, suggesting they are looking at a screen, casting a soft glow. The expression is neutral, almost pensive, with a hint of weariness in the eyes, conveying a sense of quiet introspection or deep thought in solitude. The overall atmosphere is one of calm, serene darkness, perfect for winding down or focusing.',
    //     searchQuery: 'Lo-fi beats, ambient chill, late night introspection, deep focus instrumental, chillwave, downtempo, atmospheric background music'
    //   };

    console.log(analysis);
    // 유튜브 검색
    const ytRes = await youtube.search.list({
      part: ["snippet"],
      q: analysis.searchQuery,
      type: ["video"],
      videoCategoryId: "10",
      maxResults: 5,
    });

    return {
      ...analysis,
      capturedImage: base64Image,
      videos: ytRes.data.items?.map(item => ({
        id: item.id?.videoId,
        title: item.snippet?.title,
        channel: item.snippet?.channelTitle,
        thumbnail: item.snippet?.thumbnails?.high?.url
      }))
    };
  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("분석 중 오류가 발생했습니다.");
  }
}