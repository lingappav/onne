import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { JournalService, JournalPost, Comment } from '../../services/journal.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-journal-post',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './journal-post.component.html',
  styleUrl: './journal-post.component.scss'
})
export class JournalPostComponent implements OnInit {
  post: JournalPost | null = null;
  paragraphs: string[] = [];
  prev: JournalPost | null = null;
  next: JournalPost | null = null;
  loading = true;

  // Edit mode
  editing = false;
  saving = false;
  editDraft: Partial<JournalPost> = {};

  // Comments / conversation
  comments: Comment[] = [];
  commentsLoading = false;

  // Reader AI chat input
  readerName = '';
  readerInput = '';
  aiThinking = false;

  // Writer reply state: commentId -> draft text
  replyDrafts: Record<string, string> = {};
  replyOpen: Record<string, boolean> = {};
  replySaving: Record<string, boolean> = {};

  categories = [
    { id: 'process',   label: 'Writing Process' },
    { id: 'research',  label: 'Research' },
    { id: 'craft',     label: 'Craft' },
    { id: 'democracy', label: 'Democracy' },
    { id: 'community', label: 'Community' },
  ];

  constructor(
    private route: ActivatedRoute,
    private journal: JournalService,
    private http: HttpClient,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id')!;
      this.loadPost(id);
    });
  }

  loadPost(id: string) {
    this.loading = true;
    this.journal.get(id).subscribe({
      next: post => {
        this.post = post;
        this.paragraphs = post.body.split('\n\n').filter(p => p.trim());
        this.loading = false;
        this.loadSiblings(id);
        this.loadComments(id);
      },
      error: () => { this.loading = false; }
    });
  }

  loadSiblings(id: string) {
    this.journal.list().subscribe(all => {
      const sorted = [...all].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const idx = sorted.findIndex(p => p.id === id);
      this.next = idx > 0 ? sorted[idx - 1] : null;
      this.prev = idx < sorted.length - 1 ? sorted[idx + 1] : null;
    });
  }

  loadComments(postId: string) {
    this.commentsLoading = true;
    this.journal.getComments(postId).subscribe({
      next: c => { this.comments = c; this.commentsLoading = false; },
      error: () => { this.commentsLoading = false; }
    });
  }

  // ── Edit mode ────────────────────────────────────────────────────────────
  startEdit() {
    if (!this.post) return;
    this.editDraft = {
      title: this.post.title,
      subtitle: this.post.subtitle,
      category: this.post.category,
      date: this.post.date,
      readingMinutes: this.post.readingMinutes,
      body: this.post.body,
    };
    this.editing = true;
  }

  cancelEdit() { this.editing = false; }

  saveEdit() {
    if (!this.post || !this.editDraft.title?.trim() || !this.editDraft.body?.trim()) return;
    this.saving = true;
    this.journal.update(this.post.id, this.editDraft).subscribe({
      next: updated => {
        this.post = updated;
        this.paragraphs = updated.body.split('\n\n').filter(p => p.trim());
        this.editing = false;
        this.saving = false;
        this.snack.open('Entry saved', 'OK', { duration: 3000 });
      },
      error: () => {
        this.saving = false;
        this.snack.open('Save failed', 'OK', { duration: 3000 });
      }
    });
  }

  // ── AI chat ──────────────────────────────────────────────────────────────
  sendAiMessage() {
    if (!this.post || !this.readerInput.trim()) return;
    const question = this.readerInput.trim();
    const name = this.readerName.trim() || 'Reader';
    this.readerInput = '';
    this.aiThinking = true;

    // First persist the reader's question as a reader comment
    this.journal.addComment(this.post.id, name, question).subscribe({
      next: readerComment => {
        this.comments.push(readerComment);
        this.callClaude(question, readerComment);
      },
      error: () => {
        this.aiThinking = false;
        this.snack.open('Could not send message', 'OK', { duration: 3000 });
      }
    });
  }

  private callClaude(question: string, readerComment: Comment) {
    if (!this.post) return;
    const postContext = `Journal entry titled "${this.post.title}" by Vishwa Shambhulingappa.\n\nSubtitle: ${this.post.subtitle}\n\nFull text:\n${this.post.body}`;

    const body = {
      model: 'claude-opus-4-7',
      max_tokens: 800,
      system: `You are assisting readers of Vishwa Shambhulingappa's writer's journal for the novel "The President's Rule". Respond thoughtfully and conversationally to reader questions about this journal entry. Keep responses to 2–4 paragraphs. Stay in the voice of a thoughtful literary assistant who understands the novel's themes: integrity in governance, Karnataka politics, the writer's craft, and the Sunday Cinemas novel-to-film vision. Do not pretend to be Vishwa — you are answering on behalf of the journal.`,
      messages: [
        { role: 'user', content: `Context — journal entry:\n\n${postContext}\n\n---\n\nReader question: ${question}` }
      ]
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': environment.anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-calls': 'true'
    });

    this.http.post<any>('https://api.anthropic.com/v1/messages', body, { headers }).subscribe({
      next: resp => {
        const aiText = resp.content?.[0]?.text ?? 'No response.';
        // Store AI response as an AI reply linked to the reader comment
        const commentId = (readerComment as any)._id ?? '';
        this.journal.aiReply(this.post!.id, commentId, aiText).subscribe({
          next: aiComment => {
            this.comments.push(aiComment);
            this.aiThinking = false;
          },
          error: () => {
            // Fallback: show inline
            this.comments.push({
              postId: this.post!.id, author: 'AI', text: aiText, type: 'ai'
            } as Comment);
            this.aiThinking = false;
          }
        });
      },
      error: () => {
        this.aiThinking = false;
        this.comments.push({
          postId: this.post!.id,
          author: 'AI',
          text: 'The AI assistant is unavailable right now. The writer will respond shortly.',
          type: 'ai'
        } as Comment);
      }
    });
  }

  // ── Writer replies ────────────────────────────────────────────────────────
  toggleReply(commentId: string) {
    this.replyOpen[commentId] = !this.replyOpen[commentId];
    if (!this.replyDrafts[commentId]) this.replyDrafts[commentId] = '';
  }

  submitReply(commentId: string) {
    if (!this.post || !this.replyDrafts[commentId]?.trim()) return;
    this.replySaving[commentId] = true;
    this.journal.writerReply(this.post.id, commentId, this.replyDrafts[commentId]).subscribe({
      next: reply => {
        this.comments.push(reply);
        this.replyDrafts[commentId] = '';
        this.replyOpen[commentId] = false;
        this.replySaving[commentId] = false;
        this.snack.open('Reply posted', 'OK', { duration: 2000 });
      },
      error: () => {
        this.replySaving[commentId] = false;
        this.snack.open('Reply failed', 'OK', { duration: 3000 });
      }
    });
  }

  // ── Utilities ─────────────────────────────────────────────────────────────
  categoryLabel(id: string): string {
    return this.categories.find(c => c.id === id)?.label ?? id;
  }

  topLevelComments(): Comment[] {
    return this.comments.filter(c => !c.replyTo);
  }

  repliesFor(commentId: string): Comment[] {
    return this.comments.filter(c => c.replyTo === commentId);
  }

  commentId(c: Comment): string {
    return (c as any)._id ?? '';
  }
}
