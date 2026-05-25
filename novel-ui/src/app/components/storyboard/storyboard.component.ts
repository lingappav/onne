import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ClaudeService, StoryboardResult, StoryboardPanel } from '../../services/claude.service';

@Component({
  selector: 'app-storyboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './storyboard.component.html',
  styleUrl: './storyboard.component.scss'
})
export class StoryboardComponent implements OnInit {
  result: StoryboardResult | null = null;
  loading = false;
  activePanel: StoryboardPanel | null = null;
  activePanelIndex = 0;

  constructor(private claude: ClaudeService) {}

  ngOnInit() {
    this.generate();
  }

  generate() {
    this.loading = true;
    this.result = null;
    this.claude.generateStoryboard().subscribe({
      next: (r) => {
        this.result = r;
        this.loading = false;
        if (r.panels.length) {
          this.activePanel = r.panels[0];
          this.activePanelIndex = 0;
        }
      },
      error: () => { this.loading = false; }
    });
  }

  selectPanel(panel: StoryboardPanel, index: number) {
    this.activePanel = panel;
    this.activePanelIndex = index;
  }

  prevPanel() {
    if (!this.result) return;
    const i = Math.max(0, this.activePanelIndex - 1);
    this.selectPanel(this.result.panels[i], i);
  }

  nextPanel() {
    if (!this.result) return;
    const i = Math.min(this.result.panels.length - 1, this.activePanelIndex + 1);
    this.selectPanel(this.result.panels[i], i);
  }

  get isApiConfigured(): boolean { return this.claude.isConfigured; }
}
