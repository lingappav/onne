import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Milestone {
  milestone: string;
  date: string;
  status: 'completed' | 'in_progress' | 'pending' | 'delayed';
  notes: string;
}

interface KeyContact {
  role: string;
  name: string;
  email: string;
  phone: string;
}

interface FilmAgreement {
  title: string;
  production_company: string;
  option_type: string;
  option_start: string;
  option_expiry: string;
  budget_min_usd: number;
  budget_max_usd: number;
  format: string;
  language_primary: string;
  language_secondary: string;
  star_attachment: string;
  director_status: string;
  rights_granted: string[];
  rights_reserved: string[];
  option_fee_inr: string;
  royalty_on_exercise: string;
  screenplay_credit: string;
  milestones: Milestone[];
  key_contacts: KeyContact[];
  commercial_notes: string;
  last_updated: string;
}

@Component({
  selector: 'app-film-agreement',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatSnackBarModule, MatTooltipModule],
  templateUrl: './film-agreement.component.html',
  styleUrl: './film-agreement.component.scss'
})
export class FilmAgreementComponent implements OnInit {
  data: FilmAgreement | null = null;
  loading = false;
  editingMilestoneIdx: number | null = null;
  milestoneEdit: Partial<Milestone> = {};

  readonly STATUS_LABELS: Record<string, string> = {
    completed: 'Completed', in_progress: 'In Progress',
    pending: 'Pending', delayed: 'Delayed'
  };
  readonly STATUS_COLORS: Record<string, string> = {
    completed: '#3fb950', in_progress: '#f0883e',
    pending: '#8b8b8b', delayed: '#f85149'
  };
  readonly STATUS_OPTIONS = ['pending', 'in_progress', 'completed', 'delayed'];

  constructor(private http: HttpClient, private snack: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.http.get<FilmAgreement>('http://localhost:3001/api/film-agreement').subscribe({
      next: d => { this.data = d; this.loading = false; },
      error: () => { this.snack.open('Could not load film agreement', 'OK', { duration: 3000 }); this.loading = false; }
    });
  }

  daysUntilExpiry(): number {
    if (!this.data) return 0;
    const expiry = new Date(this.data.option_expiry);
    return Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }

  completedMilestones(): number {
    return this.data?.milestones.filter(m => m.status === 'completed').length || 0;
  }

  milestonePct(): number {
    if (!this.data?.milestones.length) return 0;
    return Math.round((this.completedMilestones() / this.data.milestones.length) * 100);
  }

  expiryColor(): string {
    const d = this.daysUntilExpiry();
    if (d > 365) return '#3fb950';
    if (d > 90)  return '#d29922';
    return '#f85149';
  }

  statusColor(s: string): string { return this.STATUS_COLORS[s] || '#888'; }
  statusLabel(s: string): string { return this.STATUS_LABELS[s] || s; }

  startMilestoneEdit(idx: number) {
    const m = this.data!.milestones[idx];
    this.editingMilestoneIdx = idx;
    this.milestoneEdit = { status: m.status, notes: m.notes, date: m.date };
  }

  saveMilestone(idx: number) {
    this.http.patch(`http://localhost:3001/api/film-agreement/milestone/${idx}`, this.milestoneEdit).subscribe({
      next: () => { this.editingMilestoneIdx = null; this.load(); },
      error: () => this.snack.open('Save failed', 'OK', { duration: 2500 })
    });
  }

  cancelMilestone() { this.editingMilestoneIdx = null; }
}
