import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
export class Home {
query = '';
artists: MusicItem[] = [];
loading = false;
searched = false;
error = '';

  constructor(
    private readonly musicService: MusicService,
    private readonly router: Router
  ) {}

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
      },
      error: err => {
        console.error('Error al buscar artistas en TheAudioDB:', err);
        this.artists = [];
        this.error = 'No se ha podido conectar con TheAudioDB. Prueba de nuevo en unos segundos.';
        this.loading = false;
      }
    });
  }

  openFullSearch(): void {
    const query = this.query.trim();
    if (query) {
      this.router.navigate(['/buscar'], { queryParams: { q: query } });
    }
  }
}
