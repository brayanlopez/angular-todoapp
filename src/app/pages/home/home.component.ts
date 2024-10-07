import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { Task } from '../../models/task.model';
import { Filter } from '../../models/enums';
import { DummyData } from '../../models/dummy-data';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  tasks = signal<Task[]>(DummyData);

  filter = signal<Filter>(Filter.All);

  filters = Filter;

  tasksByFilter = computed(() => {
    const filter = this.filter();
    const tasks = this.tasks();

    const filterMap: Record<Filter, () => Task[]> = {
      [Filter.Completed]: () => tasks.filter((task) => task.completed),
      [Filter.Pending]: () => tasks.filter((task) => !task.completed),
      [Filter.All]: () => tasks,
    };

    return filterMap[filter]();
  });

  newTaskCtrl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  changeHandler(): void {
    const value = this.newTaskCtrl.value.trim();
    if (this.newTaskCtrl.valid && value !== '') {
      this.addTask(value);
      this.newTaskCtrl.setValue('');
    }
  }

  addTask(title: string): void {
    const newTasks = { id: Date.now(), title: title, completed: false };
    this.tasks.update((tasks) => [...tasks, newTasks]);
  }

  deleteTask(index: Number): void {
    this.tasks.update((tasks) =>
      tasks.filter((task, position) => position !== index)
    );
  }

  updateTask(index: Number): void {
    this.tasks.update((tasks) => {
      return tasks.map((task, position) =>
        position === index ? { ...task, completed: !task.completed } : task
      );
    });
  }

  updateTaskEditingMode(index: Number): void {
    this.tasks.update((tasks) => {
      return tasks.map((task, position) =>
        position === index
          ? { ...task, editing: true }
          : { ...task, editing: false }
      );
    });
  }

  updateTaskText(index: Number, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.tasks.update((tasks) => {
      return tasks.map((task, position) =>
        position === index
          ? { ...task, title: input.value, editing: false }
          : task
      );
    });
  }

  changeFilter(filter: Filter): void {
    this.filter.set(filter);
  }
}
