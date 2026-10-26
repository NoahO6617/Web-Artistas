import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map, of } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  MusicItem,
  MusicSearchResponse,
  SearchFilter
} from '../models/music.model';

interface ApiResponse<T> {
  results?: T[];
  estimatedTotalItems?: number;
}

interface ApiArtist {
  id: number;
  name: string;
}

interface ApiTrack {
  id: number;
  title: string;
  duration?: number;
  artist?: ApiArtist;
  release?: { id: number; title: string };
}

interface ApiRelease {
  id: number;
  title: string;
  year?: number;
  type?: string;
  image?: string;
  artist?: ApiArtist;
}

@Injectable({ providedIn: 'root' })
export class MusicService {
  private readonly http = inject(HttpClient);
  private readonly config = environment.musicApi;
  private readonly baseUrl = this.config.baseUrl;

  private params(query: string, usage = false): HttpParams {
    let params = new HttpParams()
      .set('q', query)
      .set('country', this.config.country)
      .set('page', '1')
      .set('pageSize', '12');

    if (this.config.consumerKey) {
      params = params.set(
        'oauth_consumer_key',
        this.config.consumerKey
      );
    }

    if (usage) {
      params = params.set('usageTypes', this.config.usageTypes);
    }

    return params;
  }


searchTracks(query: string): Observable<MusicSearchResponse> {
  const token =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('spotify_access_token')
      : null;

  if (!token) {
    return of({ results: [], total: 0 });
  }

  const params = new HttpParams()
    .set('q', query)
    .set('type', 'track')
    .set('limit', '12')
    .set('market', 'ES');

  return this.http.get<any>(
    'https://api.spotify.com/v1/search',
    {
      params,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  ).pipe(
    map(response => {
      const tracks = response.tracks?.items ?? [];

      return {
        total: response.tracks?.total ?? tracks.length,
        results: tracks.map((track: any) => ({
          id: track.id,
          title: track.name,
          subtitle: track.artists
            .map((artist: any) => artist.name)
            .join(', '),
          type: 'track' as const,
          image: track.album?.images?.[0]?.url,
          duration: Math.floor(track.duration_ms / 1000)
        }))
      };
    })
  );
}


  searchArtists(query: string): Observable<MusicSearchResponse> {
    return this.http.get<ApiResponse<ApiArtist>>(
      `${this.baseUrl}/artist/search`,
      { params: this.params(query) }
    ).pipe(
      map(response => {
        const artists = response.results ?? [];

        return {
          total: response.estimatedTotalItems ?? artists.length,
          results: artists.map(artist => ({
            id: artist.id,
            title: artist.name,
            subtitle: 'Artista',
            type: 'artist' as const
          }))
        };
      })
    );
  }

  searchAlbums(query: string): Observable<MusicSearchResponse> {
    return this.http.get<ApiResponse<ApiRelease>>(
      `${this.baseUrl}/release/search`,
      { params: this.params(query, true) }
    ).pipe(
      map(response => {
        const releases = response.results ?? [];

        return {
          total: response.estimatedTotalItems ?? releases.length,
          results: releases.map(release => ({
            id: release.id,
            title: release.title,
            subtitle: release.artist?.name ?? 'Artista desconocido',
            type: 'release' as const,
            image: release.image,
            year: release.year
          }))
        };
      })
    );
  }

  search(
    query: string,
    filter: SearchFilter
  ): Observable<MusicSearchResponse> {
    const q = query.trim();

    if (!q) {
      return of({ results: [], total: 0 });
    }

    if (filter === 'track') return this.searchTracks(q);
    if (filter === 'artist') return this.searchArtists(q);
    if (filter === 'release') return this.searchAlbums(q);

    return forkJoin([
      this.searchTracks(q),
      this.searchArtists(q),
      this.searchAlbums(q)
    ]).pipe(
      map(([tracks, artists, albums]) => ({
        results: [
          ...tracks.results,
          ...artists.results,
          ...albums.results
        ],
        total: tracks.total + artists.total + albums.total
      }))
    );
  }
}