
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
  // Datos recibidos desde el componente padre.
  item = input.required<MusicItem>();

  // El padre decide qué hacer cuando se selecciona una tarjeta.
  itemSelected = output<MusicItem>();

  selectItem(event: MouseEvent): void {
    event.preventDefault();
    this.itemSelected.emit(this.item());
  }

  // Nombre que se muestra para cada tipo de resultado.
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
