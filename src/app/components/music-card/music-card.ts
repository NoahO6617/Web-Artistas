
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MusicItem } from '../../models/music.model';

@Component({
  selector: 'app-music-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './music-card.html',
  styleUrl: './music-card.css'
})
export class MusicCard {
  // Datos desde componente padre
  item = input.required<MusicItem>();

  itemSelected = output<MusicItem>();

  selectItem(event: MouseEvent): void {
    event.preventDefault();
    this.itemSelected.emit(this.item());
  }
  get typeLabel(): string {
    switch (this.item().type) {
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

}
