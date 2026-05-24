import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

interface PitchItem {
  _id: string;
  type: string;
  name: string;
  contact?: string;
  org?: string;
  tier?: string;
  status: string;
  submitted?: string | null;
  last_contact?: string | null;
  notes: string;
  priority: string;
  category?: string;
  ask_inr?: number;
  reason?: string;
  action?: string;
  channel?: string;
}

interface FundraiseSummary {
  target_usd: number;
  raised_usd: number;
  stream_a_patrons: number;
  stream_b_sponsors: number;
  stream_c_big: number;
  substack_paid: number;
  day_of_90: number;
  last_updated: string;
  notes: string;
}

interface PitchData {
  summary: FundraiseSummary;
  publishers: PitchItem[];
  agents: PitchItem[];
  fundraise: PitchItem[];
  suggested: PitchItem[];
}

@Component({
  selector: 'app-pitch-status',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatSnackBarModule, MatTooltipModule],
  templateUrl: './pitch-status.component.html',
  styleUrl: './pitch-status.component.scss'
})
export class PitchStatusComponent implements OnInit {
  data: PitchData | null = null;
  loading = false;
  activeTab: 'publishers' | 'agents' | 'fundraise' | 'suggested' = 'publishers';
  editingId: string | null = null;
  editingItem: Partial<PitchItem> = {};
  editingSummary = false;
  summaryEdit: Partial<FundraiseSummary> = {};

  readonly STATUS_OPTIONS = ['not_sent', 'drafting', 'sent', 'replied', 'meeting', 'committed', 'paid', 'declined', 'on_hold'];
  readonly STATUS_LABELS: Record<string, string> = {
    not_sent: 'Not Sent', drafting: 'Drafting', sent: 'Sent',
    replied: 'Replied', meeting: 'Meeting', committed: 'Committed',
    paid: 'Paid / Accepted', declined: 'Declined', on_hold: 'On Hold'
  };
  readonly STATUS_COLORS: Record<string, string> = {
    not_sent: '#666', drafting: '#9b6fd4', sent: '#58a6ff',
    replied: '#d29922', meeting: '#f0883e', committed: '#3fb950',
    paid: '#3fb950', declined: '#f85149', on_hold: '#888'
  };

  constructor(private http: HttpClient, private snack: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.http.get<PitchData>('http://localhost:3001/api/pitch-status').subscribe({
      next: d => { this.data = d; this.loading = false; },
      error: () => { this.snack.open('Could not load pitch status', 'OK', { duration: 3000 }); this.loading = false; }
    });
  }

  startEdit(item: PitchItem) {
    this.editingId = item._id;
    this.editingItem = { status: item.status, submitted: item.submitted || '', last_contact: item.last_contact || '', notes: item.notes };
  }

  saveEdit(item: PitchItem) {
    this.http.patch(`http://localhost:3001/api/pitch-status/${item._id}`, this.editingItem).subscribe({
      next: () => { this.editingId = null; this.load(); },
      error: () => this.snack.open('Save failed', 'OK', { duration: 2500 })
    });
  }

  cancelEdit() { this.editingId = null; }

  startSummaryEdit() {
    if (!this.data) return;
    this.summaryEdit = { ...this.data.summary };
    this.editingSummary = true;
  }

  saveSummary() {
    this.http.patch('http://localhost:3001/api/pitch-status/summary/update', this.summaryEdit).subscribe({
      next: () => { this.editingSummary = false; this.load(); },
      error: () => this.snack.open('Save failed', 'OK', { duration: 2500 })
    });
  }

  statusColor(s: string): string { return this.STATUS_COLORS[s] || '#888'; }
  statusLabel(s: string): string { return this.STATUS_LABELS[s] || s; }

  priorityIcon(p: string): string {
    return { critical: 'priority_high', high: 'arrow_upward', medium: 'remove', low: 'arrow_downward' }[p] || 'remove';
  }
  priorityColor(p: string): string {
    return { critical: '#f85149', high: '#f0883e', medium: '#d29922', low: '#888' }[p] || '#888';
  }

  fundRaisePct(): number {
    if (!this.data?.summary?.target_usd) return 0;
    return Math.min(100, Math.round((this.data.summary.raised_usd / this.data.summary.target_usd) * 100));
  }

  sentCount(items: PitchItem[]): number {
    return items.filter(i => !['not_sent', 'drafting'].includes(i.status)).length;
  }

  positiveCount(items: PitchItem[]): number {
    return items.filter(i => ['replied', 'meeting', 'committed', 'paid'].includes(i.status)).length;
  }

  groupedFundraise(): Record<string, PitchItem[]> {
    if (!this.data) return {};
    const out: Record<string, PitchItem[]> = {};
    for (const f of this.data.fundraise) {
      const cat = f.category || 'Other';
      (out[cat] = out[cat] || []).push(f);
    }
    return out;
  }

  groupedSuggested(): Record<string, PitchItem[]> {
    if (!this.data) return {};
    const out: Record<string, PitchItem[]> = {};
    for (const s of this.data.suggested) {
      const cat = s.category || 'Other';
      (out[cat] = out[cat] || []).push(s);
    }
    return out;
  }
}
