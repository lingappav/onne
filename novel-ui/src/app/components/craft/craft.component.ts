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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { NovelService } from '../../services/novel.service';
import { CraftAssessment } from '../../models/novel.model';

@Component({
  selector: 'app-craft',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatExpansionModule, MatProgressBarModule, MatTableModule],
  templateUrl: './craft.component.html',
  styleUrl: './craft.component.scss'
})
export class CraftComponent implements OnInit {
  form!: FormGroup;
  craft: CraftAssessment | null = null;
  saving = false;
  gapColumns = ['severity', 'gap', 'fix'];
  priorityColumns = ['rank', 'category', 'issue', 'fix'];

  constructor(
    private fb: FormBuilder,
    private novelService: NovelService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.novelService.novel$.subscribe(n => {
      if (n && !this.form) {
        this.craft = n.craft_assessment;
        this.buildForm(n.craft_assessment);
      }
    });
  }

  buildForm(c: CraftAssessment) {
    const dims = c.sudowrite_benchmark.dimensions;
    this.form = this.fb.group({
      overall_tier: [c.sudowrite_benchmark.overall_tier],
      score_out_of_100: [c.sudowrite_benchmark.score_out_of_100],
      justification: [c.sudowrite_benchmark.justification],
      readiness: [c.award_potential.readiness],
      closest_category: [c.award_potential.closest_category],
      ...Object.fromEntries(Object.entries(dims).map(([k, v]) => [k, [v]]))
    });
  }

  get dimensions(): { key: string }[] {
    return Object.keys(this.craft?.sudowrite_benchmark?.dimensions ?? {}).map(k => ({ key: k }));
  }

  save() {
    if (!this.craft) return;
    const v = this.form.value;
    const dims: Record<string, number> = {};
    for (const k of Object.keys(this.craft.sudowrite_benchmark.dimensions)) {
      dims[k] = +v[k];
    }
    const updated: CraftAssessment = {
      ...this.craft,
      sudowrite_benchmark: {
        ...this.craft.sudowrite_benchmark,
        overall_tier: v.overall_tier,
        score_out_of_100: +v.score_out_of_100,
        justification: v.justification,
        dimensions: dims
      },
      award_potential: {
        ...this.craft.award_potential,
        readiness: v.readiness,
        closest_category: v.closest_category
      }
    };
    this.saving = true;
    this.novelService.saveSection('craft_assessment', updated).subscribe({
      next: () => { this.snack.open('Craft saved', 'OK', { duration: 2000 }); this.saving = false; },
      error: () => { this.snack.open('Save failed', 'OK', { duration: 3000 }); this.saving = false; }
    });
  }
}
