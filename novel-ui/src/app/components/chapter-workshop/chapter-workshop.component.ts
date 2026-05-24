import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NovelService } from '../../services/novel.service';

interface ChapterStub {
  chapter_id: string;
  chapter_number: number;
  chapter_title: string;
  act: string;
  beats: string[];
  is_drafted: boolean;
}

interface DimImpact {
  dimension: string;
  current_score: number;
  projected_score: number;
  benchmark_avg: number;
  benchmark_max: number;
  gap_from_avg: number;
  chapter_impact_pts: number;
  priority: string;
}

interface RevisionTask {
  dim: string;
  priority: string;
  score_impact: number;
  task: string;
  benchmark_ref: string;
}

interface WorkshopData {
  chapter: any;
  chapter_id: string;
  chapter_title: string;
  chapter_number: number;
  act: string;
  beats: string[];
  is_drafted: boolean;
  health_score: number;
  all_chapters: ChapterStub[];
  intelligence: {
    dimension_impacts: DimImpact[];
    revision_tasks: RevisionTask[];
    continuity_issues: any[];
    elevation_notes: string[];
  };
}

@Component({
  selector: 'app-chapter-workshop',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatIconModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatSliderModule,
    MatSnackBarModule, MatTooltipModule
  ],
  templateUrl: './chapter-workshop.component.html',
  styleUrl: './chapter-workshop.component.scss'
})
export class ChapterWorkshopComponent implements OnInit {
  data: WorkshopData | null = null;
  loading = false;
  saving = false;
  selectedId = 'CH_01';
  form: FormGroup | null = null;
  activeEditorTab: 'overview' | 'prose' | 'scenes' | 'threads' | 'beats' = 'prose';
  activeVersion = '';

  readonly DIM_LABELS: Record<string, string> = {
    protagonist_depth:'Protagonist Depth', antagonist_strength:'Antagonist Strength',
    thematic_coherence:'Thematic Coherence', prose_craft:'Prose Craft',
    structural_integrity:'Structural Integrity', political_authenticity:'Political Authenticity',
    narrative_tension:'Narrative Tension', emotional_resonance:'Emotional Resonance',
    originality:'Originality', commercial_reach:'Commercial Reach'
  };

  readonly PRIORITY_COLORS: Record<string, string> = {
    critical: '#f85149',
    high:     '#f0883e',
    medium:   '#d29922'
  };

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private novelService: NovelService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.novelService.activeVersion$.subscribe(v => {
      this.activeVersion = v;
      this.loadChapter(this.selectedId, v);
    });
  }

  loadChapter(id: string, version?: string) {
    this.loading = true;
    const v = version || this.activeVersion;
    const q = v ? `?version=${v}` : '';
    this.http.get<WorkshopData>(`http://localhost:3001/api/chapter-workshop/${id}${q}`)
      .subscribe({
        next: d => {
          this.data = d;
          this.selectedId = id;
          this.buildForm(d.chapter);
          this.loading = false;
        },
        error: () => {
          this.snack.open('Could not load chapter workshop. Is the API running?', 'OK', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  onChapterSelect(id: string) {
    this.loadChapter(id);
  }

  buildForm(ch: any) {
    this.form = this.fb.group({
      chapter_title:         [ch?.chapter_title ?? ''],
      chapter_number:        [ch?.chapter_number ?? 0],
      one_line:              [ch?.synopsis?.one_line ?? ''],
      plot_summary:          [ch?.synopsis?.plot_summary ?? ''],
      dramatic_summary:      [ch?.synopsis?.dramatic_summary ?? ''],
      narrative_purpose:     [ch?.intention?.narrative_purpose ?? ''],
      emotional_target:      [ch?.intention?.emotional_target ?? ''],
      thematic_payload:      [ch?.intention?.thematic_payload ?? ''],
      act_position:          [ch?.intention?.act_position ?? ''],
      beat_sheet_position:   [ch?.intention?.beat_sheet_position ?? ''],
      setup_elements:        [ch?.intention?.setup_elements?.join('\n') ?? ''],
      payoff_elements:       [ch?.intention?.payoff_elements?.join('\n') ?? ''],
      dominant_beat_type:    [ch?.beat_patterns?.dominant_beat_type ?? ''],
      emotional_arc:         [ch?.beat_patterns?.emotional_arc ?? ''],
      tension_arc:           [ch?.beat_patterns?.tension_arc ?? ''],
      opening_hook_strength: [ch?.beat_patterns?.opening_hook_strength ?? 5],
      closing_hook_strength: [ch?.beat_patterns?.closing_hook_strength ?? 5],
      cliffhanger:           [ch?.threads?.cliffhanger ?? false],
      cliffhanger_description:[ch?.threads?.cliffhanger_description ?? ''],
      // content tab
      full_prose:            [ch?.content?.full_prose ?? ''],
      unique_details:        [ch?.content?.unique_details?.join('\n') ?? ''],
      key_insight:           [ch?.content?.key_insight ?? '']
    });
  }

  proseWordCount(): number {
    const text = this.form?.get('full_prose')?.value || '';
    return text.split(/\s+/).filter(Boolean).length;
  }

  save() {
    if (!this.form || !this.data) return;
    const v = this.form.value;
    const ch = this.data.chapter;
    const updated = {
      ...(ch || {}),
      chapter_id:     this.selectedId,
      chapter_title:  v.chapter_title,
      chapter_number: +v.chapter_number,
      synopsis: {
        one_line:         v.one_line,
        plot_summary:     v.plot_summary,
        dramatic_summary: v.dramatic_summary
      },
      intention: {
        ...(ch?.intention || {}),
        narrative_purpose:   v.narrative_purpose,
        emotional_target:    v.emotional_target,
        thematic_payload:    v.thematic_payload,
        act_position:        v.act_position,
        beat_sheet_position: v.beat_sheet_position || null,
        setup_elements:  v.setup_elements.split('\n').map((s: string) => s.trim()).filter(Boolean),
        payoff_elements: v.payoff_elements.split('\n').map((s: string) => s.trim()).filter(Boolean),
        inferred: ch?.intention?.inferred ?? false,
        confidence: ch?.intention?.confidence ?? 'medium'
      },
      beat_patterns: {
        dominant_beat_type:    v.dominant_beat_type,
        emotional_arc:         v.emotional_arc,
        tension_arc:           v.tension_arc,
        opening_hook_strength: +v.opening_hook_strength,
        closing_hook_strength: +v.closing_hook_strength
      },
      threads: {
        ...(ch?.threads || { introduced:[], advanced:[], resolved:[] }),
        cliffhanger:             v.cliffhanger,
        cliffhanger_description: v.cliffhanger_description
      },
      content: {
        ...(ch?.content || {}),
        full_prose:     v.full_prose,
        unique_details: v.unique_details.split('\n').map((s: string) => s.trim()).filter(Boolean),
        key_insight:    v.key_insight,
        word_count:     (v.full_prose || '').split(/\s+/).filter(Boolean).length,
        source_file:    ch?.content?.source_file || 'edited_in_app'
      }
    };
    this.saving = true;
    const svc = ch
      ? this.novelService.saveChapter(this.selectedId, updated)
      : this.novelService.addChapter(updated);
    svc.subscribe({
      next: () => {
        this.snack.open(`Chapter ${this.selectedId} saved`, 'OK', { duration: 2500 });
        this.saving = false;
        this.loadChapter(this.selectedId);
      },
      error: () => {
        this.snack.open('Save failed', 'OK', { duration: 3000 });
        this.saving = false;
      }
    });
  }

  // ── helpers ───────────────────────────────────────────────────────────────

  priorityColor(p: string): string { return this.PRIORITY_COLORS[p] || '#888'; }

  priorityLabel(p: string): string {
    return { critical:'Critical', high:'High', medium:'Medium' }[p] || p;
  }

  actColor(act: string): string {
    return { 'Setup':'#58a6ff', 'Confrontation':'#f0883e', 'Resolution':'#3fb950', 'Prologue':'#9b6fd4' }[act] || '#888';
  }

  healthColor(score: number): string {
    if (score >= 80) return '#3fb950';
    if (score >= 50) return '#d29922';
    return '#f85149';
  }

  projectionDelta(imp: DimImpact): number {
    return imp.projected_score - imp.current_score;
  }

  uniqueDims(tasks: RevisionTask[]): string[] {
    return [...new Set(tasks.map(t => t.dim))];
  }

  get criticalTasks(): RevisionTask[] {
    return this.data?.intelligence.revision_tasks.filter(t => t.priority === 'critical') || [];
  }

  get highTasks(): RevisionTask[] {
    return this.data?.intelligence.revision_tasks.filter(t => t.priority === 'high') || [];
  }

  get mediumTasks(): RevisionTask[] {
    return this.data?.intelligence.revision_tasks.filter(t => t.priority === 'medium') || [];
  }

  get totalScorePotential(): number {
    if (!this.data) return 0;
    return this.data.intelligence.revision_tasks.reduce((s, t) => s + t.score_impact, 0);
  }

  get scorePotentialText(): string {
    const pts = this.totalScorePotential;
    if (pts >= 10) return `+${pts} pts across dimensions`;
    if (pts >= 5)  return `+${pts} pts improvement`;
    return `+${pts} pts`;
  }
}
