import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { NovelService } from '../../services/novel.service';
import { ReferenceDocument } from '../../models/novel.model';

@Component({
  selector: 'app-references',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatExpansionModule, MatIconModule, MatChipsModule],
  templateUrl: './references.component.html',
  styleUrl: './references.component.scss'
})
export class ReferencesComponent implements OnInit {
  refs: ReferenceDocument[] = [];

  constructor(private novelService: NovelService) {}

  ngOnInit() {
    this.novelService.novel$.subscribe(n => {
      if (n) this.refs = n.reference_documents;
    });
  }
}
