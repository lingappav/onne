import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Chapter {
  _id: string; act: string; num: number; title: string; sub: string;
  words_target: number; status: 'not_started'|'in_progress'|'drafted'|'revised'|'done';
  started_date: string|null; completed_date: string|null; notes: string; word_count_actual: number;
}
interface Milestone {
  _id: string; day: number; title: string; desc: string; phase: string;
  status: 'upcoming'|'in_progress'|'done'|'delayed'; completed_date: string|null; notes: string; is_key?: boolean;
}
interface FundingStream {
  _id: string; name: string; icon: string; target_usd: number; raised_usd: number;
  status: string; activate_day: number; pitch_angle: string; notes: string;
}
interface Activity {
  _id: string; date: string; type: string; note: string; words_written: number; chapter_id?: string;
}
interface InvestorReturns {
  publishing_advance_low: number; publishing_advance_high: number;
  film_option_value: number; film_production_royalty_pct: number; film_budget_mid: number;
  ott_rights_low: number; ott_rights_high: number;
  royalties_5yr_low: number; royalties_5yr_high: number;
  translation_rights: number; total_low: number; total_high: number; notes: string;
}
interface PlanMeta {
  start_date: string; target_date: string; total_days: number;
  title: string; author: string; words_total_target: number; notes: string;
  investor_returns: InvestorReturns;
}
interface PlanData {
  meta: PlanMeta; chapters: Chapter[]; milestones: Milestone[];
  funding: FundingStream[]; activities: Activity[];
}

@Component({
  selector: 'app-plan90',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatSnackBarModule, MatTooltipModule],
  templateUrl: './plan90.component.html',
  styleUrl: './plan90.component.scss'
})
export class Plan90Component implements OnInit {
  data: PlanData | null = null;
  loading = false;
  activeTab: 'dashboard'|'chapters'|'milestones'|'funding'|'activity'|'returns' = 'dashboard';

  editingChapterId: string|null = null;
  chapterEdit: Partial<Chapter> = {};
  editingMilestoneId: string|null = null;
  milestoneEdit: Partial<Milestone> = {};
  editingFundingId: string|null = null;
  fundingEdit: Partial<FundingStream> = {};
  editingReturns = false;
  returnsEdit: Partial<InvestorReturns> = {};
  addingActivity = false;
  newActivity: Partial<Activity> = this.blankActivity();

  readonly CHAPTER_STATUSES = ['not_started','in_progress','drafted','revised','done'];
  readonly CHAPTER_STATUS_LABELS: Record<string,string> = {
    not_started:'Not Started', in_progress:'In Progress', drafted:'Drafted', revised:'Revised', done:'Done'
  };
  readonly CHAPTER_STATUS_COLORS: Record<string,string> = {
    not_started:'#444', in_progress:'#58a6ff', drafted:'#d29922', revised:'#f0883e', done:'#3fb950'
  };
  readonly MILESTONE_STATUSES = ['upcoming','in_progress','done','delayed'];
  readonly MILESTONE_STATUS_COLORS: Record<string,string> = {
    upcoming:'#555', in_progress:'#58a6ff', done:'#3fb950', delayed:'#f85149'
  };
  readonly FUNDING_STATUSES = ['not_started','in_progress','applied','agreement_exists','received','declined'];
  readonly FUNDING_STATUS_LABELS: Record<string,string> = {
    not_started:'Not Started', in_progress:'In Progress', applied:'Applied',
    agreement_exists:'Agreement Exists', received:'Received', declined:'Declined'
  };
  readonly ACTIVITY_TYPES = ['research','writing','editing','outreach','planning','other'];

  constructor(private http: HttpClient, private snack: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.http.get<PlanData>('http://localhost:3001/api/plan90').subscribe({
      next: d => { this.data = d; this.loading = false; },
      error: () => { this.snack.open('Could not load 90-day plan', 'OK', { duration: 3000 }); this.loading = false; }
    });
  }

  blankActivity(): Partial<Activity> {
    return { date: new Date().toISOString().slice(0,10), type: 'writing', note: '', words_written: 0 };
  }

  // ── Dashboard helpers ────────────────────────────────────────────────────
  daysSinceStart(): number {
    if (!this.data?.meta?.start_date) return 0;
    return Math.floor((Date.now() - new Date(this.data.meta.start_date).getTime()) / 86400000) + 1;
  }
  daysToTarget(): number {
    if (!this.data?.meta?.target_date) return 0;
    return Math.max(0, Math.ceil((new Date(this.data.meta.target_date).getTime() - Date.now()) / 86400000));
  }
  totalWordCount(): number {
    return this.data?.chapters.reduce((s,c) => s + (c.word_count_actual||0), 0) || 0;
  }
  wordPct(): number {
    const t = this.data?.meta?.words_total_target || 72000;
    return Math.min(100, Math.round(this.totalWordCount() / t * 100));
  }
  chaptersDone(): number { return this.data?.chapters.filter(c => c.status==='done' || c.status==='revised').length || 0; }
  chaptersStarted(): number { return this.data?.chapters.filter(c => c.status !== 'not_started').length || 0; }
  milestonesDone(): number { return this.data?.milestones.filter(m => m.status==='done').length || 0; }
  totalFundingRaised(): number { return this.data?.funding.reduce((s,f) => s + (f.raised_usd||0), 0) || 0; }
  totalFundingTarget(): number { return this.data?.funding.reduce((s,f) => s + f.target_usd, 0) || 0; }
  fundingPct(): number {
    const t = this.totalFundingTarget();
    return t ? Math.round(this.totalFundingRaised() / t * 100) : 0;
  }
  recentActivities(): Activity[] { return (this.data?.activities || []).slice(0,5); }
  totalWordsLogged(): number {
    return this.data?.activities.reduce((s,a) => s + (a.words_written||0), 0) || 0;
  }
  activityStreak(): number {
    const acts = this.data?.activities || [];
    if (!acts.length) return 0;
    const today = new Date().toISOString().slice(0,10);
    const dates = [...new Set(acts.map(a => a.date))].sort().reverse();
    let streak = 0;
    let cur = new Date(today);
    for (const d of dates) {
      const diff = Math.round((cur.getTime() - new Date(d).getTime()) / 86400000);
      if (diff === 0 || diff === 1) { streak++; cur = new Date(d); }
      else break;
    }
    return streak;
  }

  // ── Chapter helpers ──────────────────────────────────────────────────────
  actChapters(act: string): Chapter[] { return this.data?.chapters.filter(c => c.act===act) || []; }
  actChaptersDone(act: string): number { return this.actChapters(act).filter(c => c.status==='done' || c.status==='revised').length; }
  statusColor(s: string): string { return this.CHAPTER_STATUS_COLORS[s] || '#444'; }
  statusLabel(s: string): string { return this.CHAPTER_STATUS_LABELS[s] || s; }

  startChapterEdit(ch: Chapter) {
    this.editingChapterId = ch._id;
    this.chapterEdit = { status: ch.status, word_count_actual: ch.word_count_actual, started_date: ch.started_date||'', completed_date: ch.completed_date||'', notes: ch.notes };
  }
  saveChapter(id: string) {
    this.http.patch(`http://localhost:3001/api/plan90/chapter/${id}`, this.chapterEdit).subscribe({
      next: () => { this.editingChapterId = null; this.load(); },
      error: () => this.snack.open('Save failed', 'OK', { duration: 2500 })
    });
  }
  cancelChapter() { this.editingChapterId = null; }

  cycleChapterStatus(ch: Chapter) {
    const order = ['not_started','in_progress','drafted','revised','done'];
    const next = order[(order.indexOf(ch.status) + 1) % order.length] as Chapter['status'];
    const patch: any = { status: next };
    if (next === 'in_progress' && !ch.started_date) patch.started_date = new Date().toISOString().slice(0,10);
    if (next === 'done' && !ch.completed_date) patch.completed_date = new Date().toISOString().slice(0,10);
    this.http.patch(`http://localhost:3001/api/plan90/chapter/${ch._id}`, patch).subscribe({
      next: () => this.load(), error: () => {}
    });
  }

  // ── Milestone helpers ────────────────────────────────────────────────────
  mColor(s: string): string { return this.MILESTONE_STATUS_COLORS[s] || '#555'; }

  startMilestoneEdit(m: Milestone) {
    this.editingMilestoneId = m._id;
    this.milestoneEdit = { status: m.status, completed_date: m.completed_date||'', notes: m.notes };
  }
  saveMilestone(id: string) {
    this.http.patch(`http://localhost:3001/api/plan90/milestone/${id}`, this.milestoneEdit).subscribe({
      next: () => { this.editingMilestoneId = null; this.load(); },
      error: () => this.snack.open('Save failed', 'OK', { duration: 2500 })
    });
  }
  cancelMilestone() { this.editingMilestoneId = null; }

  currentMilestone(): Milestone|null {
    if (!this.data) return null;
    const day = this.daysSinceStart();
    return this.data.milestones.find(m => m.status !== 'done' && m.day >= day) || null;
  }

  // ── Funding helpers ──────────────────────────────────────────────────────
  fColor(s: string): string {
    return { not_started:'#555', in_progress:'#58a6ff', applied:'#d29922',
             agreement_exists:'#f0883e', received:'#3fb950', declined:'#f85149' }[s] || '#555';
  }
  fLabel(s: string): string { return this.FUNDING_STATUS_LABELS[s] || s; }

  startFundingEdit(f: FundingStream) {
    this.editingFundingId = f._id;
    this.fundingEdit = { raised_usd: f.raised_usd, status: f.status, notes: f.notes };
  }
  saveFunding(id: string) {
    this.http.patch(`http://localhost:3001/api/plan90/funding/${id}`, this.fundingEdit).subscribe({
      next: () => { this.editingFundingId = null; this.load(); },
      error: () => this.snack.open('Save failed', 'OK', { duration: 2500 })
    });
  }
  cancelFunding() { this.editingFundingId = null; }

  // ── Activity log ─────────────────────────────────────────────────────────
  submitActivity() {
    if (!this.newActivity.note?.trim()) return;
    this.http.post<Activity>('http://localhost:3001/api/plan90/activity', this.newActivity).subscribe({
      next: () => { this.addingActivity = false; this.newActivity = this.blankActivity(); this.load(); },
      error: () => this.snack.open('Log failed', 'OK', { duration: 2500 })
    });
  }
  deleteActivity(id: string) {
    this.http.delete(`http://localhost:3001/api/plan90/activity/${id}`).subscribe({
      next: () => this.load(), error: () => {}
    });
  }
  activityTypeColor(t: string): string {
    return { research:'#9b6fd4', writing:'#58a6ff', editing:'#f0883e',
             outreach:'#3fb950', planning:'#d29922', other:'#888' }[t] || '#888';
  }
  groupedActivities(): Record<string, Activity[]> {
    const out: Record<string, Activity[]> = {};
    for (const a of (this.data?.activities || [])) {
      (out[a.date] = out[a.date] || []).push(a);
    }
    return out;
  }

  // ── Investor returns ─────────────────────────────────────────────────────
  startReturnsEdit() {
    if (!this.data?.meta?.investor_returns) return;
    this.returnsEdit = { ...this.data.meta.investor_returns };
    this.editingReturns = true;
  }
  saveReturns() {
    const r = this.returnsEdit;
    r.total_low = (r.publishing_advance_low||0) + (r.ott_rights_low||0) + (r.royalties_5yr_low||0) + (r.translation_rights||0);
    r.total_high = (r.publishing_advance_high||0) + (r.film_option_value||0) + (r.ott_rights_high||0) + (r.royalties_5yr_high||0) + (r.translation_rights||0) + Math.round(((r.film_production_royalty_pct||0)/100) * (r.film_budget_mid||0));
    this.http.patch('http://localhost:3001/api/plan90/meta', { investor_returns: r }).subscribe({
      next: () => { this.editingReturns = false; this.load(); },
      error: () => this.snack.open('Save failed', 'OK', { duration: 2500 })
    });
  }
  filmRoyalty(): number {
    const r = this.data?.meta?.investor_returns;
    if (!r) return 0;
    return Math.round((r.film_production_royalty_pct/100) * r.film_budget_mid);
  }
}
