import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { NovelData, MasterNovel, Chapter, Character } from '../models/novel.model';

export interface VersionEntry {
  version: string;
  filename: string;
  timestamp: string;
  description: string;
  parent: string | null;
}

export interface DiffChange {
  path: string;
  type: 'added' | 'removed' | 'changed';
  oldValue: any;
  newValue: any;
}

export interface DiffResult {
  v1: string;
  v2: string;
  totalChanges: number;
  changes: DiffChange[];
}

@Injectable({ providedIn: 'root' })
export class NovelService {
  private readonly API = 'http://localhost:3001/api';

  private _novel    = new BehaviorSubject<MasterNovel | null>(null);
  private _versions = new BehaviorSubject<VersionEntry[]>([]);
  private _activeVersion = new BehaviorSubject<string>('');

  novel$         = this._novel.asObservable();
  versions$      = this._versions.asObservable();
  activeVersion$ = this._activeVersion.asObservable();

  constructor(private http: HttpClient) {}

  // ── version management ────────────────────────────────────────────────────

  loadVersions(): Observable<VersionEntry[]> {
    return this.http.get<VersionEntry[]>(`${this.API}/versions`).pipe(
      tap(vs => {
        this._versions.next(vs);
        if (vs.length && !this._activeVersion.value) {
          this._activeVersion.next(vs[vs.length - 1].version);
        }
      })
    );
  }

  loadNovel(version?: string): Observable<NovelData> {
    const url = version
      ? `${this.API}/novel?version=${version}`
      : `${this.API}/novel`;
    return this.http.get<NovelData>(url).pipe(
      tap(d => this._novel.next(d.master_novel))
    );
  }

  switchVersion(tag: string): Observable<NovelData> {
    this._activeVersion.next(tag);
    return this.loadNovel(tag);
  }

  saveNewVersion(description: string): Observable<{ ok: boolean; version: string; entry: VersionEntry }> {
    const data = { master_novel: this._novel.value };
    return this.http.post<any>(`${this.API}/versions`, {
      data,
      description,
      parentVersion: this._activeVersion.value
    }).pipe(
      tap(res => {
        const vs = [...this._versions.value, res.entry];
        this._versions.next(vs);
        this._activeVersion.next(res.version);
      })
    );
  }

  getDiff(v1: string, v2: string): Observable<DiffResult> {
    return this.http.get<DiffResult>(`${this.API}/diff?v1=${v1}&v2=${v2}`);
  }

  // ── data accessors ────────────────────────────────────────────────────────

  get snapshot(): MasterNovel | null { return this._novel.value; }
  get activeVersion(): string        { return this._activeVersion.value; }

  // ── section patches — always create new version ───────────────────────────

  saveSection(section: string, data: any, description?: string): Observable<any> {
    return this.http.patch(`${this.API}/novel/section`, {
      version: this._activeVersion.value,
      section,
      data,
      description: description ?? `Updated ${section}`
    }).pipe(
      tap((res: any) => {
        const novel = this._novel.value;
        if (novel) {
          (novel as any)[section] = data;
          this._novel.next({ ...novel });
        }
        if (res?.entry) {
          const vs = [...this._versions.value, res.entry];
          this._versions.next(vs);
          this._activeVersion.next(res.version);
        }
      })
    );
  }

  saveBeat(beatNumber: number, beat: any): Observable<any> {
    const novel = this._novel.value;
    if (!novel) return new Observable(s => s.error('No novel loaded'));
    const beats = [...novel.structural_map.beat_sheet.beats];
    const idx = beats.findIndex(b => b.beat_number === beatNumber);
    if (idx >= 0) beats[idx] = beat; else beats.push(beat);
    const updatedMap = { ...novel.structural_map, beat_sheet: { ...novel.structural_map.beat_sheet, beats } };
    return this.saveSection('structural_map', updatedMap, `Beat ${beatNumber} updated`);
  }

  saveCharacter(id: string, char: Character): Observable<any> {
    return this.http.put(`${this.API}/novel/characters/${id}?version=${this._activeVersion.value}`, char).pipe(
      tap((res: any) => {
        const novel = this._novel.value;
        if (novel) {
          const idx = novel.characters.findIndex(c => c.character_id === id);
          if (idx >= 0) novel.characters[idx] = char;
          this._novel.next({ ...novel });
        }
        if (res?.entry) {
          const vs = [...this._versions.value, res.entry];
          this._versions.next(vs);
          this._activeVersion.next(res.version);
        }
      })
    );
  }

  addCharacter(char: Character): Observable<any> {
    return this.http.post(`${this.API}/novel/characters`, char).pipe(
      tap((res: any) => {
        const novel = this._novel.value;
        if (novel) { novel.characters.push(char); this._novel.next({ ...novel }); }
        if (res?.entry) {
          this._versions.next([...this._versions.value, res.entry]);
          this._activeVersion.next(res.version);
        }
      })
    );
  }

  deleteCharacter(id: string): Observable<any> {
    return this.http.delete(`${this.API}/novel/characters/${id}`).pipe(
      tap((res: any) => {
        const novel = this._novel.value;
        if (novel) { novel.characters = novel.characters.filter(c => c.character_id !== id); this._novel.next({ ...novel }); }
        if (res?.entry) {
          this._versions.next([...this._versions.value, res.entry]);
          this._activeVersion.next(res.version);
        }
      })
    );
  }

  saveChapter(id: string, chapter: Chapter): Observable<any> {
    return this.http.put(`${this.API}/novel/chapters/${id}?version=${this._activeVersion.value}`, chapter).pipe(
      tap((res: any) => {
        const novel = this._novel.value;
        if (novel) {
          const idx = novel.chapters.findIndex(c => c.chapter_id === id);
          if (idx >= 0) novel.chapters[idx] = chapter;
          this._novel.next({ ...novel });
        }
        if (res?.entry) {
          this._versions.next([...this._versions.value, res.entry]);
          this._activeVersion.next(res.version);
        }
      })
    );
  }

  addChapter(chapter: Chapter): Observable<any> {
    return this.http.post(`${this.API}/novel/chapters`, chapter).pipe(
      tap((res: any) => {
        const novel = this._novel.value;
        if (novel) { novel.chapters.push(chapter); this._novel.next({ ...novel }); }
        if (res?.entry) {
          this._versions.next([...this._versions.value, res.entry]);
          this._activeVersion.next(res.version);
        }
      })
    );
  }

  deleteChapter(id: string): Observable<any> {
    return this.http.delete(`${this.API}/novel/chapters/${id}`).pipe(
      tap((res: any) => {
        const novel = this._novel.value;
        if (novel) { novel.chapters = novel.chapters.filter(c => c.chapter_id !== id); this._novel.next({ ...novel }); }
        if (res?.entry) {
          this._versions.next([...this._versions.value, res.entry]);
          this._activeVersion.next(res.version);
        }
      })
    );
  }
}
