import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { JournalService, JournalPost } from '../../services/journal.service';

@Component({
  selector: 'app-writer-journal',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './writer-journal.component.html',
  styleUrl: './writer-journal.component.scss'
})
export class WriterJournalComponent implements OnInit {
  posts: JournalPost[] = [];
  activeCategory = 'all';
  loading = false;

  showNewForm = false;
  saving = false;
  newPost: Partial<JournalPost> = this.blankPost();

  categories = [
    { id: 'all',        label: 'All Entries' },
    { id: 'process',    label: 'Writing Process' },
    { id: 'research',   label: 'Research' },
    { id: 'craft',      label: 'Craft' },
    { id: 'democracy',  label: 'Democracy' },
    { id: 'community',  label: 'Community' },
  ];

  constructor(private journal: JournalService, private snack: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.journal.list().subscribe({
      next: p => { this.posts = p; this.loading = false; },
      error: () => this.loading = false
    });
  }

  get filtered(): JournalPost[] {
    if (this.activeCategory === 'all') return this.posts;
    return this.posts.filter(p => p.category === this.activeCategory);
  }

  categoryLabel(id: string): string {
    return this.categories.find(c => c.id === id)?.label ?? id;
  }

  blankPost(): Partial<JournalPost> {
    return {
      title: '', subtitle: '', category: 'process',
      readingMinutes: 3, body: '',
      date: new Date().toISOString().split('T')[0]
    };
  }

  openNewForm() { this.newPost = this.blankPost(); this.showNewForm = true; }
  cancelNew()   { this.showNewForm = false; }

  submitNew() {
    if (!this.newPost.title?.trim() || !this.newPost.body?.trim()) return;
    this.saving = true;
    this.journal.create(this.newPost).subscribe({
      next: () => {
        this.saving = false;
        this.showNewForm = false;
        this.snack.open('Entry published', 'OK', { duration: 3000 });
        this.load();
      },
      error: () => {
        this.saving = false;
        this.snack.open('Save failed', 'OK', { duration: 3000 });
      }
    });
  }
}
