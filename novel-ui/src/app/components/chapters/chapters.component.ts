import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NovelService } from '../../services/novel.service';
import { Chapter } from '../../models/novel.model';

@Component({
  selector: 'app-chapters',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule,
    MatSnackBarModule, MatTableModule, MatChipsModule, MatTooltipModule],
  templateUrl: './chapters.component.html',
  styleUrl: './chapters.component.scss'
})
export class ChaptersComponent implements OnInit {
  chapters: Chapter[] = [];
  displayedColumns = ['number', 'id', 'title', 'act', 'actions'];

  constructor(
    private novelService: NovelService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.novelService.novel$.subscribe(n => {
      if (n) this.chapters = n.chapters;
    });
  }

  getActForChapter(ch: Chapter): string {
    const novel = this.novelService.snapshot;
    if (!novel) return '';
    for (const act of novel.structural_map.acts) {
      if (act.chapter_ids.includes(ch.chapter_id)) return act.act_label;
    }
    return '';
  }

  deleteChapter(id: string) {
    if (!confirm(`Delete chapter ${id}?`)) return;
    this.novelService.deleteChapter(id).subscribe({
      next: () => this.snack.open('Chapter deleted', 'OK', { duration: 2000 }),
      error: () => this.snack.open('Delete failed', 'OK', { duration: 3000 })
    });
  }
}
