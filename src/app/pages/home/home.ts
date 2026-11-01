
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';

import { MusicService } from '../../services/music.service';
import { MusicCard } from '../../components/music-card/music-card';
import { MusicItem } from '../../models/music.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, MusicCard],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  query = '';
  artists: MusicItem[] = [];
  popularTracks: MusicItem[] = [];
  recentArtists: MusicItem[] = [];
  recentTracks: MusicItem[] = [];

  loading = false;
  loadingPopular = false;
  searched = false;
  error = '';

  private readonly historyKey = 'melowave-search-history';

  constructor(
    private readonly musicService: MusicService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadHistory();
    this.loadPopularTracks();
  }

  // Gestiona la selección de una tarjeta desde la página principal.
  openItem(item: MusicItem): void {
    this.router.navigate(['/detalle', item.type, item.id]);
  }

  search(): void {
    const query = this.query.trim();

    if (!query) {
      this.artists = [];
      this.searched = false;
      this.error = '';
      return;
    }

    this.loading = true;
    this.searched = true;
    this.error = '';

    this.musicService.searchArtists(query).subscribe({
      next: response => {
        this.artists = response.results;
        this.loading = false;

        this.saveHistory(this.artists);
        this.loadHistory();
      },
      error: err => {
        console.error('Error al buscar artistas:', err);
        this.artists = [];
        this.error = 'No se ha podido conectar con TheAudioDB. Inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }

  // Carga una selección de canciones para la página de inicio.
  loadPopularTracks(): void {
    this.loadingPopular = true;

    this.musicService.getPopularTracks().pipe(
      catchError(err => {
        console.error('Error cargando canciones populares:', err);
        return of([]);
      })
    ).subscribe(tracks => {
      this.popularTracks = tracks;
      this.loadingPopular = false;
    });
  }

  private saveHistory(items: MusicItem[]): void {
    if (typeof localStorage === 'undefined') return;

    const previous = this.readHistory();
    const combined = [...items, ...previous];

    const unique = combined.filter((item, index, array) =>
      array.findIndex(other =>
        other.id === item.id && other.type === item.type
      ) === index
    );

    localStorage.setItem(
      this.historyKey,
      JSON.stringify(unique.slice(0, 8))
    );
  }

  private readHistory(): MusicItem[] {
    if (typeof localStorage === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.historyKey);
      return stored ? JSON.parse(stored) as MusicItem[] : [];
    } catch {
      return [];
    }
  }

 loadHistory(): void {
  const history = this.readHistory();

  this.recentArtists = history
    .filter(item => item.type === 'artist')
    .slice(0, 6);

  this.recentTracks = history
    .filter(item => item.type === 'track')
    .slice(0, 6);
}

  openFullSearch(): void {
    const query = this.query.trim();

    if (query) {
      this.router.navigate(['/buscar'], {
        queryParams: { q: query }
      });
    }
  }
}
