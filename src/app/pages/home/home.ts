import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpotifyAuthService } from '../../services/spotify-auth.service';
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
  spotifyAuth = inject(SpotifyAuthService);
  query = '';
  songs: MusicItem[] = [];

  loading = false;
  searched = false;
  error = '';

  constructor(private musicService: MusicService) {}

  searchSongs(): void {
    const query = this.query.trim();

    if (!query) {
      this.songs = [];
      this.searched = false;
      this.error = '';
      return;
    }

    this.loading = true;
    this.searched = true;
    this.error = '';

    this.musicService.searchTracks(query).subscribe({
      next: (response) => {
        this.songs = response.results;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al buscar canciones:', error);

        this.songs = [];
        this.error = 'No se han podido cargar las canciones.';
        this.loading = false;
      }
    });
  }
}