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
import { MatTableModule } from '@angular/material/table';
import { NovelService } from '../../services/novel.service';
import { Character } from '../../models/novel.model';

@Component({
  selector: 'app-character-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatExpansionModule, MatTableModule],
  templateUrl: './character-detail.component.html',
  styleUrl: './character-detail.component.scss'
})
export class CharacterDetailComponent implements OnInit {
  form!: FormGroup;
  character!: Character;
  saving = false;
  moodColumns = ['chapter_id', 'emotional_state', 'motivation', 'key_choice'];

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
        const ch = novel.characters.find(c => c.character_id === id);
        if (ch) {
          this.character = ch;
          this.buildForm(ch);
        }
      }
    });
  }

  buildForm(c: Character) {
    this.form = this.fb.group({
      full_name: [c.full_name],
      aliases: [c.aliases?.join(', ') ?? ''],
      role: [c.role],
      archetype: [c.archetype],
      age_range: [c.age_range ?? ''],
      origin: [c.origin ?? ''],
      profession: [c.profession ?? ''],
      // psychology
      ghost: [c.psychology?.ghost ?? ''],
      want: [c.psychology?.want ?? ''],
      need: [c.psychology?.need ?? ''],
      lie_they_believe: [c.psychology?.lie_they_believe ?? ''],
      fear: [c.psychology?.fear ?? ''],
      flaw: [c.psychology?.flaw ?? ''],
      strength: [c.psychology?.strength ?? ''],
      fatal_flaw: [c.psychology?.fatal_flaw ?? ''],
      // arc
      arc_type: [c.arc?.arc_type ?? ''],
      arc_summary: [c.arc?.arc_summary ?? ''],
      transformation_moment: [c.arc?.transformation_moment ?? ''],
      // other
      voice_signature: [c.voice_signature ?? ''],
      symbolic_associations: [c.symbolic_associations?.join(', ') ?? ''],
      chapters_present: [c.chapters_present?.join(', ') ?? ''],
      first_appearance: [c.first_appearance ?? ''],
      last_appearance: [c.last_appearance ?? '']
    });
  }

  save() {
    const v = this.form.value;
    const updated: Character = {
      ...this.character,
      full_name: v.full_name,
      aliases: v.aliases.split(',').map((s: string) => s.trim()).filter(Boolean),
      role: v.role,
      archetype: v.archetype,
      age_range: v.age_range || undefined,
      origin: v.origin || undefined,
      profession: v.profession || undefined,
      psychology: {
        ...this.character.psychology,
        ghost: v.ghost,
        want: v.want,
        need: v.need || null,
        lie_they_believe: v.lie_they_believe,
        fear: v.fear || null,
        flaw: v.flaw || null,
        strength: v.strength,
        fatal_flaw: v.fatal_flaw || undefined
      },
      arc: {
        arc_type: v.arc_type,
        arc_summary: v.arc_summary,
        transformation_moment: v.transformation_moment || null
      },
      voice_signature: v.voice_signature,
      symbolic_associations: v.symbolic_associations.split(',').map((s: string) => s.trim()).filter(Boolean),
      chapters_present: v.chapters_present.split(',').map((s: string) => s.trim()).filter(Boolean),
      first_appearance: v.first_appearance,
      last_appearance: v.last_appearance
    };
    this.saving = true;
    this.novelService.saveCharacter(this.character.character_id, updated).subscribe({
      next: () => {
        this.character = updated;
        this.snack.open('Character saved', 'OK', { duration: 2000 });
        this.saving = false;
      },
      error: () => { this.snack.open('Save failed', 'OK', { duration: 3000 }); this.saving = false; }
    });
  }
}
