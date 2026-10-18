import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MusicItem } from '../../models/music.model';

@Component({
  selector: 'app-music-card',
  standalone: true,
  imports: [NgIf, RouterLink],
  templateUrl: './music-card.html',
  styleUrl: './music-card.css'
})
export class MusicCard {
  @Input({ required: true }) item!: MusicItem;

  get typeLabel(): string {
    switch (this.item.type) {
      case 'track':
        return 'Canción';
      case 'artist':
        return 'Artista';
      case 'release':
        return 'Álbum';
    }
  }
}