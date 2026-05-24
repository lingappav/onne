import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { NovelData, MasterNovel, Chapter, Character } from '../models/novel.model';

@Injectable({ providedIn: 'root' })
export class NovelService {
  private readonly API = 'http://localhost:3001/api';
  private _novel = new BehaviorSubject<MasterNovel | null>(null);
  novel$ = this._novel.asObservable();

  constructor(private http: HttpClient) {}

  load(): Observable<NovelData> {
    return this.http.get<NovelData>(`${this.API}/novel`).pipe(
      tap(data => this._novel.next(data.master_novel))
    );
  }

  get snapshot(): MasterNovel | null {
    return this._novel.value;
  }

  saveSection(section: string, data: any): Observable<any> {
    return this.http.patch(`${this.API}/novel/${section}`, data).pipe(
      tap(() => {
        const novel = this._novel.value;
        if (novel) {
          (novel as any)[section] = data;
          this._novel.next({ ...novel });
        }
      })
    );
  }

  saveFullNovel(novel: MasterNovel): Observable<any> {
    return this.http.put(`${this.API}/novel`, { master_novel: novel }).pipe(
      tap(() => this._novel.next({ ...novel }))
    );
  }

  saveCharacter(id: string, char: Character): Observable<any> {
    return this.http.put(`${this.API}/novel/characters/${id}`, char).pipe(
      tap(() => {
        const novel = this._novel.value;
        if (novel) {
          const idx = novel.characters.findIndex(c => c.character_id === id);
          if (idx >= 0) novel.characters[idx] = char;
          this._novel.next({ ...novel });
        }
      })
    );
  }

  addCharacter(char: Character): Observable<any> {
    return this.http.post(`${this.API}/novel/characters`, char).pipe(
      tap(() => {
        const novel = this._novel.value;
        if (novel) {
          novel.characters.push(char);
          this._novel.next({ ...novel });
        }
      })
    );
  }

  deleteCharacter(id: string): Observable<any> {
    return this.http.delete(`${this.API}/novel/characters/${id}`).pipe(
      tap(() => {
        const novel = this._novel.value;
        if (novel) {
          novel.characters = novel.characters.filter(c => c.character_id !== id);
          this._novel.next({ ...novel });
        }
      })
    );
  }

  saveChapter(id: string, chapter: Chapter): Observable<any> {
    return this.http.put(`${this.API}/novel/chapters/${id}`, chapter).pipe(
      tap(() => {
        const novel = this._novel.value;
        if (novel) {
          const idx = novel.chapters.findIndex(c => c.chapter_id === id);
          if (idx >= 0) novel.chapters[idx] = chapter;
          this._novel.next({ ...novel });
        }
      })
    );
  }

  addChapter(chapter: Chapter): Observable<any> {
    return this.http.post(`${this.API}/novel/chapters`, chapter).pipe(
      tap(() => {
        const novel = this._novel.value;
        if (novel) {
          novel.chapters.push(chapter);
          this._novel.next({ ...novel });
        }
      })
    );
  }

  deleteChapter(id: string): Observable<any> {
    return this.http.delete(`${this.API}/novel/chapters/${id}`).pipe(
      tap(() => {
        const novel = this._novel.value;
        if (novel) {
          novel.chapters = novel.chapters.filter(c => c.chapter_id !== id);
          this._novel.next({ ...novel });
        }
      })
    );
  }
}
