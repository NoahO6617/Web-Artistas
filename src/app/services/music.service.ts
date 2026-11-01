
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, timeout, forkJoin, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  MusicItem,
  MusicSearchResponse,
  SearchFilter
} from '../models/music.model';

export interface TheAudioDbArtist {
  idArtist: string;
  strArtist: string;

  strArtistThumb?: string | null;
  strArtistFanart?: string | null;
  strArtistLogo?: string | null;

  strGenre?: string | null;
  strStyle?: string | null;
  strCountry?: string | null;

  intFormedYear?: string | null;
  strBiography?: string | null;
  strBiographyEN?: string | null;
  strBiographyES?: string | null;

  strWebsite?: string | null;
  strFacebook?: string | null;
  strTwitter?: string | null;
  strMood?: string | null;
}
export interface TheAudioDbAlbum {
  idAlbum: string;
  strAlbum: string;
  strArtist?: string | null;
  idArtist?: string | null;
  intYearReleased?: string | null;
  strAlbumThumb?: string | null;
  strDescriptionEN?: string | null;
  strGenre?: string | null;
}

export interface TheAudioDbTrack {
  idTrack: string;
  strTrack: string;
  strArtist?: string | null;
  strAlbum?: string | null;
  idAlbum?: string | null;
  idArtist?: string | null;
  strTrackThumb?: string | null;
  intDuration?: string | null;
  strGenre?: string | null;
  strDescriptionEN?: string | null;
  strMusicVid?: string | null;
}

interface ArtistResponse {
  artists?: TheAudioDbArtist[] | null;
}

interface AlbumResponse {
  album?: TheAudioDbAlbum[] | null;
}

interface TrackResponse {
  track?: TheAudioDbTrack[] | null;
}

interface LovedTrackResponse {
  loved?: TheAudioDbTrack[] | null;
}

@Injectable({ providedIn: 'root' })
export class MusicService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.theAudioDb.baseUrl;

  private request<T>(endpoint: string, params: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params }).pipe(
      timeout(10000)
    );
  }

  private param(key: string, value: string): HttpParams {
    return new HttpParams().set(key, value);
  }

  getArtist(id: string): Observable<TheAudioDbArtist | null> {
    return this.request<ArtistResponse>(
      'artist.php',
      this.param('i', id)
    ).pipe(
      map(response => response.artists?.[0] ?? null)
    );
  }

  getAlbum(id: string): Observable<TheAudioDbAlbum | null> {
    return this.request<AlbumResponse>(
      'album.php',
      this.param('m', id)
    ).pipe(
      map(response => response.album?.[0] ?? null)
    );
  }

  getTrack(id: string): Observable<TheAudioDbTrack | null> {
    return this.request<TrackResponse>(
      'track.php',
      this.param('h', id)
    ).pipe(
      map(response => response.track?.[0] ?? null)
    );
  }

  searchArtists(query: string): Observable<MusicSearchResponse> {
    return this.request<ArtistResponse>(
      'search.php',
      this.param('s', query)
    ).pipe(
      map(response => {
        const artists = response.artists ?? [];

        return {
          total: artists.length,
          results: artists.map(artist => ({
            id: artist.idArtist,
            title: artist.strArtist,
            subtitle: [
              artist.strGenre || artist.strStyle,
              artist.strCountry
            ].filter(Boolean).join(' · ') || 'Artista',
            type: 'artist' as const,
            image: artist.strArtistThumb || artist.strArtistFanart || undefined,
            year: artist.intFormedYear
              ? Number(artist.intFormedYear)
              : undefined
          }))
        };
      })
    );
  }

  searchAlbums(query: string): Observable<MusicSearchResponse> {
    return this.request<AlbumResponse>(
      'discography.php',
      this.param('s', query)
    ).pipe(
      map(response => {
        const albums = response.album ?? [];

        return {
          total: albums.length,
          results: albums.map(album => ({
            id: album.idAlbum,
            title: album.strAlbum,
            subtitle: album.strArtist || query,
            type: 'release' as const,
            image: album.strAlbumThumb || undefined,
            year: album.intYearReleased
              ? Number(album.intYearReleased)
              : undefined
          }))
        };
      })
    );
  }

  searchTracks(query: string): Observable<MusicSearchResponse> {
    return this.request<TrackResponse>(
      'track-top10.php',
      this.param('s', query)
    ).pipe(
      map(response => {
        const tracks = response.track ?? [];

        return {
          total: tracks.length,
          results: tracks.map(track => ({
            id: track.idTrack,
            title: track.strTrack,
            subtitle: [
              track.strArtist,
              track.strAlbum
            ].filter(Boolean).join(' · ') || query,
            type: 'track' as const,
            image: track.strTrackThumb || undefined,
            duration: track.intDuration
              ? Math.floor(Number(track.intDuration) / 1000)
              : undefined
          }))
        };
      })
    );
  }

  /** Álbumes publicados por un artista. */
  getArtistAlbums(artistName: string): Observable<MusicItem[]> {
    return this.searchAlbums(artistName).pipe(
      map(response => response.results)
    );
  }

  /** Canciones destacadas de un artista (endpoint gratuito de TheAudioDB). */
  getArtistTracks(artistName: string): Observable<MusicItem[]> {
    return this.searchTracks(artistName).pipe(
      map(response => response.results)
    );
  }

  /** Canciones que pertenecen a un álbum concreto. */
  getAlbumTracks(albumId: string): Observable<MusicItem[]> {
    return this.request<TrackResponse>(
      'track.php',
      this.param('m', albumId)
    ).pipe(
      map(response => (response.track ?? []).map(track => ({
        id: track.idTrack,
        title: track.strTrack,
        subtitle: [track.strArtist, track.strAlbum].filter(Boolean).join(' · ') || 'Canción',
        type: 'track' as const,
        image: track.strTrackThumb || undefined,
        duration: track.intDuration ? Math.floor(Number(track.intDuration) / 1000) : undefined
      })))
    );
  }

  getPopularTracks(): Observable<MusicItem[]> {
  const artists = [
    'Coldplay',
    'Adele',
    'Taylor Swift',
    'Ed Sheeran',
    'The Weeknd'
  ];

  const requests = artists.map(artist =>
    this.searchTracks(artist).pipe(
      map(response => response.results),
      catchError(error => {
        console.error(`Error cargando canciones de ${artist}:`, error);
        return of([]);
      })
    )
  );

  return forkJoin(requests).pipe(
    map(results => {
      const tracks = results.flat();
      const uniqueTracks = Array.from(
        new Map(tracks.map(track => [track.id, track])).values()
      );

      return uniqueTracks.slice(0, 8);
    })
  );
}

  search(query: string, filter: SearchFilter): Observable<MusicSearchResponse> {
    const cleanQuery = query.trim();

    if (!cleanQuery) {
      return new Observable(subscriber => {
        subscriber.next({ results: [], total: 0 });
        subscriber.complete();
      });
    }

    if (filter === 'artist' || filter === 'all') {
      return this.searchArtists(cleanQuery);
    }

    if (filter === 'release') {
      return this.searchAlbums(cleanQuery);
    }

    return this.searchTracks(cleanQuery);
  }
}
