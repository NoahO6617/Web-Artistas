export type MusicType = 'track' | 'artist' | 'release';
export type SearchFilter = 'all' | MusicType;

export interface MusicItem {
  id: string | number;
  title: string;
  subtitle: string;
  type: MusicType;
  image?: string;
  year?: number;
  duration?: number;
}

export interface MusicSearchResponse {
  results: MusicItem[];
  total: number;
}