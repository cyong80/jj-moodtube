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
            { text: "searchQuery는 유튜브 음악을 검색할 때 사용하는 검색어로, 최대 100자 이내로 해줘" },
            { text: "응답은 한글로 해줘" }
          ]
        }
      ]
    });

    const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const analysis = JSON.parse(textResponse.replace(/```json|```/g, ""));

    // const analysis = {
    //     mood: '고독하고 우울한 밤',
    //     description: '어두운 방 안, 베개에 기댄 채 깊은 생각에 잠겨 있거나 슬픔에 잠긴 듯한 얼굴입니다. 빛이 거의 없어 고독하고 침울한 분위기가 강조되며, 밤늦게까지 잠 못 이루는 듯한 모습에서 오는 복잡한 감정들이 느껴집니다.',
    //     searchQuery: '새벽 감성, 차분한 앰비언트, 우울한 발라드, 늦은 밤 플레이리스트, lo-fi 슬픔, 고독한 음악, 생각 많은 밤'
    //   };

    console.log(analysis);
    // 유튜브 검색
    const ytRes = await youtube.search.list({
      part: ["snippet"],
      q: analysis.searchQuery,
      type: ["video"],
     // videoCategoryId: "10",
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