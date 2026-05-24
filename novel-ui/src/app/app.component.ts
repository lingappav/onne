import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { NovelService } from './services/novel.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = "The President's Rule — Novel Editor";
  sidenavOpen = true;

  navItems: NavItem[] = [
    { path: '/dashboard',  label: 'Dashboard',       icon: 'dashboard' },
    { path: '/metadata',   label: 'Metadata',         icon: 'info' },
    { path: '/themes',     label: 'Themes & Motifs',  icon: 'psychology' },
    { path: '/structure',  label: 'Structure & Beats',icon: 'account_tree' },
    { path: '/chapters',   label: 'Chapters',         icon: 'menu_book' },
    { path: '/characters', label: 'Characters',       icon: 'people' },
    { path: '/narrative',  label: 'Narrative Intel',  icon: 'auto_stories' },
    { path: '/craft',      label: 'Craft Assessment', icon: 'star' },
    { path: '/continuity', label: 'Continuity Report',icon: 'report_problem' },
    { path: '/references', label: 'References',       icon: 'library_books' }
  ];

  constructor(private novelService: NovelService) {}

  ngOnInit() {
    this.novelService.load().subscribe();
  }
}
