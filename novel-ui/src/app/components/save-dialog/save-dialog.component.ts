import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-save-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="sd-root">
      <h2 class="sd-title"><mat-icon>save</mat-icon> Save New Version</h2>
      <p class="sd-sub">Based on <code>{{ data.currentVersion }}</code></p>
      <mat-form-field appearance="outline" class="sd-field">
        <mat-label>Version description</mat-label>
        <input matInput [(ngModel)]="description" placeholder="e.g. Updated Sampath psychology" (keydown.enter)="confirm()">
        <mat-hint>Describe what changed in this version</mat-hint>
      </mat-form-field>
      <div class="sd-actions">
        <button mat-button (click)="cancel()">Cancel</button>
        <button mat-flat-button class="sd-save-btn" (click)="confirm()" [disabled]="!description.trim()">
          <mat-icon>check</mat-icon> Save Version
        </button>
      </div>
    </div>
  `,
  styles: [`
    .sd-root { padding: 24px; background: var(--fd-bg-panel); border: 1px solid var(--fd-border); border-radius: 8px; }
    .sd-title { margin: 0 0 6px; font-size: 15px; color: var(--fd-text-primary); display: flex; align-items: center; gap: 8px; mat-icon { color: var(--fd-gold); } }
    .sd-sub { margin: 0 0 18px; font-size: 12px; color: var(--fd-text-muted); code { color: var(--fd-gold); } }
    .sd-field { width: 100%; }
    .sd-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px; }
    .sd-save-btn { background: var(--fd-gold) !important; color: #1a1a1a !important; font-weight: 600 !important; }
  `]
})
export class SaveDialogComponent {
  description = '';
  constructor(
    public dialogRef: MatDialogRef<SaveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentVersion: string }
  ) {}
  confirm() { if (this.description.trim()) this.dialogRef.close(this.description.trim()); }
  cancel()  { this.dialogRef.close(); }
}
