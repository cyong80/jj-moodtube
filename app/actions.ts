"use server";

import {GoogleGenAI} from '@google/genai';
import { google } from "googleapis";
const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

 const score = (video: any, track:any) => {
    let score = 0
  
    if (video.channelTitle.includes("Topic")) score += 50
    if (/official/i.test(video.title)) score += 30
    if (video.title.includes(track.title)) score += 20
    if (video.title.includes(track.artist)) score += 20
    if (video.duration >= 120 && video.duration <= 360) score += 20
    if (/cover|live|remix|shorts/i.test(video.title)) score -= 40
  
    return score;
  }

export async function getMoodPlaylist(base64Image: string) {
  try {
   
    const imageData = base64Image.split(",")[1];
    const result = await ai.models.generateContent({ 
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: "당신은 전문 음악 DJ입니다. 이미지를 분석하고 다음 형식의 JSON 객체를 반환하세요: { 'mood': 'string', 'description': 'string', 'searchQuery': 'string' }" },
            { inlineData: { data: imageData, mimeType: "image/jpeg" } },
            { text: "이 사람의 감정과 주변 환경의 분위기를 분석해주세요." },
            { text: "분석 시 현재 날씨, 계절, 절기(입춘, 경칩, 청명 등), 기념일(크리스마스, 발렌타인데이, 추석 등)도 함께 고려하고 인물사진은 인물의 기분을 고려하고 그외는 이미지의 내용을 고려하여 더욱 적절한 음악을 추천할 수 있는 키워드 형태로 만들어줘" },
            { text: "searchQuery는 5개의 배열로 분석을 기반으로 추천할 수 있는 노래를 JSON 객체를 []{'title': '곡명', 'artist': '아티스트명'} 형태로 만들어줘" },
            { text: "응답은 한글로 해줘" }
          ]
        }
      ]
    });

    const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const analysis = JSON.parse(textResponse.replace(/```json|```/g, ""));

//     const analysis = {
//   mood: '신비로운, 몽환적인, 고요한',
//   description: '칠흑 같은 어둠 속, 저 멀리서 희미하게 빛나는 푸른 불빛이 신비롭고 몽환적인 분위기를 자아냅니다. 깊은 밤의 고요함 속에서 내면으로 침잠하는 듯한 느낌을 줍니다. 마치 미지의 공간에서 길을 찾거나, 깊은 생각에 잠기는 순간 같아요.',
//   searchQuery: '심야 감성 음악, 몽환적인 일렉트로닉, 고요한 딥 하우스, 우주 앰비언트 플레이리스트'
// };

    console.log(analysis);
    const videos: any[] = [];

    if(Array.isArray(analysis.searchQuery)) {
        for(const query of analysis.searchQuery) {
            const ytRes = await youtube.search.list({
                part: ["snippet"],
                q: `[${query.title}] [${query.artist}] topic`,
                type: ["video"],
                videoCategoryId: "10",
                videoEmbeddable: "true",
                maxResults: 5,
            });

            if(ytRes.data.items && ytRes.data.items.length > 0) {
                for(const item of ytRes.data.items) {
                    const s = score(item.snippet, query);
                 
                    if(s >= 50) {
                        videos.push(item);
                        break;
                    }
                }
            }
        }
    }
    // 유튜브 검색 (플레이리스트 제외)
    // const ytRes = await youtube.search.list({
    //   part: ["snippet"],
    //   q: `${analysis.searchQuery} -playlist`,
    //   type: ["video"],
    //   videoCategoryId: "10",
    //   videoEmbeddable: "true",
    //   maxResults: 5,

    // });

    return {
      ...analysis,
      capturedImage: base64Image,
      videos: videos.map(item => ({
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