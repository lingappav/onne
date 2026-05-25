import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-vision-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './vision-landing.component.html',
  styleUrl: './vision-landing.component.scss'
})
export class VisionLandingComponent {

  journey = [
    {
      phase: '01',
      icon: 'create',
      title: 'Writer\'s Creative Freedom',
      body: 'The author is given full creative latitude to write the novel — no studio interference, no compromise. Every character, every scene, every word is the writer\'s own. This is literature first.'
    },
    {
      phase: '02',
      icon: 'auto_stories',
      title: 'Novel as Pre-Production',
      body: 'A fully developed novel is worth more than any treatment or script. It contains character psychology, world-building, tone, pacing — every asset a director needs before a single frame is planned.'
    },
    {
      phase: '03',
      icon: 'movie',
      title: 'Sunday Cinemas Acquires Rights',
      body: 'Sunday Cinemas has secured the film option for "The President\'s Rule" — recognising it as exactly the kind of story that modern large-scale cinema is built on: high-stakes, character-driven, politically charged.'
    },
    {
      phase: '04',
      icon: 'animation',
      title: '100% AI-Animated Feature Film',
      body: 'For the first time, a $10K production budget funds a complete animated feature via AI. 1,000 early backers each pre-order the book for $10 — and together they greenlight the movie.'
    },
    {
      phase: '05',
      icon: 'groups',
      title: 'From Immediate Circle to the World',
      body: 'The first 1,000 copies come from the author\'s immediate circle — people who know the story, trust the writer, and believe in the vision. They are not just buyers. They are the founding audience.'
    },
    {
      phase: '06',
      icon: 'clapperboard',
      title: 'Handed to the Director\'s Table',
      body: 'Once the novel is complete and funded, the full manuscript — rich with cinematic detail — goes to the director. No back-and-forth, no rewrites requested from scratch. The novel IS the blueprint.'
    },
  ];

  pillars = [
    { icon: 'shield', label: 'Author Rights Protected', detail: 'Print, sequel, and prose rights remain with the writer. Sunday Cinemas holds only the film option.' },
    { icon: 'attach_money', label: '$10 per Book · $10K Goal', detail: '1,000 pre-orders × $10 = $10,000 production budget for the animated film. Every book directly funds a frame.' },
    { icon: 'verified', label: 'No Middlemen', detail: 'No traditional publisher gatekeeping. No Hollywood development hell. The writer and the audience fund it together.' },
    { icon: 'movie_creation', label: 'AI Animation Breakthrough', detail: 'Modern AI animation tools make a full feature possible at $10K — a budget that was impossible three years ago.' },
  ];
}
