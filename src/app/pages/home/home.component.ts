import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  tasks = signal<Task[]>([
    { id: 1, title: 'hi', completed: false },
    { id: 1, title: 'hi', completed: false },
  ]);

  changeHandler(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newTasks = input.value;

    this.addTask(newTasks);
  }

  addTask(title: string): void {
    const newTasks = { id: Date.now(), title: title, completed: false };
    this.tasks.update((tasks) => [...tasks, newTasks]);
  }

  deleteTask(index: Number) {
    this.tasks.update((tasks) =>
      tasks.filter((task, position) => position !== index)
    );
  }

  updateTask(): void {}
}
