
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MusicCard } from '../../components/music-card/music-card';
import { SearchBar } from '../../components/search-bar/search-bar';
import { MusicService } from '../../services/music.service';
import { MusicItem, SearchFilter } from '../../models/music.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, MusicCard, SearchBar],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class Search {
  items: MusicItem[] = [];
  loading = false;
  error = '';
  query = '';
  filter: SearchFilter = 'all';

  constructor(private musicService: MusicService) {}

  onQueryChange(query: string): void {
    this.query = query;

    if (!query.trim()) {
      this.items = [];
      this.error = '';
      return;
    }

    this.loading = true;
    this.error = '';

    this.musicService.search(query, this.filter).subscribe({
      next: (response) => {
        this.items = response.results;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se han podido cargar los resultados.';
        this.loading = false;
      }
    });
  }

  onFilterChange(filter: SearchFilter): void {
    this.filter = filter;

    if (this.query.trim()) {
      this.onQueryChange(this.query);
    }
  }
}
