import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detail.html',
  styleUrl: './detail.css'
})
export class Detail {
  private readonly route = inject(ActivatedRoute);

  readonly id = this.route.snapshot.paramMap.get('id');
  readonly type = this.route.snapshot.paramMap.get('type');

  get typeLabel(): string {
    switch (this.type) {
      case 'track':
        return 'Canción';
      case 'artist':
        return 'Artista';
      case 'release':
        return 'Álbum';
      default:
        return 'Contenido musical';
    }
  }
}