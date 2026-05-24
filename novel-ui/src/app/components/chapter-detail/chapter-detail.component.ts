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
import { NovelService } from '../../services/novel.service';
import { Chapter } from '../../models/novel.model';

@Component({
  selector: 'app-chapter-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule,
    MatExpansionModule, MatSliderModule, MatDividerModule],
  templateUrl: './chapter-detail.component.html',
  styleUrl: './chapter-detail.component.scss'
})
export class ChapterDetailComponent implements OnInit {
  form!: FormGroup;
  chapter!: Chapter;
  saving = false;

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
        }
      }
    });
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
