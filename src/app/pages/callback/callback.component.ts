
import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotifyAuthService } from '../../services/spotify-auth.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="callback">
      <h1>Conectando con Spotify</h1>
      <p>{{ message }}</p>
    </main>
  `,
  styles: [`
    .callback {
      min-height: 60vh;
      display: grid;
      place-content: center;
      text-align: center;
      color: white;
      background: #171720;
    }
  `]
})
export class Callback implements OnInit {
  message = 'Procesando autorización...';

  private platformId = inject(PLATFORM_ID);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private spotifyAuth: SpotifyAuthService
  ) {}

  async ngOnInit(): Promise<void> {
    // Evita acceder a sessionStorage durante el renderizado en el servidor.
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const params = this.route.snapshot.queryParamMap;

    const code = params.get('code');
    const state = params.get('state');
    const returnedError = params.get('error');

    const savedState = sessionStorage.getItem(
      'spotify_auth_state'
    );

    sessionStorage.removeItem('spotify_auth_state');

    if (returnedError) {
      this.message = 'Has cancelado o rechazado la autorización.';
      return;
    }

    if (!state || state !== savedState) {
      this.message = 'Error de seguridad: estado no válido.';
      return;
    }

    if (!code) {
      this.message = 'Spotify no ha devuelto un código de autorización.';
      return;
    }

    try {
      await this.spotifyAuth.exchangeCode(code);

      this.message = '¡Conexión correcta! Volviendo al inicio...';

      await this.router.navigate(['/']);
    } catch (error) {
      console.error(error);
      this.message = 'No se pudo conectar con Spotify. Revisa la configuración.';
    }
  }
}
