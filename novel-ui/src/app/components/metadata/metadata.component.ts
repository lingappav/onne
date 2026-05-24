import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { NovelService } from '../../services/novel.service';
import { Metadata } from '../../models/novel.model';

@Component({
  selector: 'app-metadata',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule,
    MatSlideToggleModule, MatDividerModule, MatChipsModule],
  templateUrl: './metadata.component.html',
  styleUrl: './metadata.component.scss'
})
export class MetadataComponent implements OnInit {
  form!: FormGroup;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private novelService: NovelService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.novelService.novel$.subscribe(novel => {
      if (novel && !this.form) {
        this.buildForm(novel.metadata);
      }
    });
  }

  buildForm(m: Metadata) {
    this.form = this.fb.group({
      title: [m.title, Validators.required],
      subtitle: [m.subtitle],
      tone: [m.tone],
      logline: [m.logline],
      tagline: [m.tagline],
      elevator_pitch: [m.elevator_pitch],
      word_count_estimated: [m.word_count_estimated],
      chapter_count: [m.chapter_count],
      act_count: [m.act_count],
      has_prologue: [m.has_prologue],
      has_epilogue: [m.has_epilogue],
      analysis_confidence: [m.analysis_confidence],
      sudowrite_quality_tier: [m.sudowrite_quality_tier],
      rights_status: [m.rights_status],
      // Author
      author_name: [m.author.name],
      author_pen_name: [m.author.pen_name],
      author_swa: [m.author.swa_member_no],
      author_email: [m.author.email],
      author_country: [m.author.country],
      // Arrays stored as newline-separated
      genre: [m.genre.join('\n')],
      subgenre_tags: [m.subgenre_tags.join('\n')],
      comparable_titles: [m.comparable_titles.join('\n')],
      notes_for_revision: [m.notes_for_revision.join('\n')]
    });
  }

  save() {
    if (!this.form.valid) return;
    const v = this.form.value;
    const current = this.novelService.snapshot!.metadata;
    const updated: Metadata = {
      ...current,
      title: v.title,
      subtitle: v.subtitle,
      tone: v.tone,
      logline: v.logline,
      tagline: v.tagline,
      elevator_pitch: v.elevator_pitch,
      word_count_estimated: +v.word_count_estimated,
      chapter_count: +v.chapter_count,
      act_count: +v.act_count,
      has_prologue: v.has_prologue,
      has_epilogue: v.has_epilogue,
      analysis_confidence: v.analysis_confidence,
      sudowrite_quality_tier: v.sudowrite_quality_tier,
      rights_status: v.rights_status,
      genre: v.genre.split('\n').map((s: string) => s.trim()).filter(Boolean),
      subgenre_tags: v.subgenre_tags.split('\n').map((s: string) => s.trim()).filter(Boolean),
      comparable_titles: v.comparable_titles.split('\n').map((s: string) => s.trim()).filter(Boolean),
      notes_for_revision: v.notes_for_revision.split('\n').map((s: string) => s.trim()).filter(Boolean),
      author: {
        name: v.author_name,
        pen_name: v.author_pen_name,
        swa_member_no: v.author_swa,
        email: v.author_email,
        country: v.author_country
      }
    };
    this.saving = true;
    this.novelService.saveSection('metadata', updated).subscribe({
      next: () => { this.snack.open('Metadata saved', 'OK', { duration: 2000 }); this.saving = false; },
      error: () => { this.snack.open('Save failed', 'OK', { duration: 3000 }); this.saving = false; }
    });
  }
}
