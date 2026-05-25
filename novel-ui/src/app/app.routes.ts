import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'vision',
    loadComponent: () => import('./components/vision-landing/vision-landing.component').then(m => m.VisionLandingComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'presale',
    loadComponent: () => import('./components/presale/presale.component').then(m => m.PresaleComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin-panel',
    loadComponent: () => import('./components/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent),
    canActivate: [adminGuard]
  },
  { path: '', redirectTo: 'vision', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'metadata',
    loadComponent: () => import('./components/metadata/metadata.component').then(m => m.MetadataComponent)
  },
  {
    path: 'themes',
    loadComponent: () => import('./components/themes/themes.component').then(m => m.ThemesComponent)
  },
  {
    path: 'structure',
    loadComponent: () => import('./components/structure/structure.component').then(m => m.StructureComponent)
  },
  {
    path: 'chapters',
    loadComponent: () => import('./components/chapters/chapters.component').then(m => m.ChaptersComponent)
  },
  {
    path: 'chapters/:id',
    loadComponent: () => import('./components/chapter-detail/chapter-detail.component').then(m => m.ChapterDetailComponent)
  },
  {
    path: 'characters',
    loadComponent: () => import('./components/characters/characters.component').then(m => m.CharactersComponent)
  },
  {
    path: 'characters/:id',
    loadComponent: () => import('./components/character-detail/character-detail.component').then(m => m.CharacterDetailComponent)
  },
  {
    path: 'narrative',
    loadComponent: () => import('./components/narrative/narrative.component').then(m => m.NarrativeComponent)
  },
  {
    path: 'craft',
    loadComponent: () => import('./components/craft/craft.component').then(m => m.CraftComponent)
  },
  {
    path: 'continuity',
    loadComponent: () => import('./components/continuity/continuity.component').then(m => m.ContinuityComponent)
  },
  {
    path: 'references',
    loadComponent: () => import('./components/references/references.component').then(m => m.ReferencesComponent)
  },
  {
    path: 'benchmark',
    loadComponent: () => import('./components/benchmark/benchmark.component').then(m => m.BenchmarkComponent)
  },
  {
    path: 'chapter-workshop',
    loadComponent: () => import('./components/chapter-workshop/chapter-workshop.component').then(m => m.ChapterWorkshopComponent)
  },
  {
    path: 'pitch-status',
    loadComponent: () => import('./components/pitch-status/pitch-status.component').then(m => m.PitchStatusComponent)
  },
  {
    path: 'film-agreement',
    loadComponent: () => import('./components/film-agreement/film-agreement.component').then(m => m.FilmAgreementComponent)
  },
  {
    path: 'copywriting-tasks',
    loadComponent: () => import('./components/copywriting-tasks/copywriting-tasks.component').then(m => m.CopywritingTasksComponent)
  },
  {
    path: 'plan90',
    loadComponent: () => import('./components/plan90/plan90.component').then(m => m.Plan90Component)
  },
  {
    path: 'storyboard',
    loadComponent: () => import('./components/storyboard/storyboard.component').then(m => m.StoryboardComponent)
  }
];
