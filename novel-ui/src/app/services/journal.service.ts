import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface JournalPost {
  _id?: string;
  id: string;
  date: string;
  title: string;
  subtitle: string;
  category: 'process' | 'research' | 'craft' | 'community' | 'democracy';
  readingMinutes: number;
  body: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Comment {
  _id?: string;
  postId: string;
  author: string;
  text: string;
  type: 'reader' | 'writer' | 'ai';
  replyTo?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class JournalService {
  private api = `${environment.apiUrl}/api/journal`;

  constructor(private http: HttpClient) {}

  list(): Observable<JournalPost[]> {
    return this.http.get<JournalPost[]>(this.api);
  }

  get(id: string): Observable<JournalPost> {
    return this.http.get<JournalPost>(`${this.api}/${id}`);
  }

  create(post: Partial<JournalPost>): Observable<JournalPost> {
    return this.http.post<JournalPost>(this.api, post);
  }

  update(id: string, post: Partial<JournalPost>): Observable<JournalPost> {
    return this.http.put<JournalPost>(`${this.api}/${id}`, post);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }

  getComments(postId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.api}/${postId}/comments`);
  }

  addComment(postId: string, author: string, text: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.api}/${postId}/comments`, { author, text });
  }

  writerReply(postId: string, commentId: string, text: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.api}/${postId}/comments/${commentId}/reply`, { text });
  }

  aiReply(postId: string, commentId: string, text: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.api}/${postId}/comments/${commentId}/ai-reply`, { text });
  }
}
