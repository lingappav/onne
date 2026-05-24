import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { NovelService } from '../../services/novel.service';
import { ThematicArchitecture } from '../../models/novel.model';

@Component({
  selector: 'app-themes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatExpansionModule, MatTableModule, MatChipsModule],
  templateUrl: './themes.component.html',
  styleUrl: './themes.component.scss'
})
export class ThemesComponent implements OnInit {
  form!: FormGroup;
  themes: ThematicArchitecture | null = null;
  saving = false;
  themeColumns = ['theme', 'weight', 'chapters'];

  constructor(
    private fb: FormBuilder,
    private novelService: NovelService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.novelService.novel$.subscribe(n => {
      if (n && !this.form) {
        this.themes = n.thematic_architecture;
        this.buildForm(n.thematic_architecture);
      }
    });
  }

  buildForm(t: ThematicArchitecture) {
    this.form = this.fb.group({
      central_question: [t.central_question],
      thesis: [t.thesis],
      antithesis: [t.antithesis],
      synthesis: [t.synthesis],
      premise_statement: [t.premise_statement],
      thesis_character: [t.thesis_character],
      antithesis_character: [t.antithesis_character],
      synthesis_moment: [t.synthesis_moment]
    });
  }

  save() {
    if (!this.themes) return;
    const v = this.form.value;
    const updated: ThematicArchitecture = {
      ...this.themes,
      ...v
    };
    this.saving = true;
    this.novelService.saveSection('thematic_architecture', updated).subscribe({
      next: () => { this.snack.open('Themes saved', 'OK', { duration: 2000 }); this.saving = false; },
      error: () => { this.snack.open('Save failed', 'OK', { duration: 3000 }); this.saving = false; }
    });
  }
}
