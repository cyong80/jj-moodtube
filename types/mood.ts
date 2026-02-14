export interface SearchQueryTrack {
  title: string;
  artist: string;
}

export interface MoodAnalysis {
  mood: string;
  description: string;
  searchQuery: SearchQueryTrack[];
}

export interface VideoResult {
  id: string | undefined;
  title: string | undefined;
  channel: string | undefined;
  thumbnail: string | undefined;
  /** 조회 시 이미 확보한 youtubeSearchCache.id - 저장 시 재조회 생략용 (직렬화를 위해 string) */
  youtubeSearchCacheId?: string;
}

export interface MoodPlaylistResult extends MoodAnalysis {
  capturedImage: string | null;
  voicePrompt?: string;
  videos: VideoResult[];
}
