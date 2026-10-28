import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
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
export class Search implements OnInit, OnDestroy {
  items: MusicItem[] = [];
  loading = false;
  error = '';
  query = '';
  filter: SearchFilter = 'all';
  private routeSubscription?: Subscription;

  constructor(
    private readonly musicService: MusicService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.queryParamMap.subscribe(params => {
      const query = params.get('q') ?? '';
      if (query) this.onQueryChange(query);
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  onQueryChange(query: string): void {
    this.query = query.trim();
    if (!this.query) {
      this.items = [];
      this.error = '';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = '';

    this.musicService.search(this.query, this.filter).subscribe({
      next: response => {
        this.items = response.results;
        this.loading = false;
      },
      error: err => {
        console.error('Error buscando en TheAudioDB:', err);
        this.items = [];
        this.error = 'No se han podido cargar los resultados. Inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }

  onFilterChange(filter: SearchFilter): void {
    this.filter = filter;
    if (this.query) this.onQueryChange(this.query);
  }
}
