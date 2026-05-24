import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { NovelService } from '../../services/novel.service';
import { ContinuityReport } from '../../models/novel.model';

@Component({
  selector: 'app-continuity',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatExpansionModule, MatIconModule, MatChipsModule],
  templateUrl: './continuity.component.html',
  styleUrl: './continuity.component.scss'
})
export class ContinuityComponent implements OnInit {
  report: ContinuityReport | null = null;
  issueColumns = ['id', 'type', 'severity', 'description', 'fix'];
  threadColumns = ['thread_id', 'status', 'description'];

  constructor(private novelService: NovelService) {}

  ngOnInit() {
    this.novelService.novel$.subscribe(n => {
      if (n) this.report = n.continuity_report;
    });
  }
}
