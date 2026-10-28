
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import {
  MusicService,
  TheAudioDbArtist,
  TheAudioDbAlbum,
  TheAudioDbTrack
} from '../../services/music.service';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detail.html',
  styleUrl: './detail.css'
})
export class Detail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly musicService = inject(MusicService);

  type: string | null = null;
  id: string | null = null;

  artist: TheAudioDbArtist | null = null;
  album: TheAudioDbAlbum | null = null;
  track: TheAudioDbTrack | null = null;

  loading = true;
  notFound = false;

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.type = params.get('type');
        this.id = params.get('id');

        this.artist = null;
        this.album = null;
        this.track = null;
        this.notFound = false;
        this.loading = true;

        if (!this.id) {
          this.loading = false;
          this.notFound = true;
          return this.musicService.getArtist('');
        }

        if (this.type === 'artist') {
          return this.musicService.getArtist(this.id);
        }

        if (this.type === 'release') {
          return this.musicService.getAlbum(this.id);
        }

        if (this.type === 'track') {
          return this.musicService.getTrack(this.id);
        }

        this.loading = false;
        this.notFound = true;
        return this.musicService.getArtist('');
      })
    ).subscribe(result => {
      if (this.type === 'artist') {
        this.artist = result as TheAudioDbArtist | null;
      } else if (this.type === 'release') {
        this.album = result as TheAudioDbAlbum | null;
      } else if (this.type === 'track') {
        this.track = result as TheAudioDbTrack | null;
      }

      this.notFound = !this.artist && !this.album && !this.track;
      this.loading = false;
    });
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

  get biography(): string | null {
    return this.artist?.strBiographyEN
      || this.album?.strDescriptionEN
      || this.track?.strDescriptionEN
      || null;
  }

  get duration(): string | null {
    const milliseconds = Number(this.track?.intDuration);
    if (!milliseconds || !Number.isFinite(milliseconds)) return null;

    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }
}
