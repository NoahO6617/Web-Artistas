
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpotifyAuthService {

  private readonly clientId = '239f8e7fd926468fa8cb79d20af8059d';

  private readonly redirectUri =
  'http://127.0.0.1:4200/callback';

  private readonly authorizeUrl =
    'https://accounts.spotify.com/authorize';

  private readonly tokenUrl =
    'https://accounts.spotify.com/api/token';

  async login(): Promise<void> {
    const verifier = this.generateRandomString(64);

    localStorage.setItem('spotify_code_verifier', verifier);

    const challenge = await this.generateChallenge(verifier);
    const state = this.generateRandomString(32);

    sessionStorage.setItem('spotify_auth_state', state);

    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      code_challenge_method: 'S256',
      code_challenge: challenge,
      state
    });

    window.location.href =
      `${this.authorizeUrl}?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<string> {
    const verifier = localStorage.getItem(
      'spotify_code_verifier'
    );

    if (!verifier) {
      throw new Error('No se encuentra el código de verificación PKCE.');
    }

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
        code_verifier: verifier
      })
    });

    if (!response.ok) {
      throw new Error(
        `Error al obtener el token: ${response.status}`
      );
    }

    const data = await response.json();

    localStorage.removeItem('spotify_code_verifier');

    localStorage.setItem(
      'spotify_access_token',
      data.access_token
    );

    return data.access_token as string;
  }

  private generateRandomString(length: number): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    const values = crypto.getRandomValues(
      new Uint8Array(length)
    );

    return Array.from(
      values,
      value => chars[value % chars.length]
    ).join('');
  }

  private async generateChallenge(
    verifier: string
  ): Promise<string> {
    const data = new TextEncoder().encode(verifier);

    const digest = await crypto.subtle.digest(
      'SHA-256',
      data
    );

    return btoa(
      String.fromCharCode(...new Uint8Array(digest))
    )
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }
}
