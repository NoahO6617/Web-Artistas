import { Component, input, output } from '@angular/core';
import { TaskInterface } from '../../task-interface';

@Component({
  imports: [],
  selector: 'app-task',
  styles: `
  .task {
    background: grey;
    padding: 10px;
    border-radius: 15px;
    display: flex;
    gap: 8px;
  }
  
  .completed-task {
    background: green;
  }
  `,
  templateUrl: './task.html',
})
export class Task {
  task = input.required<TaskInterface>();
  checkboxValue = output<number>();

  updateCompletion() {
    this.checkboxValue.emit(this.task().id);
  }
}
