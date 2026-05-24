import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NovelService, VersionEntry, DiffResult, DiffChange } from '../../services/novel.service';

@Component({
  selector: 'app-version-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatSelectModule,
    MatFormFieldModule, MatTooltipModule, MatChipsModule, MatProgressSpinnerModule],
  templateUrl: './version-panel.component.html',
  styleUrl: './version-panel.component.scss'
})
export class VersionPanelComponent implements OnInit {
  @Output() versionChanged = new EventEmitter<string>();

  versions: VersionEntry[] = [];
  activeVersion = '';
  diffV1 = '';
  diffV2 = '';
  diffResult: DiffResult | null = null;
  diffLoading = false;
  expandedPaths = new Set<string>();
  filterType: 'all' | 'added' | 'removed' | 'changed' = 'all';

  constructor(private novelService: NovelService) {}

  ngOnInit() {
    this.novelService.versions$.subscribe(vs => {
      this.versions = vs;
      if (vs.length >= 2) {
        this.diffV1 = vs[0].version;
        this.diffV2 = vs[vs.length - 1].version;
      }
    });
    this.novelService.activeVersion$.subscribe(v => this.activeVersion = v);
  }

  switchTo(tag: string) {
    this.novelService.switchVersion(tag).subscribe();
    this.versionChanged.emit(tag);
  }

  get sortedVersions(): VersionEntry[] {
    return [...this.versions].reverse();
  }

  runDiff() {
    if (!this.diffV1 || !this.diffV2) return;
    this.diffLoading = true;
    this.diffResult = null;
    this.novelService.getDiff(this.diffV1, this.diffV2).subscribe({
      next: r => { this.diffResult = r; this.diffLoading = false; },
      error: () => this.diffLoading = false
    });
  }

  get filteredChanges(): DiffChange[] {
    if (!this.diffResult) return [];
    if (this.filterType === 'all') return this.diffResult.changes;
    return this.diffResult.changes.filter(c => c.type === this.filterType);
  }

  formatValue(v: any): string {
    if (v === undefined || v === null) return '—';
    if (typeof v === 'string') return v.length > 120 ? v.slice(0, 120) + '…' : v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    const s = JSON.stringify(v, null, 2);
    return s.length > 200 ? s.slice(0, 200) + '…' : s;
  }

  pathLabel(p: string): string {
    const parts = p.split('.');
    return parts[parts.length - 1];
  }

  parentPath(p: string): string {
    const parts = p.split('.');
    return parts.slice(0, -1).join(' › ');
  }

  get addedCount():   number { return this.diffResult?.changes.filter(c => c.type === 'added').length ?? 0; }
  get removedCount(): number { return this.diffResult?.changes.filter(c => c.type === 'removed').length ?? 0; }
  get changedCount(): number { return this.diffResult?.changes.filter(c => c.type === 'changed').length ?? 0; }

  versionLabel(v: VersionEntry): string {
    const d = new Date(v.timestamp);
    return `${v.version} — ${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  }
}
