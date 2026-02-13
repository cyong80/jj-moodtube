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
}

export interface MoodPlaylistResult extends MoodAnalysis {
  capturedImage: string | null;
  voicePrompt?: string;
  videos: VideoResult[];
}
