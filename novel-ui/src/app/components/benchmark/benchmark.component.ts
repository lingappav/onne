import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NovelService } from '../../services/novel.service';

interface DimScores { [key: string]: number; }

interface AlgoScores {
  publisher: number;
  netflix: number;
  studio: number;
  awards: number;
  streaming: number;
}

interface DimStat { avg: number; max: number; min: number; }

interface BenchmarkNovel {
  id: string;
  title: string;
  author: string;
  year: number;
  genre: string;
  why_compared: string;
  craft_gap_vs_tpr: string;
  notable_craft: string[];
  streaming_greenlights: string[];
  adaptation_note: string;
  dimensions: DimScores;
  algo_scores: AlgoScores;
}

interface Insight {
  dimension: string;
  tpr_score: number;
  benchmark_avg: number;
  benchmark_max: number;
  best_novel: string;
  gap_from_avg: number;
  gap_from_max: number;
  status: string;
  craft_note: string;
}

interface BenchmarkResponse {
  tpr: {
    title: string;
    author: string;
    overall_score: number;
    tier: string;
    dimensions: DimScores;
    algo_scores: AlgoScores;
  };
  benchmarks: BenchmarkNovel[];
  dim_stats: { [key: string]: DimStat };
  insights: Insight[];
  algo_descriptions: { [key: string]: string };
}

@Component({
  selector: 'app-benchmark',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './benchmark.component.html',
  styleUrl: './benchmark.component.scss'
})
export class BenchmarkComponent implements OnInit {
  data: BenchmarkResponse | null = null;
  loading = true;
  error = '';
  expandedNovel: string | null = null;
  activeTab: 'radar' | 'table' | 'insights' = 'radar';

  readonly DIMS = [
    'protagonist_depth','antagonist_strength','thematic_coherence','prose_craft',
    'structural_integrity','political_authenticity','narrative_tension',
    'emotional_resonance','originality','commercial_reach'
  ];

  readonly DIM_LABELS: Record<string, string> = {
    protagonist_depth:      'Protagonist',
    antagonist_strength:    'Antagonist',
    thematic_coherence:     'Theme',
    prose_craft:            'Prose',
    structural_integrity:   'Structure',
    political_authenticity: 'Authenticity',
    narrative_tension:      'Tension',
    emotional_resonance:    'Emotion',
    originality:            'Originality',
    commercial_reach:       'Commercial'
  };

  readonly ALGO_LABELS: Record<string, string> = {
    publisher: 'Publisher',
    netflix:   'Netflix',
    studio:    'Studio',
    awards:    'Awards',
    streaming: 'Streaming'
  };

  readonly ALGO_ICONS: Record<string, string> = {
    publisher: 'auto_stories',
    netflix:   'movie_filter',
    studio:    'theaters',
    awards:    'emoji_events',
    streaming: 'cast'
  };

  readonly CX = 290;
  readonly CY = 290;
  readonly R  = 220;
  readonly N  = 10;

  readonly GRID_FRACS = [0.25, 0.5, 0.75, 1.0];

  readonly Math = Math;

  constructor(private http: HttpClient, private novelService: NovelService) {}

  ngOnInit() {
    this.novelService.activeVersion$.subscribe(v => this.loadAnalysis(v));
  }

  loadAnalysis(version: string) {
    this.loading = true;
    const q = version ? `?version=${version}` : '';
    this.http.get<BenchmarkResponse>(`http://localhost:3001/api/benchmark/analysis${q}`)
      .subscribe({
        next: d  => { this.data = d; this.loading = false; },
        error: () => { this.error = 'Could not load benchmark analysis. Is the API running?'; this.loading = false; }
      });
  }

  // ── Radar chart helpers ────────────────────────────────────────────────────

  angleRad(i: number): number {
    return (i / this.N) * 2 * Math.PI - Math.PI / 2;
  }

  axisEnd(i: number): { x: number; y: number } {
    const a = this.angleRad(i);
    return { x: this.CX + this.R * Math.cos(a), y: this.CY + this.R * Math.sin(a) };
  }

  labelPos(i: number): { x: number; y: number } {
    const a = this.angleRad(i);
    const pad = 32;
    return { x: this.CX + (this.R + pad) * Math.cos(a), y: this.CY + (this.R + pad) * Math.sin(a) };
  }

  gridRing(frac: number): string {
    return Array.from({ length: this.N }, (_, i) => {
      const a = this.angleRad(i);
      return `${this.CX + this.R * frac * Math.cos(a)},${this.CY + this.R * frac * Math.sin(a)}`;
    }).join(' ');
  }

  polygon(scores: number[]): string {
    return scores.map((s, i) => {
      const a = this.angleRad(i);
      const f = s / 100;
      return `${this.CX + this.R * f * Math.cos(a)},${this.CY + this.R * f * Math.sin(a)}`;
    }).join(' ');
  }

  get tprScores(): number[] {
    return this.data ? this.DIMS.map(k => this.data!.tpr.dimensions[k]) : [];
  }

  get avgScores(): number[] {
    return this.data ? this.DIMS.map(k => this.data!.dim_stats[k].avg) : [];
  }

  get maxScores(): number[] {
    return this.data ? this.DIMS.map(k => this.data!.dim_stats[k].max) : [];
  }

  dimLabel(k: string): string {
    return this.DIM_LABELS[k] || k;
  }

  dotX(score: number, i: number): number {
    return this.CX + this.R * (score / 100) * Math.cos(this.angleRad(i));
  }

  dotY(score: number, i: number): number {
    return this.CY + this.R * (score / 100) * Math.sin(this.angleRad(i));
  }

  ringLabelY(frac: number): number {
    return this.CY - this.R * frac - 4;
  }

  scoreAnnotX(i: number): number {
    return this.CX + this.R * 0.55 * Math.cos(this.angleRad(i));
  }

  scoreAnnotY(i: number): number {
    return this.CY + this.R * 0.55 * Math.sin(this.angleRad(i));
  }

  // ── Algorithm card helpers ─────────────────────────────────────────────────

  algoKeys(): string[] {
    return ['publisher','netflix','studio','awards','streaming'];
  }

  tprAlgo(k: string): number {
    return this.data ? (this.data.tpr.algo_scores as any)[k] : 0;
  }

  benchmarkAlgoAvg(k: string): number {
    if (!this.data) return 0;
    const scores = this.data.benchmarks.map(b => (b.algo_scores as any)[k] as number);
    return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
  }

  benchmarkAlgoMax(k: string): number {
    if (!this.data) return 0;
    return Math.max(...this.data.benchmarks.map(b => (b.algo_scores as any)[k] as number));
  }

  rankTPR(k: string): number {
    if (!this.data) return 0;
    const tprScore = (this.data.tpr.algo_scores as any)[k];
    const all = [tprScore, ...this.data.benchmarks.map(b => (b.algo_scores as any)[k])].sort((a, b) => b - a);
    return all.findIndex(s => s === tprScore) + 1;
  }

  // ── Insight helpers ────────────────────────────────────────────────────────

  statusColor(status: string): string {
    const map: Record<string, string> = {
      strength:         '#3fb950',
      competitive:      '#58a6ff',
      minor_gap:        '#d29922',
      significant_gap:  '#f0883e',
      critical_gap:     '#f85149'
    };
    return map[status] || '#888';
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      strength:        'Strength',
      competitive:     'Competitive',
      minor_gap:       'Minor Gap',
      significant_gap: 'Gap',
      critical_gap:    'Critical Gap'
    };
    return map[status] || status;
  }

  toggleNovel(id: string) {
    this.expandedNovel = this.expandedNovel === id ? null : id;
  }

  getAlgoScore(b: BenchmarkNovel, k: string): number {
    return (b.algo_scores as any)[k] ?? 0;
  }

  trackByNovel(_: number, b: BenchmarkNovel): string { return b.id; }
  trackByInsight(_: number, ins: Insight): string { return ins.dimension; }
  trackByAlgo(_: number, k: string): string { return k; }
}
