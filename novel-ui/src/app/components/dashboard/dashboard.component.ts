import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NovelService } from '../../services/novel.service';
import { MasterNovel } from '../../models/novel.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatProgressBarModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  novel: MasterNovel | null = null;

  cards = [
    { label: 'Metadata',        icon: 'info_outline',   route: '/metadata',   color: '#5c85d6' },
    { label: 'Themes',          icon: 'psychology',     route: '/themes',     color: '#9b6fd4' },
    { label: 'Structure',       icon: 'account_tree',   route: '/structure',  color: '#c8962c' },
    { label: 'Chapters',        icon: 'menu_book',      route: '/chapters',   color: '#3fb950' },
    { label: 'Characters',      icon: 'people_outline', route: '/characters', color: '#e06c75' },
    { label: 'Narrative',       icon: 'auto_stories',   route: '/narrative',  color: '#56b6c2' },
    { label: 'Craft Score',     icon: 'star_outline',   route: '/craft',      color: '#d29922' },
    { label: 'Continuity',      icon: 'warning_amber',  route: '/continuity', color: '#f85149' },
    { label: 'References',      icon: 'library_books',  route: '/references', color: '#8b8b8b' }
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

  get statItems() {
    return [
      { label: 'Est. Words',  value: (this.novel?.metadata?.word_count_estimated ?? 0).toLocaleString(), icon: 'text_snippet', color: '#5c85d6' },
      { label: 'Chapters',    value: String(this.novel?.metadata?.chapter_count ?? 0),                   icon: 'menu_book',    color: '#3fb950' },
      { label: 'Characters',  value: String(this.novel?.characters?.length ?? 0),                        icon: 'people',       color: '#e06c75' },
      { label: 'Acts',        value: String(this.novel?.metadata?.act_count ?? 0),                       icon: 'account_tree', color: '#c8962c' },
      { label: 'Craft Score', value: String(this.score),                                                  icon: 'star',         color: '#d29922' },
      { label: 'Tier',        value: this.novel?.metadata?.sudowrite_quality_tier ?? '',                  icon: 'workspace_premium', color: '#9b6fd4' },
    ];
  }
}
