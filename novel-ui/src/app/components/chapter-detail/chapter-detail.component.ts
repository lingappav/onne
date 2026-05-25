import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NovelService } from '../../services/novel.service';
import { Chapter, Beat, ReferenceDocument, MasterNovel } from '../../models/novel.model';

export interface RefBook {
  id: string;
  title: string;
  author: string;
  year: number;
  why: string;
  themes: string[];
  notes: string;
}

@Component({
  selector: 'app-chapter-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule,
    MatExpansionModule, MatSliderModule, MatDividerModule, MatChipsModule,
    MatTooltipModule, MatProgressBarModule],
  templateUrl: './chapter-detail.component.html',
  styleUrl: './chapter-detail.component.scss'
})
export class ChapterDetailComponent implements OnInit {
  form!: FormGroup;
  chapter!: Chapter;
  saving = false;

  // ── intelligence panels ───────────────────────────────────────────────────
  beatForChapter: Beat | null = null;
  prevChapterId: string | null = null;
  nextChapterId: string | null = null;
  referenceDocs: ReferenceDocument[] = [];
  benchmarkComps: RefBook[] = [];
  craftGaps: Array<{ gap: string; severity: string; fix: string }> = [];
  revisionNotes: string[] = [];

  // ── real-world reference books that benchmark against this chapter ─────────
  private readonly ALL_BENCHMARKS: RefBook[] = [
    { id: 'animal_farm',          title: 'Animal Farm',              author: 'George Orwell',        year: 1945, why: 'political-allegory',         themes: ['power','language','fable'],           notes: 'Study how policy feels dramatic through character. Apply to any chapter where Sampath issues a directive.' },
    { id: 'all_the_kings_men',    title: "All the King's Men",       author: 'Robert Penn Warren',   year: 1946, why: 'honest-man-in-machine',      themes: ['populism','idealism','corruption'],   notes: "Sampath is the photographic inverse of Willie Stark. Use for face-to-face confrontation chapters (Ch 17, 21)." },
    { id: 'train_to_pakistan',    title: 'Train to Pakistan',        author: 'Khushwant Singh',      year: 1956, why: 'one-man-vs-system',          themes: ['moral-weight','Indian-political'],    notes: 'Model for spare, morally weighted Indian prose. Benchmark confrontation chapters.' },
    { id: 'english_august',       title: 'English, August',          author: 'Upamanyu Chatterjee',  year: 1988, why: 'IAS-bureaucratic-texture',   themes: ['bureaucracy','IAS','comic-honesty'],  notes: 'For texture of daily administration — use for Chs 7, 5.' },
    { id: 'the_insider',          title: 'The Insider',              author: 'P.V. Narasimha Rao',   year: 1998, why: 'actual-Indian-machinery',     themes: ['Delhi-State','centre-state'],         notes: 'Validate every Delhi–Karnataka scene against this. Most accurate Indian political machinery reference.' },
    { id: 'wolf_hall',            title: 'Wolf Hall',                author: 'Hilary Mantel',        year: 2009, why: 'administrator-as-protagonist',themes: ['competence','court-politics','strategy'], notes: "Cromwell is Sampath's literary cousin. Study interiority and chapter pacing." },
    { id: 'primary_colors',       title: 'Primary Colors',           author: 'Joe Klein',            year: 1996, why: 'media-as-antagonist',        themes: ['media','campaign','image-vs-substance'], notes: 'Useful for Ch 4 (Digital Backlash) and Ch 13 (RIP Moment).' },
    { id: 'white_tiger',          title: 'The White Tiger',          author: 'Aravind Adiga',        year: 2008, why: 'india-corruption-anatomy',   themes: ['class','corruption','dark-comedy'],   notes: "Voice model for Prabhakar scenes and any underbelly passage." },
    { id: 'wolf_hall_2',          title: 'The Great Indian Novel',   author: 'Shashi Tharoor',       year: 1989, why: 'constitutional-moment-fic',  themes: ['satire','India','myth-mapped'],        notes: 'Direct precedent for fictionalising an Indian constitutional moment.' },
    { id: 'plot_against_america', title: 'The Plot Against America', author: 'Philip Roth',          year: 2004, why: 'constitutional-breakdown',   themes: ['democracy','family','alt-history'],   notes: "Domestic impact of political crisis — model for Priyadarshini scenes." },
    { id: 'midnights_children',   title: "Midnight's Children",      author: 'Salman Rushdie',       year: 1981, why: 'nation-as-patient-metaphor', themes: ['nation','memory','individual-as-state'], notes: "'Doctor treats democracy' kinship. Study the chapter-as-organ pattern for medical metaphor chapters." },
  ];

  // ── chapter → benchmark mapping ───────────────────────────────────────────
  private readonly CH_BENCHMARKS: Record<string, string[]> = {
    'CH_00_PROLOGUE':  ['midnights_children', 'animal_farm'],
    'CH_01':           ['wolf_hall', 'plot_against_america'],
    'CH_02':           ['the_insider', 'all_the_kings_men'],
    'CH_03':           ['english_august', 'the_insider'],
    'CH_04':           ['primary_colors', 'animal_farm'],
    'CH_05':           ['english_august', 'wolf_hall'],
    'CH_06':           ['wolf_hall', 'all_the_kings_men'],
    'CH_07':           ['english_august', 'the_insider'],
    'CH_08':           ['the_insider', 'wolf_hall'],
    'CH_09':           ['all_the_kings_men', 'train_to_pakistan'],
    'CH_10':           ['primary_colors', 'wolf_hall'],
    'CH_11':           ['plot_against_america', 'english_august'],
    'CH_12':           ['primary_colors', 'animal_farm'],
    'CH_13':           ['primary_colors', 'all_the_kings_men'],
    'CH_14':           ['wolf_hall', 'the_insider'],
    'CH_15':           ['wolf_hall', 'train_to_pakistan'],
    'CH_16':           ['the_insider', 'all_the_kings_men'],
    'CH_17':           ['all_the_kings_men', 'train_to_pakistan', 'wolf_hall'],
    'CH_18':           ['plot_against_america', 'midnights_children'],
    'CH_19':           ['english_august', 'white_tiger'],
    'CH_20':           ['midnights_children', 'wolf_hall'],
    'CH_21':           ['train_to_pakistan', 'all_the_kings_men', 'the_insider'],
    'CH_22':           ['wolf_hall', 'the_insider'],
    'CH_23':           ['wolf_hall', 'midnights_children'],
    'CH_24':           ['animal_farm', 'midnights_children'],
    'CH_EPILOGUE':     ['midnights_children', 'plot_against_america'],
  };

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private novelService: NovelService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.novelService.novel$.subscribe(novel => {
      if (novel && !this.form) {
        const ch = novel.chapters.find(c => c.chapter_id === id);
        if (ch) {
          this.chapter = ch;
          this.buildForm(ch);
          this.buildIntelligence(id, novel);
        }
      }
    });
  }

  private buildIntelligence(id: string, novel: MasterNovel) {
    // Beat for this chapter
    this.beatForChapter = novel.structural_map.beat_sheet.beats.find(b => b.chapter_id === id) ?? null;

    // Prev / next navigation
    const idx = novel.chapters.findIndex(c => c.chapter_id === id);
    this.prevChapterId = idx > 0 ? novel.chapters[idx - 1].chapter_id : null;
    this.nextChapterId = idx < novel.chapters.length - 1 ? novel.chapters[idx + 1].chapter_id : null;

    // Reference documents that influence this chapter
    this.referenceDocs = novel.reference_documents.filter(r =>
      r.influences_chapters.includes(id)
    );

    // Craft gaps that affect this chapter
    if (novel.craft_assessment?.critical_gaps) {
      this.craftGaps = novel.craft_assessment.critical_gaps
        .filter(g => g.affected_chapters.includes(id))
        .map(g => ({ gap: g.gap, severity: g.severity, fix: g.fix }));
    }

    // Revision notes from metadata that reference this chapter
    this.revisionNotes = (novel.metadata.notes_for_revision ?? []).filter(n =>
      n.includes(id.replace('CH_', 'Ch ')) ||
      n.toLowerCase().includes(id.toLowerCase())
    );

    // Benchmark comps for this chapter
    const compIds = this.CH_BENCHMARKS[id] ?? [];
    this.benchmarkComps = compIds
      .map(cid => this.ALL_BENCHMARKS.find(b => b.id === cid))
      .filter((b): b is RefBook => !!b);
  }

  buildForm(ch: Chapter) {
    this.form = this.fb.group({
      chapter_title: [ch.chapter_title],
      chapter_number: [ch.chapter_number],
      // synopsis
      one_line: [ch.synopsis?.one_line ?? ''],
      plot_summary: [ch.synopsis?.plot_summary ?? ''],
      dramatic_summary: [ch.synopsis?.dramatic_summary ?? ''],
      // intention
      narrative_purpose: [ch.intention?.narrative_purpose ?? ''],
      emotional_target: [ch.intention?.emotional_target ?? ''],
      thematic_payload: [ch.intention?.thematic_payload ?? ''],
      act_position: [ch.intention?.act_position ?? ''],
      beat_sheet_position: [ch.intention?.beat_sheet_position ?? ''],
      confidence: [ch.intention?.confidence ?? ''],
      setup_elements: [ch.intention?.setup_elements?.join('\n') ?? ''],
      payoff_elements: [ch.intention?.payoff_elements?.join('\n') ?? ''],
      // beat patterns
      dominant_beat_type: [ch.beat_patterns?.dominant_beat_type ?? ''],
      emotional_arc: [ch.beat_patterns?.emotional_arc ?? ''],
      tension_arc: [ch.beat_patterns?.tension_arc ?? ''],
      opening_hook_strength: [ch.beat_patterns?.opening_hook_strength ?? 5],
      closing_hook_strength: [ch.beat_patterns?.closing_hook_strength ?? 5],
      // threads
      cliffhanger: [ch.threads?.cliffhanger ?? false],
      cliffhanger_description: [ch.threads?.cliffhanger_description ?? ''],
    });
  }

  strengthColor(v: number): string {
    if (v >= 9) return '#2e7d32';
    if (v >= 7) return '#1565c0';
    if (v >= 5) return '#e65100';
    return '#c62828';
  }

  strengthLabel(v: number): string {
    if (v >= 9) return 'Exceptional';
    if (v >= 7) return 'Strong';
    if (v >= 5) return 'Fair';
    return 'Needs Work';
  }

  severityColor(s: string): string {
    const m: Record<string, string> = { critical: '#c62828', high: '#e65100', medium: '#e65100', low: '#1565c0' };
    return m[s] ?? '#555';
  }

  save() {
    if (!this.form) return;
    const v = this.form.value;
    const updated: Chapter = {
      ...this.chapter,
      chapter_title: v.chapter_title,
      chapter_number: +v.chapter_number,
      synopsis: {
        one_line: v.one_line,
        plot_summary: v.plot_summary,
        dramatic_summary: v.dramatic_summary
      },
      intention: {
        ...this.chapter.intention!,
        narrative_purpose: v.narrative_purpose,
        emotional_target: v.emotional_target,
        thematic_payload: v.thematic_payload,
        act_position: v.act_position,
        beat_sheet_position: v.beat_sheet_position || null,
        confidence: v.confidence,
        setup_elements: v.setup_elements.split('\n').map((s: string) => s.trim()).filter(Boolean),
        payoff_elements: v.payoff_elements.split('\n').map((s: string) => s.trim()).filter(Boolean),
        inferred: this.chapter.intention?.inferred ?? false
      },
      beat_patterns: {
        dominant_beat_type: v.dominant_beat_type,
        emotional_arc: v.emotional_arc,
        tension_arc: v.tension_arc,
        opening_hook_strength: +v.opening_hook_strength,
        closing_hook_strength: +v.closing_hook_strength
      },
      threads: {
        ...this.chapter.threads!,
        cliffhanger: v.cliffhanger,
        cliffhanger_description: v.cliffhanger_description
      }
    };
    this.saving = true;
    this.novelService.saveChapter(this.chapter.chapter_id, updated).subscribe({
      next: () => {
        this.chapter = updated;
        this.snack.open('Chapter saved', 'OK', { duration: 2000 });
        this.saving = false;
      },
      error: () => { this.snack.open('Save failed', 'OK', { duration: 3000 }); this.saving = false; }
    });
  }
}
