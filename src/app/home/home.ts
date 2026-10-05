import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Task } from '../task/task';
import { TaskInterface } from '../../task-interface';

const taskArray: TaskInterface[] = [
  {
    id: 1,
    name: 'Tarea1 new',
    isCompleted: false,
  },
  {
    id: 2,
    name: 'Tarea2',
    isCompleted: false,
  },
  {
    id: 3,
    name: 'Tarea3',
    isCompleted: false,
  },
  {
    id: 4,
    name: 'Tarea4',
    isCompleted: false,
  },
  {
    id: 5,
    name: 'Tarea5',
    isCompleted: true,
  },
];

@Component({
  selector: 'app-home',
  imports: [Task, RouterLink],
  templateUrl: './home.html',
})
export class Home {
  taskList = signal<TaskInterface[]>(taskArray);

  updateTaskValue(id: number) {
    this.taskList.update(tasks =>
      tasks.map(task =>
        task.id === id
          ? { ...task, isCompleted: !task.isCompleted }
          : task
      )
    );
  }
}