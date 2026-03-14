
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export enum Language {
  HINDI = 'Hindi',
  ENGLISH = 'English',
  BENGALI = 'Bengali',
  PUNJABI = 'Punjabi',
  MIX = 'Mix'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  savedSongs: string[];
  likedSongs: string[];
  spotifyToken?: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  vibe: string;
  language: Language;
  previewUrl: string;
  coverUrl: string;
  isTrending: boolean;
  createdBy: string;
  spotifyId?: string;
  lyricsSnippet?: string;
}

export interface RecommendedTrack {
  title: string;
  artist: string;
  whyMatch: string;
  tags: string[];
  spotifyId?: string;
  lyricsSnippet?: string;
  previewUrl?: string;
}

export interface AIRecommendation {
  vibe: string;
  suggestedTags: string[];
  description: string;
  recommendedTracks: RecommendedTrack[];
}
