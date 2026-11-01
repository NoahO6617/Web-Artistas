
import { Component, DestroyRef, OnInit, ChangeDetectorRef, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, switchMap, of, forkJoin, catchError } from 'rxjs';
import { MusicItem } from '../../models/music.model';
import { MusicCard } from '../../components/music-card/music-card';

import {
  MusicService,
  TheAudioDbArtist,
  TheAudioDbAlbum,
  TheAudioDbTrack
} from '../../services/music.service';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MusicCard],
  templateUrl: './detail.html',
  styleUrl: './detail.css'
})
export class Detail implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly musicService = inject(MusicService);
  private readonly destroyRef = inject(DestroyRef);

  type: string | null = null;
  id: string | null = null;

  artist: TheAudioDbArtist | null = null;
  album: TheAudioDbAlbum | null = null;
  track: TheAudioDbTrack | null = null;

  loading = true;
  notFound = false;
  error = '';

  artistAlbums: MusicItem[] = [];
  artistTracks: MusicItem[] = [];
  albumTracks: MusicItem[] = [];
  relatedLoading = false;

  // Lee los parámetros de la URL y carga el elemento solicitado.
  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap(params => {
        this.type = params.get('type');
        this.id = params.get('id');
        console.log('TIPO:', this.type);
        console.log('ID:', this.id);

        this.artist = null;
        this.album = null;
        this.track = null;
        this.artistAlbums = [];
        this.artistTracks = [];
        this.albumTracks = [];
        this.relatedLoading = false;
        this.notFound = false;
        this.error = '';

        if (!this.id) {
          this.loading = false;
          this.notFound = true;
          return of(null);
        }

        this.loading = true;

        if (this.type === 'artist') {
          return this.musicService.getArtist(this.id).pipe(
            finalize(() => this.loading = false)
          );
        }

        if (this.type === 'release') {
          return this.musicService.getAlbum(this.id).pipe(
            finalize(() => this.loading = false)
          );
        }

        if (this.type === 'track') {
          return this.musicService.getTrack(this.id).pipe(
            finalize(() => this.loading = false)
          );
        }

        this.loading = false;
        this.notFound = true;
        return of(null);
      })
    ).subscribe({
      next: result => {
  console.log('RESPUESTA THEAUDIODB:', result);

  if (this.type === 'artist') {
    this.artist = result as TheAudioDbArtist | null;
  } else if (this.type === 'release') {
    this.album = result as TheAudioDbAlbum | null;
  } else if (this.type === 'track') {
    this.track = result as TheAudioDbTrack | null;
  }

  this.loading = false;
  this.notFound = !this.artist && !this.album && !this.track;

  console.log('ARTISTA ASIGNADO:', this.artist);
  console.log('LOADING:', this.loading);
  console.log('NOT FOUND:', this.notFound);

  this.cdr.detectChanges();

  // Una vez cargada la ficha principal, recuperamos sus elementos relacionados.
  if (this.artist?.strArtist) {
    this.loadArtistRelated(this.artist.strArtist);
  } else if (this.album?.idAlbum) {
    this.loadAlbumTracks(this.album.idAlbum);
  }
},
      error: err => {
        console.error('Error cargando detalle musical:', err);
        this.loading = false;
        this.notFound = true;
        this.error = 'No se ha podido cargar la información. Inténtalo de nuevo.';
      }
    });
  }

  // Carga álbumes y canciones para completar la ficha del artista.
  private loadArtistRelated(artistName: string): void {
    this.relatedLoading = true;

    forkJoin({
      albums: this.musicService.getArtistAlbums(artistName).pipe(catchError(() => of([]))),
      tracks: this.musicService.getArtistTracks(artistName).pipe(catchError(() => of([])))
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: result => {
        this.artistAlbums = result.albums;
        this.artistTracks = result.tracks;
        this.relatedLoading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error cargando álbumes y canciones del artista:', err);
        this.relatedLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Recupera las canciones incluidas en el álbum seleccionado.
  private loadAlbumTracks(albumId: string): void {
    this.relatedLoading = true;

    this.musicService.getAlbumTracks(albumId).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(err => {
        console.error('Error cargando canciones del álbum:', err);
        return of([]);
      })
    ).subscribe(tracks => {
      this.albumTracks = tracks;
      this.relatedLoading = false;
      this.cdr.detectChanges();
    });
  }

  // Abre el detalle del elemento seleccionado en una tarjeta relacionada.
  openItem(item: MusicItem): void {
    this.router.navigate(['/detalle', item.type, item.id]);
  }

  // Construye el enlace a la ficha del artista relacionado.
  get relatedArtistUrl(): string[] | null {
    const artistId = this.album?.idArtist || this.track?.idArtist;
    return artistId ? ['/detalle', 'artist', artistId] : null;
  }

  get relatedAlbumUrl(): string[] | null {
    const albumId = this.track?.idAlbum;
    return albumId ? ['/detalle', 'release', albumId] : null;
  }

  get typeLabel(): string {
    switch (this.type) {
      case 'track': return 'Canción';
      case 'artist': return 'Artista';
      case 'release': return 'Álbum';
      default: return 'Contenido musical';
    }
  }

  get title(): string {
    return this.artist?.strArtist
      || this.album?.strAlbum
      || this.track?.strTrack
      || 'Detalle musical';
  }

  get image(): string | null {
    return this.artist?.strArtistThumb
      || this.artist?.strArtistFanart
      || this.album?.strAlbumThumb
      || this.track?.strTrackThumb
      || null;
  }

  get subtitle(): string {
    if (this.artist) {
      return [
        this.artist.strGenre || this.artist.strStyle,
        this.artist.strCountry
      ].filter(Boolean).join(' · ');
    }

    if (this.album) {
      return [
        this.album.strArtist,
        this.album.intYearReleased
      ].filter(Boolean).join(' · ');
    }

    if (this.track) {
      return [
        this.track.strArtist,
        this.track.strAlbum
      ].filter(Boolean).join(' · ');
    }

    return '';
  }

  // biografia que utiliza y otros campos como alternativa.
  get biography(): string | null {
  return this.artist?.strBiographyES
    || this.artist?.strBiographyEN
    || this.artist?.strBiography
    || this.album?.strDescriptionEN
    || this.track?.strDescriptionEN
    || null;
}

  get duration(): string | null {
    const milliseconds = Number(this.track?.intDuration);

    if (!milliseconds || !Number.isFinite(milliseconds)) {
      return null;
    }

    const secondsTotal = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(secondsTotal / 60);
    const seconds = secondsTotal % 60;

    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }
}
