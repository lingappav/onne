import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Task {
  _id: string;
  category: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  priority: 'critical' | 'high' | 'medium' | 'low';
  due: string;
  notes: string;
  order: number;
  created?: string;
}

@Component({
  selector: 'app-copywriting-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatSnackBarModule, MatTooltipModule],
  templateUrl: './copywriting-tasks.component.html',
  styleUrl: './copywriting-tasks.component.scss'
})
export class CopywritingTasksComponent implements OnInit {
  tasks: Task[] = [];
  loading = false;
  filterStatus: string = 'all';
  filterCategory: string = 'all';
  addingNew = false;
  editingId: string | null = null;
  editItem: Partial<Task> = {};
  newTask: Partial<Task> = this.blankTask();

  readonly STATUSES = ['todo', 'in_progress', 'done', 'blocked'];
  readonly PRIORITIES = ['critical', 'high', 'medium', 'low'];
  readonly STATUS_LABELS: Record<string, string> = {
    todo: 'To Do', in_progress: 'In Progress', done: 'Done', blocked: 'Blocked'
  };
  readonly STATUS_COLORS: Record<string, string> = {
    todo: '#8b8b8b', in_progress: '#58a6ff', done: '#3fb950', blocked: '#f85149'
  };
  readonly PRIORITY_COLORS: Record<string, string> = {
    critical: '#f85149', high: '#f0883e', medium: '#d29922', low: '#555'
  };

  constructor(private http: HttpClient, private snack: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.http.get<Task[]>('http://localhost:3001/api/tasks').subscribe({
      next: d => { this.tasks = d; this.loading = false; },
      error: () => { this.snack.open('Could not load tasks', 'OK', { duration: 3000 }); this.loading = false; }
    });
  }

  blankTask(): Partial<Task> {
    return { category: 'Publisher Pitch', title: '', status: 'todo', priority: 'medium', due: '', notes: '' };
  }

  get categories(): string[] {
    return [...new Set(this.tasks.map(t => t.category))].sort();
  }

  get filteredTasks(): Task[] {
    return this.tasks.filter(t =>
      (this.filterStatus === 'all' || t.status === this.filterStatus) &&
      (this.filterCategory === 'all' || t.category === this.filterCategory)
    );
  }

  groupedTasks(): Record<string, Task[]> {
    const out: Record<string, Task[]> = {};
    for (const t of this.filteredTasks) {
      (out[t.category] = out[t.category] || []).push(t);
    }
    return out;
  }

  countByStatus(status: string): number {
    return this.tasks.filter(t => t.status === status).length;
  }

  startEdit(task: Task) {
    this.editingId = task._id;
    this.editItem = { ...task };
  }

  saveEdit() {
    if (!this.editingId) return;
    this.http.patch(`http://localhost:3001/api/tasks/${this.editingId}`, this.editItem).subscribe({
      next: () => { this.editingId = null; this.load(); },
      error: () => this.snack.open('Save failed', 'OK', { duration: 2500 })
    });
  }

  cancelEdit() { this.editingId = null; }

  cycleStatus(task: Task) {
    const order = ['todo', 'in_progress', 'done', 'blocked'];
    const next = order[(order.indexOf(task.status) + 1) % order.length] as Task['status'];
    this.http.patch(`http://localhost:3001/api/tasks/${task._id}`, { status: next }).subscribe({
      next: () => this.load(),
      error: () => this.snack.open('Update failed', 'OK', { duration: 2500 })
    });
  }

  deleteTask(id: string) {
    this.http.delete(`http://localhost:3001/api/tasks/${id}`).subscribe({
      next: () => this.load(),
      error: () => this.snack.open('Delete failed', 'OK', { duration: 2500 })
    });
  }

  submitNew() {
    if (!this.newTask.title?.trim()) return;
    this.http.post<Task>('http://localhost:3001/api/tasks', this.newTask).subscribe({
      next: () => { this.addingNew = false; this.newTask = this.blankTask(); this.load(); },
      error: () => this.snack.open('Add failed', 'OK', { duration: 2500 })
    });
  }

  statusColor(s: string): string { return this.STATUS_COLORS[s] || '#888'; }
  priorityColor(p: string): string { return this.PRIORITY_COLORS[p] || '#888'; }
  statusLabel(s: string): string { return this.STATUS_LABELS[s] || s; }

  isOverdue(due: string): boolean {
    if (!due) return false;
    return new Date(due) < new Date() && true;
  }
}
