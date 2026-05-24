import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NovelService } from '../../services/novel.service';
import { StructuralMap } from '../../models/novel.model';

@Component({
  selector: 'app-structure',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule,
    MatExpansionModule, MatTableModule, MatChipsModule, MatProgressBarModule],
  templateUrl: './structure.component.html',
  styleUrl: './structure.component.scss'
})
export class StructureComponent implements OnInit {
  structuralMap: StructuralMap | null = null;
  beatColumns = ['beat_number', 'beat_name', 'chapter_id', 'strength_rating', 'craft_notes'];

  constructor(private novelService: NovelService) {}

  ngOnInit() {
    this.novelService.novel$.subscribe(n => {
      if (n) this.structuralMap = n.structural_map;
    });
  }
}
