import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Search } from './pages/search/search';
import { Callback } from './pages/callback/callback.component';
import { Detail } from './pages/detail/detail';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'buscar', component: Search },
  { path: 'detalle/:type/:id', component: Detail },
  { path: 'callback', component: Callback },
  { path: '**', redirectTo: '' }
];