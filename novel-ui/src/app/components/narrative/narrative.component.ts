import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { NovelService } from '../../services/novel.service';
import { NarrativeIntelligence } from '../../models/novel.model';

@Component({
  selector: 'app-narrative',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatTableModule, MatChipsModule],
  templateUrl: './narrative.component.html',
  styleUrl: './narrative.component.scss'
})
export class NarrativeComponent implements OnInit {
  form!: FormGroup;
  narrative: NarrativeIntelligence | null = null;
  saving = false;
  subplotColumns = ['subplot_id', 'subplot_name', 'function', 'resolved'];

  constructor(
    private fb: FormBuilder,
    private novelService: NovelService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.novelService.novel$.subscribe(n => {
      if (n && !this.form) {
        this.narrative = n.narrative_intelligence;
        this.buildForm(n.narrative_intelligence);
      }
    });
  }

  buildForm(ni: NarrativeIntelligence) {
    this.form = this.fb.group({
      pov_strategy: [ni.pov_strategy],
      timeline_structure: [ni.timeline_structure],
      flashback_count: [ni.flashback_count],
      flashback_potential: [ni.flashback_potential],
      flashforward_count: [ni.flashforward_count],
      flashforward_locations: [ni.flashforward_locations.join('\n')],
      narrator_register: [ni.narrator_register]
    });
  }

  save() {
    if (!this.narrative) return;
    const v = this.form.value;
    const updated: NarrativeIntelligence = {
      ...this.narrative,
      pov_strategy: v.pov_strategy,
      timeline_structure: v.timeline_structure,
      flashback_count: +v.flashback_count,
      flashback_potential: v.flashback_potential,
      flashforward_count: +v.flashforward_count,
      flashforward_locations: v.flashforward_locations.split('\n').map((s: string) => s.trim()).filter(Boolean),
      narrator_register: v.narrator_register
    };
    this.saving = true;
    this.novelService.saveSection('narrative_intelligence', updated).subscribe({
      next: () => { this.snack.open('Narrative saved', 'OK', { duration: 2000 }); this.saving = false; },
      error: () => { this.snack.open('Save failed', 'OK', { duration: 3000 }); this.saving = false; }
    });
  }
}
