
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
  private searchSubscription?: Subscription;
  private readonly historyKey = 'melowave-search-history';

  constructor(
    private readonly musicService: MusicService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.queryParamMap.subscribe(params => {
      const query = params.get('q') ?? '';
      if (query) this.onQueryChange(query);
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.searchSubscription?.unsubscribe();
  }

  // Inicia la búsqueda y cancela la petición anterior si todavía sigue activa.
  onQueryChange(query: string): void {
    this.query = query.trim();

    if (!this.query) {
      this.items = [];
      this.error = '';
      this.loading = false;
      this.searchSubscription?.unsubscribe();
      return;
    }

    this.loading = true;
    this.error = '';

    this.searchSubscription?.unsubscribe();
    this.searchSubscription = this.musicService
      .search(this.query, this.filter)
      .subscribe({
        next: response => {
          this.items = response.results;
          this.saveHistory(response.results);
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

  // Recibe la selección de una tarjeta y abre su ficha.
  openItem(item: MusicItem): void {
    this.router.navigate(['/detalle', item.type, item.id]);
  }

  onFilterChange(filter: SearchFilter): void {
    this.filter = filter;
    if (this.query) this.onQueryChange(this.query);
  }

  // Guarda los resultados recientes sin duplicar elementos.
  private saveHistory(items: MusicItem[]): void {
    if (typeof localStorage === 'undefined' || items.length === 0) {
      return;
    }

    try {
      const stored = localStorage.getItem(this.historyKey);
      const previous: MusicItem[] = stored ? JSON.parse(stored) : [];

      const combined = [...items, ...previous];
      const unique = combined.filter((item, index, array) =>
        array.findIndex(other =>
          String(other.id) === String(item.id) &&
          other.type === item.type
        ) === index
      );

      localStorage.setItem(
        this.historyKey,
        JSON.stringify(unique.slice(0, 12))
      );
    } catch (err) {
      console.warn('No se pudo guardar el historial:', err);
    }
  }
}
