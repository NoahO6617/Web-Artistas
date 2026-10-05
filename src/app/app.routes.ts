import { Routes } from '@angular/router';
import { Home } from './home/home';
import { TaskDetail } from './task-detail/task-detail';
import { NotFound } from './not-found/not-found';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'tareas/:id',
    component: TaskDetail,
  },
  {
    path: '**',
    component: NotFound,
  },
];