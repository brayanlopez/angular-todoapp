
import {
  Component,
  computed,
  effect,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { Task } from '../../models/task.model';
import { Filter } from '../../models/enums';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  tasks = signal<Task[]>([]);

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

  amountTaskCompleted = computed(
    () => this.tasks().filter((task) => task.completed).length
  );

  newTaskCtrl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  injector = inject(Injector);

  trackTask() {
    effect(
      () => {
        const tasks = this.tasks();
        localStorage.setItem('tasks', JSON.stringify(tasks));
      },
      { injector: this.injector }
    );
  }

  ngOnInit() {
    const storage = localStorage.getItem('tasks');
    if (storage) {
      const tasks = JSON.parse(storage);
      this.tasks.set(tasks);
    }
    this.trackTask();
  }

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
