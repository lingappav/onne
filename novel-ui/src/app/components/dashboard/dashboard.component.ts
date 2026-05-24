import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NovelService } from '../../services/novel.service';
import { MasterNovel } from '../../models/novel.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule, MatProgressBarModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  novel: MasterNovel | null = null;

  cards = [
    { label: 'Metadata',        icon: 'info',           route: '/metadata',   color: '#3f51b5' },
    { label: 'Themes & Motifs', icon: 'psychology',     route: '/themes',     color: '#9c27b0' },
    { label: 'Structure & Beats',icon: 'account_tree',  route: '/structure',  color: '#f57c00' },
    { label: 'Chapters',        icon: 'menu_book',      route: '/chapters',   color: '#00897b' },
    { label: 'Characters',      icon: 'people',         route: '/characters', color: '#e91e63' },
    { label: 'Narrative Intel', icon: 'auto_stories',   route: '/narrative',  color: '#0288d1' },
    { label: 'Craft Assessment',icon: 'star',           route: '/craft',      color: '#f9a825' },
    { label: 'Continuity',      icon: 'report_problem', route: '/continuity', color: '#d32f2f' },
    { label: 'References',      icon: 'library_books',  route: '/references', color: '#5d4037' }
  ];

  constructor(private novelService: NovelService) {}

  ngOnInit() {
    this.novelService.novel$.subscribe(n => this.novel = n);
  }

  get score(): number {
    return this.novel?.craft_assessment?.sudowrite_benchmark?.score_out_of_100 ?? 0;
  }

  get dimensions(): { key: string; val: number }[] {
    const dims = this.novel?.craft_assessment?.sudowrite_benchmark?.dimensions ?? {};
    return Object.entries(dims).map(([key, val]) => ({ key, val }));
  }
}
