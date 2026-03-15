"use server";

import { GoogleGenAI } from "@google/genai";
import { google, youtube_v3 } from "googleapis";
import { getServerSession } from "next-auth";
import type { MoodAnalysis, SearchQueryTrack, VideoResult } from "@/types/mood";
import type { MoodPlaylistResult } from "@/types/mood";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

const MIN_SCORE_THRESHOLD = 35;

function scoreVideo(
  snippet: youtube_v3.Schema$SearchResultSnippet,
  track: SearchQueryTrack,
): number {
  let score = 0;
  if (snippet.channelTitle?.includes("Topic")) score += 40;
  if (/official/i.test(snippet.title ?? "")) score += 25;
  if (snippet.title?.includes(track.title)) score += 25;
  if (snippet.title?.includes(track.artist)) score += 25;
  // duration은 search API에 없음 - videos.list에서만 조회 가능
  const duration = (snippet as { duration?: number }).duration;
  if (duration != null && duration >= 120 && duration <= 360) score += 15;
  // cover/live/remix는 다양성에 기여 - 패널티 완화
  if (/shorts/i.test(snippet.title ?? "")) score -= 30;
  if (/cover|live|remix/i.test(snippet.title ?? "")) score -= 15;
  return score;
}

async function analyzeWithGemini(
  contents: Parameters<typeof ai.models.generateContent>[0]["contents"],
): Promise<MoodAnalysis> {
  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
  });
  const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return JSON.parse(textResponse.replace(/```json|```/g, "")) as MoodAnalysis;
}

type YoutubeSearchItem = youtube_v3.Schema$SearchResult;

function getCacheKey(query: SearchQueryTrack): string {
  return `[${query.title}] [${query.artist}] topic`;
}

function cacheToYoutubeSearchItem(cache: {
  youtubeId: string | null;
  title: string | null;
  channel: string | null;
  thumbnail: string | null;
}): YoutubeSearchItem | null {
  if (!cache.youtubeId) return null;
  return {
    id: { videoId: cache.youtubeId },
    snippet: {
      title: cache.title ?? undefined,
      channelTitle: cache.channel ?? undefined,
      thumbnails: cache.thumbnail
        ? { high: { url: cache.thumbnail } }
        : undefined,
    },
  } as YoutubeSearchItem;
}

type VideoWithCacheId = { item: YoutubeSearchItem; youtubeSearchCacheId: bigint };

async function fetchVideosFromSearchQuery(
  searchQuery: SearchQueryTrack[],
): Promise<VideoWithCacheId[]> {
  const videos: VideoWithCacheId[] = [];

  const TARGET_VIDEO_COUNT = 10;

  for (const query of searchQuery) {
    if (videos.length >= TARGET_VIDEO_COUNT) break;

    const cacheKey = getCacheKey(query);

    // 1. 캐시 조회
    const cached = await prisma.youtubeSearchCache.findUnique({
      where: { searchQuery: cacheKey },
    });

    if (cached) {
      const item = cacheToYoutubeSearchItem(cached);
      if (item) videos.push({ item, youtubeSearchCacheId: cached.id });
      continue;
    }

    // 2. 캐시 미스 시 YouTube API 호출
    const ytRes = await youtube.search.list({
      part: ["snippet"],
      q: cacheKey,
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
        // 3. 결과를 캐시에 저장 (upsert 반환값으로 id 확보)
        const videoId = item.id?.videoId ?? null;
        const cache = await prisma.youtubeSearchCache.upsert({
          where: { searchQuery: cacheKey },
          create: {
            searchQuery: cacheKey,
            youtubeId: videoId,
            title: snippet.title ?? null,
            channel: snippet.channelTitle ?? null,
            thumbnail: snippet.thumbnails?.high?.url ?? null,
          },
          update: {
            youtubeId: videoId,
            title: snippet.title ?? null,
            channel: snippet.channelTitle ?? null,
            thumbnail: snippet.thumbnails?.high?.url ?? null,
          },
        });
        videos.push({ item, youtubeSearchCacheId: cache.id });
        break;
      }
    }
  }
  return videos;
}

function mapToVideoResult(
  { item, youtubeSearchCacheId }: VideoWithCacheId
): VideoResult {
  const videoId = item.id?.videoId ?? undefined;
  const snippet = item.snippet;
  return {
    id: videoId ?? undefined,
    title: snippet?.title ?? undefined,
    channel: snippet?.channelTitle ?? undefined,
    thumbnail: snippet?.thumbnails?.high?.url ?? undefined,
    youtubeSearchCacheId: youtubeSearchCacheId.toString(),
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
            text: `당신은 전문 음악 큐레이터입니다. 이미지를 분석하고 반드시 다음 형식의 JSON 객체를 반환하세요: { 'mood': 'string', 'description': 'string', 'searchQuery': [{'title': '곡명', 'artist': '아티스트명'}] }`,
          },
          { inlineData: { data: imageData, mimeType: "image/jpeg" } },
          { text: "이 사람의 감정과 주변 환경의 분위기를 분석해주세요." },
          {
            text: `분석 시 현재 날씨, 계절, 절기(입춘, 경칩, 청명 등), 기념일(크리스마스, 발렌타인데이, 추석 등)도 함께 고려하세요. 인물사진은 인물의 기분, 그 외는 이미지 내용을 고려하세요.

searchQuery는 18~20곡의 배열로, **가능한 한 다양한** 노래를 추천해주세요:
- 장르 다양화: 팝, 발라드, 록, 인디, R&B, 힙합, 재즈, 클래식, K-pop, 트로트, 일렉트로닉 등 섞어서
- 시대 다양화: 80~90년대 곡, 2000년대, 2010년대, 최신 곡을 골고루
- 언어 다양화: 한국어, 영어, 일본어 등 혼합
- 아티스트 다양화: 메이저·인디·대중·닉치 아티스트 혼합
- 분위기 변주: 같은 기분이라도 밝은 곡·잔잔한 곡·신나는 곡 등 다양한 톤
중복하거나 비슷한 느낌의 곡은 피하고, 한 아티스트당 1곡 이하로 추천하세요. 응답은 한글로 해주세요.`,
          },
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
            text: `당신은 전문 음악 큐레이터입니다. 사용자의 음성/텍스트를 분석하고 반드시 다음 형식의 JSON 객체를 반환하세요: { 'mood': 'string', 'description': 'string', 'searchQuery': [{'title': '곡명', 'artist': '아티스트명'}] }

사용자가 말한 내용:
"${text}"

위 내용에서 사용자의 기분, 감정, 원하는 분위기, 상황 등을 분석해주세요. 현재 날씨, 계절, 절기, 기념일도 고려하세요.

searchQuery는 18~20곡의 배열로, **가능한 한 다양한** 노래를 추천해주세요:
- 장르 다양화: 팝, 발라드, 록, 인디, R&B, 힙합, 재즈, K-pop, 일렉트로닉 등 섞어서
- 시대 다양화: 80~90년대, 2000년대, 최신 곡을 골고루
- 언어 다양화: 한국어, 영어, 일본어 등 혼합
- 아티스트 다양화: 메이저·인디·대중·닉치 아티스트 혼합
- 분위기 변주: 같은 기분이라도 밝은 곡·잔잔한 곡·신나는 곡 등 다양한 톤
중복하거나 비슷한 느낌의 곡은 피하고, 한 아티스트당 1곡 이하로 추천하세요. 응답은 한글로 해주세요.`,
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

export async function getMoodPlaylistFromAudio(
  base64Audio: string,
  mimeType: string,
) {
  try {
    const data = base64Audio.includes(",")
      ? base64Audio.split(",")[1]!
      : base64Audio;
    const acceptedMime = mimeType.split(";")[0] ?? "audio/webm";

    const analysis = await analyzeWithGemini([
      {
        role: "user",
        parts: [
          {
            text: `당신은 전문 음악 큐레이터입니다. 이 오디오는 사용자가 녹음한 음성입니다.
오디오에서 다음을 분석해주세요:
1. 말한 내용(전사)
2. 목소리 톤, 감정, 기분 (말하는 방식에서 느껴지는 감정)
3. 말한 내용과 목소리 톤을 종합한 최종 기분

반드시 다음 형식의 JSON 객체만 반환하세요: { 'mood': 'string', 'description': 'string', 'searchQuery': [{'title': '곡명', 'artist': '아티스트명'}] }
description에는 말한 내용과 목소리에서 느껴진 기분을 함께 설명해주세요.

searchQuery는 18~20곡의 배열로, **가능한 한 다양한** 노래를 추천해주세요:
- 장르 다양화: 팝, 발라드, 록, 인디, R&B, 힙합, 재즈, K-pop 등 섞어서
- 시대 다양화: 80~90년대, 2000년대, 최신 곡을 골고루
- 언어 다양화: 한국어, 영어, 일본어 등 혼합
- 아티스트 다양화: 메이저·인디·대중 아티스트 혼합
- 분위기 변주: 같은 기분이라도 밝은 곡·잔잔한 곡·신나는 곡 등 다양한 톤
중복하거나 비슷한 느낌의 곡은 피하고, 한 아티스트당 1곡 이하로 추천하세요. 응답은 한글로 해주세요.`,
          },
          { inlineData: { data, mimeType: acceptedMime } },
        ],
      },
    ]);

    const rawVideos = Array.isArray(analysis.searchQuery)
      ? await fetchVideosFromSearchQuery(analysis.searchQuery)
      : [];

    return {
      ...analysis,
      capturedImage: null,
      voicePrompt: analysis.description ?? "(녹음된 음성)",
      videos: rawVideos.map(mapToVideoResult),
    };
  } catch (error) {
    console.error("Audio Analysis Error:", error);
    throw new Error("오디오 분석 중 오류가 발생했습니다.");
  }
}

/**
 * YYYY-MM-DD 문자열을 Date로 변환 (타임존 없이 날짜만 사용)
 */
function parseDateOnly(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
}

export async function saveMoodResult(
  result: MoodPlaylistResult,
  /** 클라이언트 기준 오늘 날짜 (YYYY-MM-DD). 타임존 이슈 방지용 */
  dateStr?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    const userId = session.user.email;
    const dateOnly = dateStr
      ? parseDateOnly(dateStr)
      : new Date(Date.UTC(
          new Date().getUTCFullYear(),
          new Date().getUTCMonth(),
          new Date().getUTCDate()
        ));

    const todayCount = await prisma.moodTubeResult.count({
      where: { userId, date: dateOnly },
    });
    if (todayCount >= 5) {
      return { success: false, error: "하루에 5개까지만 저장할 수 있습니다." };
    }

    const videosWithId = result.videos.filter(
      (v): v is typeof v & { id: string } => !!v.id
    );
    if (videosWithId.length === 0) {
      return { success: false, error: "저장할 영상이 없습니다." };
    }

    const cacheIds: bigint[] = [];
    for (const video of videosWithId) {
      // 조회 시 이미 확보한 youtubeSearchCacheId가 있으면 재조회 생략
      if (video.youtubeSearchCacheId != null && video.youtubeSearchCacheId !== "") {
        cacheIds.push(BigInt(video.youtubeSearchCacheId));
        continue;
      }
      let cache = await prisma.youtubeSearchCache.findFirst({
        where: { youtubeId: video.id },
      });
      if (!cache) {
        const searchQuery = `[saved:${video.id}]`;
        cache = await prisma.youtubeSearchCache.upsert({
          where: { searchQuery },
          create: {
            searchQuery,
            youtubeId: video.id,
            title: video.title ?? null,
            channel: video.channel ?? null,
            thumbnail: video.thumbnail ?? null,
          },
          update: {},
        });
      }
      cacheIds.push(cache.id);
    }

    await prisma.moodTubeResult.create({
      data: {
        userId,
        date: dateOnly,
        mood: result.mood,
        description: result.description,
        videos: {
          create: cacheIds.map((youtubeSearchCacheId) => ({
            youtubeSearchCacheId,
          })),
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Save Mood Error:", error);
    return {
      success: false,
      error: "저장 중 오류가 발생했습니다.",
    };
  }
}

export async function getSavedMoodResults(
  /** 조회할 날짜 (YYYY-MM-DD). 클라이언트에서 format(date, 'yyyy-MM-dd')로 전달 */
  dateStr: string
): Promise<MoodPlaylistResult[]> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return [];
    }

    const dateOnly = parseDateOnly(dateStr);

    const results = await prisma.moodTubeResult.findMany({
      where: {
        userId: session.user.email,
        date: dateOnly,
      },
      include: {
        videos: {
          include: {
            youtubeSearchCache: true,
          },
          orderBy: { id: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return results.map((r) => ({
      mood: r.mood,
      description: r.description,
      searchQuery: [],
      capturedImage: null,
      videos: r.videos
        .map((v) => v.youtubeSearchCache)
        .filter((c): c is NonNullable<typeof c> => c != null && c.youtubeId != null)
        .map((c) => ({
          id: c.youtubeId ?? undefined,
          title: c.title ?? undefined,
          channel: c.channel ?? undefined,
          thumbnail: c.thumbnail ?? undefined,
          youtubeSearchCacheId: c.id.toString(),
        })),
    }));
  } catch (error) {
    console.error("Get Saved Mood Error:", error);
    return [];
  }
}

/** 좋아요한 노래 목록 전체 (플레이리스트용) */
export async function getLikedVideos(): Promise<MoodPlaylistResult | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;

    const likes = await prisma.moodTubeLike.findMany({
      where: { userId: session.user.email },
      include: {
        youtubeSearchCache: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const videos = likes
      .map((l) => l.youtubeSearchCache)
      .filter((c): c is NonNullable<typeof c> => c != null && c.youtubeId != null)
      .map((c) => ({
        id: c.youtubeId ?? undefined,
        title: c.title ?? undefined,
        channel: c.channel ?? undefined,
        thumbnail: c.thumbnail ?? undefined,
        youtubeSearchCacheId: c.id.toString(),
      }));

    if (videos.length === 0) return null;

    return {
      mood: "좋아요한 노래",
      description: "마음에 든 곡들을 모아봤어요",
      searchQuery: [],
      capturedImage: null,
      videos,
    };
  } catch (error) {
    console.error("Get Liked Videos Error:", error);
    return null;
  }
}

/** 현재 사용자가 좋아요한 youtube_search_cache.id 목록 */
export async function getLikedCacheIds(): Promise<string[]> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return [];

    const likes = await prisma.moodTubeLike.findMany({
      where: { userId: session.user.email },
      select: { youtubeSearchCacheId: true },
    });
    return likes.map((l) => l.youtubeSearchCacheId.toString());
  } catch (error) {
    console.error("Get Liked Cache Ids Error:", error);
    return [];
  }
}

/** 영상 좋아요 토글. youtubeSearchCacheId 필요. */
export async function toggleLike(
  youtubeSearchCacheId: string
): Promise<{ success: boolean; liked: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, liked: false, error: "로그인이 필요합니다." };
    }

    const cacheId = BigInt(youtubeSearchCacheId);
    const existing = await prisma.moodTubeLike.findUnique({
      where: {
        userId_youtubeSearchCacheId: {
          userId: session.user.email,
          youtubeSearchCacheId: cacheId,
        },
      },
    });

    if (existing) {
      await prisma.moodTubeLike.delete({
        where: { id: existing.id },
      });
      return { success: true, liked: false };
    }

    await prisma.moodTubeLike.create({
      data: {
        userId: session.user.email,
        youtubeSearchCacheId: cacheId,
      },
    });
    return { success: true, liked: true };
  } catch (error) {
    console.error("Toggle Like Error:", error);
    return {
      success: false,
      liked: false,
      error: "좋아요 처리 중 오류가 발생했습니다.",
    };
  }
}
