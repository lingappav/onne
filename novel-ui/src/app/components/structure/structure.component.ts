import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { NovelService } from '../../services/novel.service';
import { StructuralMap, Beat } from '../../models/novel.model';

// ── Full static chapter catalogue (all 26 chapters) ──────────────────────────
interface ChapterMeta {
  id: string;
  number: number | string;
  title: string;
  act: string;
  actLabel: string;
  beatTags: string[];
  keyInsight: string;
  wordCount: number;
  quotes: string[];
  uniqueDetails: string[];
}

// ── Coverage record (derived at runtime) ─────────────────────────────────────
export interface ChapterCoverage {
  chapter: ChapterMeta;
  beats: Array<{ num: number; name: string; anchor: boolean; strength: number }>;
  covered: boolean;
  coverageType: 'anchor' | 'supporting' | 'orphan';
  /** Where this chapter truly fits in the Save the Cat architecture */
  beatFit: string;
  /** Why it was left out / what it contributes that no beat captures */
  cohesionNote: string;
  /** Recommendation: add to existing beat, split beat, or leave as connective tissue */
  recommendation: string;
  recommendedBeat: string | null;
}

@Component({
  selector: 'app-structure',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatExpansionModule, MatTableModule, MatChipsModule,
    MatProgressBarModule, MatTooltipModule,
    MatFormFieldModule, MatInputModule,
    MatSnackBarModule, MatTabsModule,
  ],
  templateUrl: './structure.component.html',
  styleUrl: './structure.component.scss'
})
export class StructureComponent implements OnInit {
  structuralMap: StructuralMap | null = null;

  // beat sheet tab
  editingBeat: Beat | null = null;
  editForm!: FormGroup;
  saving = false;

  // coverage tab
  coverageRows: ChapterCoverage[] = [];
  coverageFilter: 'all' | 'anchor' | 'supporting' | 'orphan' = 'all';

  // ── Static chapter catalogue ──────────────────────────────────────────────
  private readonly CHAPTERS: ChapterMeta[] = [
    { id:'CH_00_PROLOGUE', number:0,         title:'Prologue',                               act:'ACT_1', actLabel:'Prologue',     beatTags:['thematic_prologue'],                                                               wordCount:320,  keyInsight:'Politics as malignancy that talks. The treating physician\'s first task is recognising he is now treating a patient that does not want to be cured.',                                                    quotes:['This is the story of one year he spent trying to treat a patient that did not want to be cured.'], uniqueDetails:['Interior monologue — no external event','Medical metaphor established before Ch 1'] },
    { id:'CH_01',          number:1,         title:'The Broken Compass',                     act:'ACT_1', actLabel:'Setup',        beatTags:['inciting_incident','world_building','rising_tension','moral_test','external_pressure','internal_conflict','crisis_response'], wordCount:1467, keyInsight:'Sampath\'s third choice — neither surrender nor seizure, but principled refusal — establishes the novel\'s moral grammar.',                                                                                   quotes:['We are not sacrificial goats they can drag into politics whenever they want.'],                   uniqueDetails:['Half-eaten dal, children\'s schoolbags, retirement diary — domestic inventory','SUVs on gravel','Third choice motif'] },
    { id:'CH_02',          number:2,         title:'Delhi Gambit',                           act:'ACT_1', actLabel:'Setup',        beatTags:['inciting_incident','world_building','moral_test','internal_conflict'],                wordCount:364,  keyInsight:'Delhi\'s political calculus uses integrity as a costume — an honest man provides deniability unless he refuses to be a puppet.',                                                                           quotes:['On my own merit. I have always left speechless those who doubted me.'],                            uniqueDetails:['President described as "a woman of severe grace"','Deal sealed not in ink but in expectation','Only 364 words — shortest chapter'] },
    { id:'CH_03',          number:3,         title:'Language and a Bad Punchline',           act:'ACT_1', actLabel:'Setup',        beatTags:['world_building'],                                                                     wordCount:316,  keyInsight:'Language is a loyalty test in Indian politics. Sampath\'s refusal to be apologetic or performative disarms the trap.',                                                                                    quotes:['Learn in 90 days or find another job — with full heart.'],                                        uniqueDetails:['IAS officer whispered line','Writes agenda items in Kannada','316 words — very short'] },
    { id:'CH_04',          number:4,         title:'Digital Backlash',                       act:'ACT_1', actLabel:'Setup',        beatTags:['inciting_incident','world_building','rising_tension'],                               wordCount:348,  keyInsight:'Digital backlash against honest administrators is a designed system — it outsources silencing to anonymous crowds.',                                                                                       quotes:['We are not running a startup — we are running a state. Get back to work.'],                        uniqueDetails:['#GoSampathGo and #AntiSampath','Diluting Machine — Sampath\'s label for social media'] },
    { id:'CH_05',          number:5,         title:'Triple Agenda',                          act:'ACT_1', actLabel:'Setup',        beatTags:['inciting_incident','world_building','climax','policy_didactic','crisis_response'],    wordCount:306,  keyInsight:'Dignity requires expectation. Linking benefits to productivity is the most difficult form of respect.',                                                                                                   quotes:['I am no longer your ATM. But I will be your partner.'],                                            uniqueDetails:['Three agenda items: Fiscal Sanity, Law Reset, Welfare Rationalisation','Radio bypass','Kodagu farmer on cracked phone'] },
    { id:'CH_06',          number:6,         title:'Ethical Anchor',                         act:'ACT_1', actLabel:'Setup',        beatTags:['moral_test','internal_conflict','policy_didactic'],                                   wordCount:376,  keyInsight:'Corruption in India arrives as generosity, friendship, pragmatism — never as itself.',                                                                                                                    quotes:['Today was not a victory. It was merely the price of staying upright in a tilted room.'],           uniqueDetails:['Rs. 500 crore bribe as CSR dinner','Sampath asks for the bill','Diary entry'] },
    { id:'CH_07',          number:7,         title:'The High-Octane Friday',                 act:'ACT_1', actLabel:'Setup',        beatTags:['external_pressure','crisis_response'],                                                wordCount:329,  keyInsight:'Governance at its best is not dramatic — it is relentless, grinding, unglamorous decision-making.',                                                                                                       quotes:['A functioning democracy would be nice.'],                                                          uniqueDetails:['Seven specific crises in eight hours','3 PM window walk','No new cess — targeted tax drive'] },
    { id:'CH_08',          number:8,         title:'Cash Transactions and the Shadow Economy', act:'ACT_1', actLabel:'Setup',      beatTags:['world_building','rising_tension','external_pressure'],                               wordCount:367,  keyInsight:'Black money is a governance culture, not just an economic problem. Disrupting it requires absorbing the fury of those who profit from opacity.',                                                            quotes:['If we remove the money from this system, what breaks, and what can we rebuild?'],                  uniqueDetails:['Rs. 36,000 crore annually','Bootleg infrastructure — Sampath\'s coinage','70% compliance Day 22'] },
    { id:'CH_09',          number:9,         title:'Midnight Incision',                      act:'ACT_2', actLabel:'Confrontation', beatTags:['inciting_incident','world_building','external_pressure','crisis_response'],           wordCount:346,  keyInsight:'Reform requires the willingness to act at midnight — when the machinery of delay and sabotage is most active.',                                                                                           quotes:['The process was followed. The files are safe. Let the law work.'],                                 uniqueDetails:['11:47 PM call','Three simultaneous actions at 12:30 AM','No press, no hashtags','Counter-attack in three papers'] },
    { id:'CH_10',          number:10,        title:'Shadow Siege',                           act:'ACT_2', actLabel:'Confrontation', beatTags:['world_building','rising_tension','internal_conflict','policy_didactic'],             wordCount:327,  keyInsight:'Political character assassination in the social media age operates through volume and speed, not truth.',                                                                                              quotes:['Cancerous cells are expert at disguise. But the immune system, if strong enough, always knows.'],  uniqueDetails:['#DirtyDoctor and #ShameOnSampath','Fabricated audio clip','Mispronunciation looped 10M times in 48h','Diary entry'] },
    { id:'CH_11',          number:11,        title:'The No Alcohol Dilemma',                 act:'ACT_2', actLabel:'Confrontation', beatTags:['external_pressure','internal_conflict','policy_didactic'],                          wordCount:328,  keyInsight:'Public health governance in India is perpetually hostage to the politics of pleasure.',                                                                                                                  quotes:['Because the bootleg mafia that profits from no regulation is killing people quietly, and nobody films that.'], uniqueDetails:['40% retail outlet reduction','Priyadarshini\'s dinner question','Comedian\'s viral reel'] },
    { id:'CH_12',          number:12,        title:'The Stray Dog Dilemma',                  act:'ACT_2', actLabel:'Confrontation', beatTags:['external_pressure','policy_didactic'],                                              wordCount:330,  keyInsight:'Urban governance in India is judged by its controversies, not its competencies.',                                                                                                                       quotes:[],                                                                                                  uniqueDetails:['Child mauled in Shivajinagar','300+ bite cases daily','#NaayiSarkar and #BowBowDictatorship','45% reduction in a month','No one trends that.'] },
    { id:'CH_13',          number:13,        title:'The RIP Moment',                         act:'ACT_2', actLabel:'Confrontation', beatTags:['external_pressure','crisis_response'],                                              wordCount:334,  keyInsight:'In Indian democracy, the loudest funeral for a reform is proof that the reform is working.',                                                                                                             quotes:['The people of Kodagu need rice, not rhetoric. I\'ll respond when they\'re safe.'],                uniqueDetails:['Palace Grounds rally — 100,000 people','Simultaneous Kodagu flood relief','Carrying supply box in rain after 14 deaths','Clip goes viral without orchestration'] },
    { id:'CH_14',          number:14,        title:'The Pitch Deck — Spying and Surveillance', act:'ACT_2', actLabel:'Confrontation', beatTags:['world_building','rising_tension','internal_conflict','climax','policy_didactic'], wordCount:331,  keyInsight:'The architecture of control extends into the administrator\'s own office.',                                                                                                                          quotes:['They have everything except the one thing that actually matters.','A reason.'],                    uniqueDetails:['Delhi-linked surveillance firm','Dossier: family finances, medical record, Jharkhand networks','Penetrated officer transferred — "not yet"'] },
    { id:'CH_15',          number:15,        title:'The Grand Arrest',                       act:'ACT_2', actLabel:'Confrontation', beatTags:['world_building','external_pressure','crisis_response'],                             wordCount:379,  keyInsight:'The Grand Arrest is possible only because Sampath has built a chain of integrity inside a corrupt apparatus.',                                                                                           quotes:['On a good note, the tumour has been named.'],                                                      uniqueDetails:['Rs. 1,400 crore land fraud','2,000 farmers','12 simultaneous raids','Evidence to three news orgs simultaneously'] },
    { id:'CH_16',          number:16,        title:'Chanakya\'s Theory',                     act:'ACT_2', actLabel:'Confrontation', beatTags:['world_building','rising_tension','moral_test','external_pressure'],                 wordCount:326,  keyInsight:'Chanakya understood that power is most durable when exercised through the opponent\'s own systems.',                                                                                                     quotes:[],                                                                                                  uniqueDetails:['Three PILs','Retired Chief Justice op-ed','45-minute unedited YouTube video','Two of three PILs withdrawn'] },
    { id:'CH_17',          number:17,        title:'Sarcastic Compliance and Confrontation', act:'ACT_2', actLabel:'Confrontation', beatTags:['world_building','moral_test','external_pressure','climax','resolution'],            wordCount:392,  keyInsight:'The most dangerous moment for a reformer is when the system offers a comfortable exit.',                                                                                                                 quotes:['Everyone finds their level in this system.','I found my level a long time ago. It\'s called the truth.','I am still a doctor. I am just treating a different patient.'], uniqueDetails:['The Architect — survived 7 governments, 3 corruption probes','No aides, no cameras, no record'] },
    { id:'CH_18',          number:18,        title:'The Last 10 Days — Jyestha\'s House',   act:'ACT_3', actLabel:'Resolution',    beatTags:['inciting_incident','world_building','external_pressure','internal_conflict','crisis_response'], wordCount:373, keyInsight:'The measure of an administration is whether the most forgotten citizen feels the state remembers they exist.',                                                                                              quotes:['I cannot promise you a better government. I can only promise you that I told the truth.','That is more than most people have done.'], uniqueDetails:['7-month-old letter','Un-televised visit surfaces 3 days later','Tea on a cement bench'] },
    { id:'CH_19',          number:19,        title:'No Tech Crime',                          act:'ACT_3', actLabel:'Resolution',    beatTags:['rising_tension','policy_didactic'],                                                wordCount:355,  keyInsight:'Technology does not eliminate corruption — it upgrades it.',                                                                                                                                           quotes:[],                                                                                                  uniqueDetails:['Rs. 340 crore over 18 months','26-year-old Mysore analyst bypasses two layers','Four specific actions','NO TECH CRIME motto'] },
    { id:'CH_20',          number:20,        title:'Family Dinner',                          act:'ACT_3', actLabel:'Resolution',    beatTags:['external_pressure','internal_conflict'],                                            wordCount:332,  keyInsight:'Leadership in Indian public life extracts an invisible personal toll. Priyadarshini\'s "also" holds pride and exhaustion without resolving either.',                                                       quotes:['I never doubted you. But I am also relieved it is almost over.'],                                  uniqueDetails:['Slightly sour sambhar','Aide burns rotis','Daughter spills juice','Naming is always the first surgery'] },
    { id:'CH_21',          number:21,        title:'Elevation Attack — Kodagu\'s Pitch Deck', act:'ACT_3', actLabel:'Resolution',  beatTags:['world_building','climax','crisis_response'],                                        wordCount:379,  keyInsight:'The most sophisticated corruption in modern India wears the mask of investment and development.',                                                                                                          quotes:[],                                                                                                  uniqueDetails:['47-page pitch deck','Rs. 12,000 crore corridor','30,000 acres coffee plantation re-zoned in appendix','Consultant turns pale','Parliamentary question'] },
    { id:'CH_22',          number:22,        title:'Counter Attack',                         act:'ACT_3', actLabel:'Resolution',    beatTags:['world_building','external_pressure','climax'],                                      wordCount:325,  keyInsight:'The most durable act of a reforming administrator is documentation — making the record immune to erasure.',                                                                                                quotes:[],                                                                                                  uniqueDetails:['120-page Legacy Report','Names helpers and obstructors','IAS probationers reading it at night','Bell that cannot be unrung'] },
    { id:'CH_23',          number:23,        title:'The Unsolved Case',                      act:'ACT_3', actLabel:'Resolution',    beatTags:['inciting_incident','world_building','external_pressure','climax'],                  wordCount:435,  keyInsight:'Every honest administration leaves behind an unsolved case — a wound the system refuses to heal because healing it would implicate the system.',                                                          quotes:['No cover letter. The file will speak for itself, or it will not speak at all.'],                   uniqueDetails:['Prabhakar, 34, Tumkur','Death ruled accident 18 months before Sampath','File found Month 4','Sealed copies to journalist + judge + professor','MP just given Cabinet berth'] },
    { id:'CH_24',          number:24,        title:'Reset in Democracy',                     act:'ACT_3', actLabel:'Resolution',    beatTags:['world_building','climax','resolution','policy_didactic'],                           wordCount:451,  keyInsight:'India\'s democracy does not need saviours — it needs proof that ordinary integrity can make a difference. Demonstrations, unlike heroes, can be repeated.',                                                quotes:['I came as a doctor. I tried to treat what I could see. The patient is still unwell. But the patient is alive, and the patient is fighting.'], uniqueDetails:['6 AM departure before protocols','12-minute chai vendor conversation','Traffic signals work, garbage trucks run their routes'] },
    { id:'CH_EPILOGUE',    number:'Epilogue', title:'What the Patient Does Next',            act:'EPILOGUE', actLabel:'Epilogue',  beatTags:['external_pressure','climax','resolution','crisis_response'],                         wordCount:323,  keyInsight:'The demonstration outlasts the demonstrator.',                                                                                                                                                         quotes:[],                                                                                                  uniqueDetails:['Kavitha shortlisted for IAS','Kodagu to Supreme Court','Prabhakar file in newspaper — MP resigns citing health','Jyestha\'s students eat warm food twice a week','Sampath operates 340 patients; no memoir, no interviews'] },
  ];

  // ── Orphan analysis (curated) ─────────────────────────────────────────────
  private readonly ORPHAN_ANALYSIS: Record<string, { beatFit: string; cohesionNote: string; recommendation: string; recommendedBeat: string | null }> = {
    CH_09: {
      beatFit: 'Act II Bridge — closing punctuation of Beat 8 (Fun & Games) / opening salvo of Beat 10 (Bad Guys Close In)',
      cohesionNote: 'Ch 9 is the decisive Act I→II pivot: Sampath uses the same midnight surgical instinct that built his reputation (Chs 5-8) but now inside enemy territory. It is the last proactive chapter before the system starts fighting back. Without it, the shift from Beat 8 to Beat 10 feels abrupt — the administrator is winning one minute and under siege the next.',
      recommendation: 'Add to Beat 8 chapter_ids as the closing chapter, OR create a named "Act Break" beat between 8 and 9. The chapter\'s key quote — "The process was followed. The files are safe. Let the law work." — is the logical closing note of the Fun & Games promise: he did what he said he would do.',
      recommendedBeat: 'Beat 8 — Fun and Games (closing chapter)'
    },
    CH_10: {
      beatFit: 'Act II — Pre-Midpoint Pressure / opening of Beat 10 (Bad Guys Close In) sequence',
      cohesionNote: 'Ch 10 is the digital and informational warfare front of the system\'s immune response — the same three-front attack (surveillance Ch 14, legal Ch 15-16, media Ch 10-12) that constitutes Beat 10. Ch 10 sits just before the Midpoint (Ch 13) and establishes the digital fog that the RIP Rally (Ch 13) exploits. Without it, Beat 10 (currently only Chs 14-16) misses its earliest and most visible front: character assassination via social media.',
      recommendation: 'Expand Beat 10 (Bad Guys Close In) chapter_ids to include CH_10 and CH_12 as early-front chapters, with CH_14-16 as the institutional-front chapters. The beat then reads as a three-front siege: digital (Ch 10), civic/cultural (Ch 12), institutional (Chs 14-16).',
      recommendedBeat: 'Beat 10 — Bad Guys Close In (digital front)'
    },
    CH_12: {
      beatFit: 'Act II — Civic-front pressure / early wing of Beat 10 (Bad Guys Close In)',
      cohesionNote: 'The Stray Dog Dilemma is structural comedy with structural weight: Sampath solves a real governance problem (#SarameyaRaksha, 45% reduction) and the opposition makes it ridiculous (#NaayiSarkar, #BowBowDictatorship). This mirrors the RIP Rally (Ch 13) — both chapters show the opposition converting competence into mockery. Ch 12 is the dress rehearsal for Ch 13\'s Midpoint. "No one trends that." is the chapter\'s thesis and belongs thematically next to the Midpoint\'s inversion logic.',
      recommendation: 'Add to Beat 10 (Bad Guys Close In) as the civic/cultural front. It also belongs in a new optional "Pre-Midpoint Sequence" note — the opposition\'s escalating mockery campaign (Ch 10 → Ch 12 → Ch 13) is the three-chapter run-up to the Midpoint and should be visible as a continuous arc.',
      recommendedBeat: 'Beat 10 — Bad Guys Close In (civic/cultural front)'
    },
  };

  constructor(
    private novelService: NovelService,
    private fb: FormBuilder,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.novelService.novel$.subscribe(n => {
      if (n) {
        this.structuralMap = n.structural_map;
        this.buildCoverage(n.structural_map);
      }
    });
  }

  private buildCoverage(sm: StructuralMap) {
    const chToBeat: Record<string, Array<{ num: number; name: string; anchor: boolean; strength: number }>> = {};
    sm.beat_sheet.beats.forEach(b => {
      const ids: string[] = (b as any).chapter_ids ?? [b.chapter_id];
      ids.forEach(id => {
        if (!chToBeat[id]) chToBeat[id] = [];
        chToBeat[id].push({ num: b.beat_number, name: b.beat_name, anchor: b.chapter_id === id, strength: b.strength_rating });
      });
    });

    this.coverageRows = this.CHAPTERS.map(ch => {
      const beats = chToBeat[ch.id] ?? [];
      const covered = beats.length > 0;
      const isAnchor = beats.some(b => b.anchor);
      const orphanInfo = this.ORPHAN_ANALYSIS[ch.id];

      return {
        chapter: ch,
        beats,
        covered,
        coverageType: covered ? (isAnchor ? 'anchor' : 'supporting') : 'orphan',
        beatFit:       orphanInfo?.beatFit       ?? '',
        cohesionNote:  orphanInfo?.cohesionNote  ?? '',
        recommendation: orphanInfo?.recommendation ?? '',
        recommendedBeat: orphanInfo?.recommendedBeat ?? null,
      };
    });
  }

  get filteredCoverage(): ChapterCoverage[] {
    if (this.coverageFilter === 'all') return this.coverageRows;
    return this.coverageRows.filter(r => r.coverageType === this.coverageFilter);
  }

  get orphanCount():    number { return this.coverageRows.filter(r => r.coverageType === 'orphan').length; }
  get anchorCount():    number { return this.coverageRows.filter(r => r.coverageType === 'anchor').length; }
  get supportingCount():number { return this.coverageRows.filter(r => r.coverageType === 'supporting').length; }

  flowTooltip(row: ChapterCoverage): string {
    const beatStr = row.beats.length
      ? 'Beat(s): ' + row.beats.map(b => b.num).join(', ')
      : 'No beat assigned';
    return row.chapter.title + ' · ' + this.coverageTypeLabel(row.coverageType) + ' · ' + beatStr;
  }

  coverageTypeColor(t: string): string {
    const m: Record<string, string> = { anchor: '#1565c0', supporting: '#2e7d32', orphan: '#c62828' };
    return m[t] ?? '#555';
  }

  coverageTypeLabel(t: string): string {
    const m: Record<string, string> = { anchor: 'Anchor', supporting: 'Supporting', orphan: 'Orphan' };
    return m[t] ?? t;
  }

  actColor(actLabel: string): string {
    const m: Record<string, string> = { Setup: '#1976d2', Confrontation: '#f57c00', Resolution: '#388e3c', Prologue: '#6a1b9a', Epilogue: '#4e342e' };
    return m[actLabel] ?? '#888';
  }

  // ── beat sheet helpers ────────────────────────────────────────────────────
  strengthColor(v: number): string {
    if (v >= 9) return '#2e7d32';
    if (v >= 7) return '#1976d2';
    if (v >= 5) return '#e65100';
    return '#c62828';
  }

  strengthLabel(v: number): string {
    if (v >= 9) return 'Exceptional';
    if (v >= 7) return 'Strong';
    if (v >= 5) return 'Fair';
    return 'Needs Work';
  }

  chapterIds(beat: Beat): string[] {
    return (beat as any).chapter_ids ?? [beat.chapter_id];
  }

  hasPrescription(beat: Beat): boolean {
    return !!((beat as any).strength_prescription);
  }

  prescription(beat: Beat): string {
    return (beat as any).strength_prescription ?? '';
  }

  openEdit(beat: Beat) {
    this.editingBeat = beat;
    this.editForm = this.fb.group({
      beat_name:            [beat.beat_name],
      chapter_id:           [beat.chapter_id],
      chapter_ids:          [this.chapterIds(beat).join(', ')],
      strength_rating:      [beat.strength_rating],
      scene_description:    [beat.scene_description],
      thematic_function:    [beat.thematic_function],
      craft_notes:          [beat.craft_notes],
      strength_prescription:[(beat as any).strength_prescription ?? ''],
    });
  }

  cancelEdit() { this.editingBeat = null; }

  saveBeat() {
    if (!this.editingBeat || !this.editForm) return;
    const v = this.editForm.value;
    const rawIds = (v.chapter_ids as string).split(',').map((s: string) => s.trim()).filter(Boolean);
    const updated: any = {
      ...this.editingBeat,
      beat_name:             v.beat_name,
      chapter_id:            v.chapter_id,
      chapter_ids:           rawIds,
      strength_rating:       +v.strength_rating,
      scene_description:     v.scene_description,
      thematic_function:     v.thematic_function,
      craft_notes:           v.craft_notes,
      strength_prescription: v.strength_prescription,
    };
    this.saving = true;
    this.novelService.saveBeat(this.editingBeat.beat_number, updated).subscribe({
      next: () => {
        this.snack.open('Beat saved', 'OK', { duration: 2000 });
        this.saving = false;
        this.editingBeat = null;
      },
      error: () => { this.snack.open('Save failed', 'OK', { duration: 3000 }); this.saving = false; }
    });
  }
}
