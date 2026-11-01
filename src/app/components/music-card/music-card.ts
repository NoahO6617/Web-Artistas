
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MusicItem } from '../../models/music.model';

@Component({
  selector: 'app-music-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './music-card.html',
  styleUrl: './music-card.css'
})
export class MusicCard {
  @Input({ required: true }) item!: MusicItem;

  get typeLabel(): string {
    switch (this.item.type) {
      case 'artist':
        return 'Artista';
      case 'track':
        return 'Canción';
      case 'release':
        return 'Álbum';
      default:
        return 'Música';
    }
  }

  get detailUrl(): string[] {
    return [
      '/detalle',
      this.item.type,
      String(this.item.id)
    ];
  }
}
