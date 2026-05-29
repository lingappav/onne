import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NovelService, VersionEntry } from './services/novel.service';
import { VersionPanelComponent } from './components/version-panel/version-panel.component';
import { SaveDialogComponent } from './components/save-dialog/save-dialog.component';
import { AuthService, AppUser } from './services/auth.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  group?: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatIconModule, MatButtonModule, MatSnackBarModule, MatDialogModule, MatTooltipModule,
    VersionPanelComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  novelTitle   = "The President's Rule";
  activeVersion = '';
  versions: VersionEntry[] = [];
  versionPanelOpen = false;
  saving = false;
  currentUser: AppUser | null = null;

  navItems: NavItem[] = [
    { path: '/dashboard',  label: 'Dashboard',        icon: 'grid_view',      group: 'overview' },
    { path: '/metadata',   label: 'Metadata',          icon: 'info_outline',   group: 'overview' },
    { path: '/themes',     label: 'Themes & Motifs',   icon: 'psychology',     group: 'craft' },
    { path: '/structure',  label: 'Structure',         icon: 'account_tree',   group: 'craft' },
    { path: '/chapters',   label: 'Chapters',          icon: 'menu_book',      group: 'content' },
    { path: '/characters', label: 'Characters',        icon: 'people_outline', group: 'content' },
    { path: '/narrative',  label: 'Narrative Intel',   icon: 'auto_stories',   group: 'analysis' },
    { path: '/craft',      label: 'Craft Score',       icon: 'star_outline',   group: 'analysis' },
    { path: '/continuity', label: 'Continuity',        icon: 'warning_amber',  group: 'analysis' },
    { path: '/references', label: 'References',        icon: 'library_books',  group: 'analysis' },
    { path: '/benchmark',         label: 'Benchmark Lab',     icon: 'science',        group: 'intelligence' },
    { path: '/chapter-workshop',  label: 'Chapter Workshop',  icon: 'edit_note',      group: 'intelligence' },
    { path: '/pitch-status',      label: 'Pitch Status',      icon: 'send',           group: 'business' },
    { path: '/film-agreement',    label: 'Sunday Cinemas',    icon: 'movie',          group: 'business' },
    { path: '/copywriting-tasks', label: 'Copywriting Tasks', icon: 'task_alt',       group: 'business' },
    { path: '/plan90',            label: '90-Day Plan',       icon: 'rocket_launch',  group: 'business' },
    { path: '/vision',            label: 'Vision & Film',     icon: 'theaters',       group: 'presale' },
    { path: '/storyboard',        label: 'AI Storyboard',     icon: 'movie_filter',   group: 'presale' },
    { path: '/journal',           label: 'Writer\'s Journal', icon: 'edit_note',      group: 'presale' },
    { path: '/presale',           label: 'Book Pre-Sale',     icon: 'storefront',     group: 'presale' },
    { path: '/admin-panel',       label: 'Admin Panel',       icon: 'shield',         group: 'presale' },
  ];

  groups = [
    { id: 'overview',      label: 'Overview' },
    { id: 'craft',         label: 'Craft' },
    { id: 'content',       label: 'Content' },
    { id: 'analysis',      label: 'Analysis' },
    { id: 'intelligence',  label: 'Intelligence' },
    { id: 'business',      label: 'Business' },
    { id: 'presale',       label: 'Presale & Funding' },
  ];

  constructor(
    private novelService: NovelService,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.novelService.loadVersions().subscribe(() => {
      this.novelService.loadNovel().subscribe();
    });
    this.novelService.activeVersion$.subscribe(v => this.activeVersion = v);
    this.novelService.versions$.subscribe(vs => this.versions = vs);
    this.novelService.novel$.subscribe(n => {
      if (n?.metadata?.title) this.novelTitle = n.metadata.title;
    });
    this.authService.user$.subscribe(u => this.currentUser = u);
  }

  signOut() {
    this.authService.signOut().subscribe(() => this.router.navigate(['/login']));
  }

  get isAdmin(): boolean { return this.authService.isAdmin; }

  navItemsForGroup(g: string): NavItem[] {
    return this.navItems.filter(i => i.group === g);
  }

  get latestVersion(): string {
    return this.versions.length ? this.versions[this.versions.length - 1].version : '';
  }

  openSaveDialog() {
    const ref = this.dialog.open(SaveDialogComponent, {
      width: '420px',
      data: { currentVersion: this.activeVersion }
    });
    ref.afterClosed().subscribe((description: string) => {
      if (!description) return;
      this.saving = true;
      this.novelService.saveNewVersion(description).subscribe({
        next: (res) => {
          this.saving = false;
          this.snack.open(`Saved as ${res.version}`, 'OK', { duration: 3000 });
        },
        error: () => {
          this.saving = false;
          this.snack.open('Save failed', 'OK', { duration: 3000 });
        }
      });
    });
  }

  toggleVersionPanel() {
    this.versionPanelOpen = !this.versionPanelOpen;
  }
}
