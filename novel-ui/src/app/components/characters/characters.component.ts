import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { NovelService } from '../../services/novel.service';
import { Character } from '../../models/novel.model';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule,
    MatSnackBarModule, MatTableModule, MatChipsModule],
  templateUrl: './characters.component.html',
  styleUrl: './characters.component.scss'
})
export class CharactersComponent implements OnInit {
  characters: Character[] = [];
  displayedColumns = ['id', 'name', 'role', 'arc', 'appearances', 'actions'];

  constructor(
    private novelService: NovelService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.novelService.novel$.subscribe(n => {
      if (n) this.characters = n.characters;
    });
  }

  deleteCharacter(id: string) {
    if (!confirm(`Delete character ${id}?`)) return;
    this.novelService.deleteCharacter(id).subscribe({
      next: () => this.snack.open('Character deleted', 'OK', { duration: 2000 }),
      error: () => this.snack.open('Delete failed', 'OK', { duration: 3000 })
    });
  }
}
