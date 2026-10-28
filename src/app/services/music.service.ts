import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { MusicItem, MusicSearchResponse, SearchFilter } from '../models/music.model';

interface TheAudioDbArtist {
  idArtist: string;
  strArtist: string;
  strArtistThumb?: string | null;
  strArtistFanart?: string | null;
  strGenre?: string | null;
  strStyle?: string | null;
  intFormedYear?: string | null;
  strCountry?: string | null;
}
interface TheAudioDbAlbum {
  idAlbum: string;
  strAlbum: string;
  strArtist?: string | null;
  intYearReleased?: string | null;
  strAlbumThumb?: string | null;
}
interface TheAudioDbTrack {
  idTrack: string;
  strTrack: string;
  strArtist?: string | null;
  strAlbum?: string | null;
  strTrackThumb?: string | null;
  intDuration?: string | null;
}
interface ArtistResponse { artists?: TheAudioDbArtist[] | null; }
interface AlbumResponse { album?: TheAudioDbAlbum[] | null; }
interface TrackResponse { track?: TheAudioDbTrack[] | null; }

@Injectable({ providedIn: 'root' })
export class MusicService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.theAudioDb.baseUrl;

  private params(key: string, value: string): HttpParams {
    return new HttpParams().set(key, value);
  }

  searchArtists(query: string): Observable<MusicSearchResponse> {
    return this.http.get<ArtistResponse>(
      `${this.baseUrl}/search.php`,
      { params: this.params('s', query) }
    ).pipe(
      map(response => {
        const artists = response.artists ?? [];
        return {
          total: artists.length,
          results: artists.map(artist => ({
            id: artist.idArtist,
            title: artist.strArtist,
            subtitle: [artist.strGenre || artist.strStyle, artist.strCountry]
              .filter(Boolean).join(' · ') || 'Artista',
            type: 'artist' as const,
            image: artist.strArtistThumb || artist.strArtistFanart || undefined,
            year: artist.intFormedYear ? Number(artist.intFormedYear) : undefined
          }))
        };
      })
    );
  }

  // La API gratuita permite consultar la discografía a partir del nombre del artista.
  searchAlbums(query: string): Observable<MusicSearchResponse> {
    return this.http.get<AlbumResponse>(
      `${this.baseUrl}/discography.php`,
      { params: this.params('s', query) }
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
            year: album.intYearReleased ? Number(album.intYearReleased) : undefined
          }))
        };
      })
    );
  }

  // Devuelve las canciones destacadas del artista; no es una búsqueda global por título.
  searchTracks(query: string): Observable<MusicSearchResponse> {
    return this.http.get<TrackResponse>(
      `${this.baseUrl}/track-top10.php`,
      { params: this.params('s', query) }
    ).pipe(
      map(response => {
        const tracks = response.track ?? [];
        return {
          total: tracks.length,
          results: tracks.map(track => ({
            id: track.idTrack,
            title: track.strTrack,
            subtitle: [track.strArtist, track.strAlbum].filter(Boolean).join(' · ') || query,
            type: 'track' as const,
            image: track.strTrackThumb || undefined,
            duration: track.intDuration ? Math.floor(Number(track.intDuration) / 1000) : undefined
          }))
        };
      })
    );
  }

  search(query: string, filter: SearchFilter): Observable<MusicSearchResponse> {
    const q = query.trim();
    if (!q) return of({ results: [], total: 0 });

    if (filter === 'artist') return this.searchArtists(q);
    if (filter === 'release') return this.searchAlbums(q);
    if (filter === 'track') return this.searchTracks(q);

    // Para "Todo" mostramos artistas. La API gratuita no ofrece una búsqueda
    // global gratuita de canciones y álbumes por cualquier texto.
    return this.searchArtists(q);
  }
}
