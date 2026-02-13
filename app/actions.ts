"use server";

import { GoogleGenAI } from "@google/genai";
import { google, youtube_v3 } from "googleapis";
import type { MoodAnalysis, SearchQueryTrack, VideoResult } from "@/types/mood";

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

const MIN_SCORE_THRESHOLD = 50;

function scoreVideo(snippet: youtube_v3.Schema$SearchResultSnippet, track: SearchQueryTrack): number {
  let score = 0;
  if (snippet.channelTitle?.includes("Topic")) score += 50;
  if (/official/i.test(snippet.title ?? "")) score += 30;
  if (snippet.title?.includes(track.title)) score += 20;
  if (snippet.title?.includes(track.artist)) score += 20;
  // duration은 search API에 없음 - videos.list에서만 조회 가능
  const duration = (snippet as { duration?: number }).duration;
  if (duration != null && duration >= 120 && duration <= 360) score += 20;
  if (/cover|live|remix|shorts/i.test(snippet.title ?? "")) score -= 40;
  return score;
}

async function analyzeWithGemini(contents: Parameters<typeof ai.models.generateContent>[0]["contents"]): Promise<MoodAnalysis> {
  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
  });
  const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return JSON.parse(textResponse.replace(/```json|```/g, "")) as MoodAnalysis;
}

type YoutubeSearchItem = youtube_v3.Schema$SearchResult;

async function fetchVideosFromSearchQuery(searchQuery: SearchQueryTrack[]): Promise<YoutubeSearchItem[]> {
  const videos: YoutubeSearchItem[] = [];

  for (const query of searchQuery) {
    const ytRes = await youtube.search.list({
      part: ["snippet"],
      q: `[${query.title}] [${query.artist}] topic`,
      type: ["video"],
      videoCategoryId: "10",
      videoEmbeddable: "true",
      maxResults: 5,
    });

    const items = ytRes.data.items ?? [];
    for (const item of items) {
      const snippet = item.snippet;
      if (!snippet) continue;

      const s = scoreVideo(snippet, query);
      if (s >= MIN_SCORE_THRESHOLD) {
        videos.push(item);
        break;
      }
    }
  }
  return videos;
}

function mapToVideoResult(item: YoutubeSearchItem): VideoResult {
  const videoId = item.id?.videoId ?? undefined;
  const snippet = item.snippet;
  return {
    id: videoId ?? undefined,
    title: snippet?.title ?? undefined,
    channel: snippet?.channelTitle ?? undefined,
    thumbnail: snippet?.thumbnails?.high?.url ?? undefined,
  };
}

export async function getMoodPlaylist(base64Image: string) {
  try {
    const imageData = base64Image.split(",")[1];
    const analysis = await analyzeWithGemini([
      {
        role: "user",
        parts: [
          {
            text: "당신은 전문 음악 DJ입니다. 이미지를 분석하고 반드시 다음 형식의 JSON 객체를 반환하세요: { 'mood': 'string', 'description': 'string', 'searchQuery': []{'title': '곡명', 'artist': '아티스트명'} }",
          },
          { inlineData: { data: imageData, mimeType: "image/jpeg" } },
          { text: "이 사람의 감정과 주변 환경의 분위기를 분석해주세요." },
          {
            text: "분석 시 현재 날씨, 계절, 절기(입춘, 경칩, 청명 등), 기념일(크리스마스, 발렌타인데이, 추석 등)도 함께 고려하고 인물사진은 인물의 기분을 고려하고 그외는 이미지의 내용을 고려하여 더욱 적절한 음악을 추천할 수 있는 키워드 형태로 만들어줘",
          },
          {
            text: "searchQuery는 5개의 배열로 분석을 기반으로 추천할 수 있는 노래를 JSON 객체를 []{'title': '곡명', 'artist': '아티스트명'} 형태로 만들어줘",
          },
          { text: "응답은 한글로 해줘" },
        ],
      },
    ]);

    const rawVideos = Array.isArray(analysis.searchQuery)
      ? await fetchVideosFromSearchQuery(analysis.searchQuery)
      : [];

    return {
      ...analysis,
      capturedImage: base64Image,
      videos: rawVideos.map(mapToVideoResult),
    };
  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("분석 중 오류가 발생했습니다.");
  }
}

export async function getMoodPlaylistFromText(text: string) {
  try {
    const analysis = await analyzeWithGemini([
      {
        role: "user",
        parts: [
          {
            text: `당신은 전문 음악 DJ입니다. 사용자의 음성/텍스트를 분석하고 반드시 다음 형식의 JSON 객체를 반환하세요: { 'mood': 'string', 'description': 'string', 'searchQuery': [{'title': '곡명', 'artist': '아티스트명'}] }

사용자가 말한 내용:
"${text}"

위 내용에서 사용자의 기분, 감정, 원하는 분위기, 상황 등을 분석해주세요. 현재 날씨, 계절, 절기, 기념일도 고려하여 적절한 음악을 추천할 수 있는 searchQuery를 5개의 배열로 만들어주세요. 각 항목은 {'title': '곡명', 'artist': '아티스트명'} 형태로 작성해주세요. 응답은 한글로 해주세요.`,
          },
        ],
      },
    ]);

    const rawVideos = Array.isArray(analysis.searchQuery)
      ? await fetchVideosFromSearchQuery(analysis.searchQuery)
      : [];

    return {
      ...analysis,
      capturedImage: null,
      voicePrompt: text,
      videos: rawVideos.map(mapToVideoResult),
    };
  } catch (error) {
    console.error("Voice Analysis Error:", error);
    throw new Error("분석 중 오류가 발생했습니다.");
  }
}
