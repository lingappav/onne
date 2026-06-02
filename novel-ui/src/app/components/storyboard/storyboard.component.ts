import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ClaudeService, StoryboardResult, StoryboardPanel } from '../../services/claude.service';

export interface ReferenceScene {
  film: string;
  year: number;
  scene: string;
  why: string;
  aspect: string;   // what to borrow: lighting / composition / tone / pacing
}

const FILM_REFERENCES: Record<string, ReferenceScene[]> = {
  'CH_00_PROLOGUE': [
    { film: 'Wolf Hall', year: 2015, scene: 'Opening voiceover — Cromwell in shadow', why: 'Interior monologue before the world is shown; text on screen technique', aspect: 'Typography / narration pacing' },
    { film: 'Parasite', year: 2019, scene: 'Semi-basement framing / dual-world metaphor', why: 'Two realities in one composition — maps to cancer vs. politics metaphor', aspect: 'Composition / metaphor' },
  ],
  'CH_01': [
    { film: 'The Remains of the Day', year: 1993, scene: 'Stevens receives unexpected news late at night', why: 'Quiet devastation of a life interrupted; duty over self', aspect: 'Performance / restraint' },
    { film: 'Sarkar', year: 2005, scene: 'Night summons to the patriarch\'s house', why: 'Political summons at night; weight of institutional power arriving at a private home', aspect: 'Lighting / dread' },
  ],
  'CH_02': [
    { film: 'Gandhi', year: 1982, scene: 'Gandhi walks to face the British establishment', why: 'Lone figure dwarfed by institutional architecture; visual grammar of principled entry', aspect: 'Scale / wide shot' },
    { film: 'Lincoln', year: 2012, scene: 'Lincoln walks the White House corridors alone at night', why: 'Power of office vs. humanity of person; architecture as character', aspect: 'Architecture / lighting' },
  ],
  'CH_03': [
    { film: 'Spotlight', year: 2015, scene: 'Reporters reading files — the number moment', why: 'Numbers becoming moral weight; the exact moment a statistic becomes a crime', aspect: 'Editorial rhythm / close-up' },
    { film: 'The Big Short', year: 2015, scene: 'Ryan Gosling explains the CDOs', why: 'Making financial corruption visually legible and dramatically charged', aspect: 'Data visualization approach' },
  ],
  'CH_09': [
    { film: 'The Godfather', year: 1972, scene: 'Sollozzo watches Michael across the restaurant', why: 'Predator assessing prey across a public space; menace in stillness', aspect: 'Blocking / threat geometry' },
    { film: 'No Country for Old Men', year: 2007, scene: 'Chigurh watches the hotel from across the street', why: 'The watcher who has already decided; violence deferred but inevitable', aspect: 'Framing / stillness' },
  ],
  'CH_10': [
    { film: 'Network', year: 1976, scene: 'Howard Beale watches himself on television', why: 'The protagonist confronting their media image; the self becomes spectacle', aspect: 'Split attention / irony' },
    { film: 'Sacred Games', year: 2018, scene: 'Sartaj watching the news about himself', why: 'Direct Indian parallel — protagonist vs. institutional media apparatus', aspect: 'Tone / environment' },
  ],
  'CH_13': [
    { film: 'Michael Clayton', year: 2007, scene: 'Clayton refuses the offer across a restaurant table', why: 'Integrity refusing money in a setting designed to seduce; the exact dramatic beat', aspect: 'Two-shot geometry / silence' },
    { film: 'All the President\'s Men', year: 1976, scene: 'Garage meeting with Deep Throat', why: 'Power offer / information exchange in controlled private space', aspect: 'Space / paranoia' },
  ],
  'CH_17': [
    { film: 'There Will Be Blood', year: 2007, scene: 'Plainview alone after the deal collapses', why: 'Abandonment by institutional power; the protagonist holding consequences alone', aspect: 'Isolation / staging' },
    { film: 'Gangs of Wasseypur', year: 2012, scene: 'Shahid Khan alone after betrayal', why: 'Indian political betrayal — the moment a man realizes the system has turned', aspect: 'Tone / aftermath' },
  ],
  'CH_18': [
    { film: 'Marriage Story', year: 2019, scene: 'Kitchen table at 2am — the honest conversation', why: 'Two people telling each other the truth in domestic space at night', aspect: 'Blocking / intimacy / light' },
    { film: 'Mughal-E-Azam', year: 1960, scene: 'Anarkali and Akbar\'s final conversation', why: 'Indian tradition of the intimate scene that carries the film\'s moral weight', aspect: 'Stillness / gravitas' },
  ],
  'CH_20': [
    { film: 'The Mission', year: 1986, scene: 'Aerial of the Iguazu Falls — scale of what will be lost', why: 'Nature as moral witness; the landscape indicting the decision being made', aspect: 'Aerial / scale' },
    { film: 'Kantara', year: 2022, scene: 'Forest land dispute aerial', why: 'Direct Indian parallel — land, corruption, and ecological moral weight', aspect: 'Visual language / locale' },
  ],
  'CH_22': [
    { film: 'Spotlight', year: 2015, scene: 'The moment the lawyer\'s list is discovered', why: 'Elegant paperwork as weapon; bureaucratic language hiding crime', aspect: 'Document close-up / reaction' },
    { film: 'A Wednesday', year: 2008, scene: 'The Commissioner\'s final paperwork decision', why: 'Indian institutional decision moment; the rubber stamp as moral act', aspect: 'Gesture / weight' },
  ],
  'CH_EPILOGUE': [
    { film: 'The Shawshank Redemption', year: 1994, scene: 'Red walks toward Andy on the beach', why: 'Not triumph — resumption of ordinary hope after institutional defeat', aspect: 'Emotional register / ending' },
    { film: 'Swades', year: 2004, scene: 'Mohan returns to the village', why: 'Indian homecoming that isn\'t triumphant — chosen ordinary over extraordinary', aspect: 'Tone / cultural register' },
  ],
};

// Default references for chapters without specific entries
const DEFAULT_REFS: ReferenceScene[] = [
  { film: 'Wolf Hall', year: 2015, scene: 'Administrative corridor scenes', why: 'Institutional power dynamics in confined space', aspect: 'Lighting / staging' },
  { film: 'Sacred Games', year: 2018, scene: 'Government building interiors', why: 'Indian bureaucratic texture — the specific visual grammar of state power', aspect: 'Production design' },
  { film: 'Sarkar', year: 2005, scene: 'Political confrontation staging', why: 'Kannada/Tamil political drama — the blocking language Indian audiences read', aspect: 'Blocking / tension' },
];

// PreViz engine export targets
const PREVIZ_ENGINES = [
  { name: 'Unreal Engine MetaHuman', icon: 'view_in_ar', cost: '$800–2K/scene', description: 'Photorealistic virtual humans + environment. Best for performance capture scenes — Sampath, Priyadarshini, The Architect.', url: 'https://www.unrealengine.com/en-US/metahuman' },
  { name: 'Kling AI (Video)', icon: 'movie', cost: '$0.14/sec', description: 'Text/image-to-video. Use for establishing shots, exteriors, crowd scenes. Most cost-effective for B-roll.', url: 'https://klingai.com' },
  { name: 'Runway Gen-3 (Video)', icon: 'videocam', cost: '$0.05/sec', description: 'Image-to-video with motion control. Best for slow-burn character moments — the notepad scene, the hotel offer.', url: 'https://runwayml.com' },
  { name: 'Luma Dream Machine', icon: 'auto_awesome', cost: '$29/mo unlimited', description: 'Photorealistic motion from stills. Good for nature sequences — Coorg estate, Ranchi clinic exterior.', url: 'https://lumalabs.ai/dream-machine' },
  { name: 'ElevenLabs (Audio)', icon: 'volume_up', cost: '$22/mo', description: 'AI voice for scratch dialogue track. Build a temp audio layer to test scene pacing before principal photography.', url: 'https://elevenlabs.io' },
  { name: 'Suno (Score)', icon: 'music_note', cost: '$8/mo', description: 'AI score for PreViz temp track. Generate the cello motif and political drama score referenced in soundscape notes.', url: 'https://suno.com' },
];

// ── Save the Cat beat sheet + Writer's POV ───────────────────────────────────

export interface STC_Beat {
  beatNumber: number;
  beatName: string;
  chapterIds: string[];
  sceneDescription: string;
  thematicFunction: string;
  craftNotes: string;
  strengthRating: number;
  prescription: string;
}

const STC_BEATS: STC_Beat[] = [
  { beatNumber:1, beatName:'Opening Image', chapterIds:['CH_00_PROLOGUE','CH_01'],
    sceneDescription:'Vidhana Soudha at dusk, summer 2026 — "a fortress after a siege" — third coalition collapsed; cameras "pointed like rifles"; sky "the colour of dried chilli". The state is the patient.',
    thematicFunction:'Establishes the medical-political metaphor through landscape: democracy as diseased body, the capital as ward.',
    craftNotes:'One of the strongest openings in the manuscript. Sensory density paid for by the slower middle chapters.',
    strengthRating:9,
    prescription:'Integrate the Prologue as the true Opening Image — the internal medical metaphor ("a patient that did not want to be cured") before the external Vidhana Soudha scene in Ch 1.' },
  { beatNumber:2, beatName:'Theme Stated', chapterIds:['CH_02'],
    sceneDescription:'President of India — "a woman of severe grace" — meets Sampath. The deal is "sealed not in ink, but in expectation." Delhi\'s use of integrity as "deniability costume" is the novel\'s stated theme.',
    thematicFunction:'States the central irony: Delhi expects a puppet; Sampath intends to be a clinician.',
    craftNotes:'Theme is stated through metaphor rather than dialogue — strong. But Ch 02 is only 364 words — too short to fully land. Expand.',
    strengthRating:7,
    prescription:'Ch 02 is only 364 words. The theme (integrity as deniability costume) is stated but never dramatised. Integrate the alternate where the Home Minister wins Priyadarshini over by promising to close Sampath\'s old court case.' },
  { beatNumber:3, beatName:'Set-Up', chapterIds:['CH_03','CH_04'],
    sceneDescription:'Language and Bad Punchline (Ch 3) + Digital Backlash (Ch 4) — the world Sampath has entered: a bureaucracy that tests loyalty through language, and a digital machinery that manufactures enemies on command.',
    thematicFunction:'Establishes the full social and digital texture. Ch 3 is the human loyalty test; Ch 4 is the algorithmic one.',
    craftNotes:'Ch 4 (Digital Backlash) was an orphan beat despite being essential Set-Up. The #AntiSampath moment is the digital equivalent of the Kannada loyalty test — both belong here.',
    strengthRating:7,
    prescription:'End the Set-Up with Sampath\'s line — "We are not running a startup — we are running a state. Get back to work." That closes world-building with a character note, not an observation.' },
  { beatNumber:4, beatName:'Catalyst', chapterIds:['CH_01'],
    sceneDescription:'Midnight announcement — Sampath\'s name on every channel; black SUVs at the door in Ranchi; the half-eaten dal, the children\'s schoolbags; Priyadarshini\'s wet plate frozen in her hand.',
    thematicFunction:'The summons. The ordinary life ends with a knock.',
    craftNotes:'The domestic inventory (dal, schoolbags, retirement diary) is the chapter\'s masterstroke — anchors the political in the profoundly human.',
    strengthRating:10,
    prescription:'Already at 10/10. The domestic inventory is the novel\'s masterstroke. Do not change.' },
  { beatNumber:5, beatName:'Debate', chapterIds:['CH_01'],
    sceneDescription:'Sampath locks the door. "We are not sacrificial goats they can drag into politics whenever they want." His "third choice" — neither surrender nor seizure, but principled refusal.',
    thematicFunction:'Establishes the moral grammar — Sampath\'s refusal is the work\'s first act.',
    craftNotes:'The "third choice" framing is the novel\'s philosophical seed and should be referenced explicitly at least twice more in Act III.',
    strengthRating:9,
    prescription:'The "third choice" must be verbally articulated by Sampath to Priyadarshini in a full scene, not just a gesture (shutting the door). Add a 200-word interior exchange.' },
  { beatNumber:6, beatName:'Break Into Two', chapterIds:['CH_02'],
    sceneDescription:'Sampath accepts the assignment in Rashtrapati Bhavan. "On my own merit. I have always left speechless those who doubted me." The deal sealed not in ink but in expectation.',
    thematicFunction:'The decision to enter the new world — but on his own terms, not Delhi\'s.',
    craftNotes:'Currently underwritten. The English_Chapters-Pdf alternate (Home Minister winning Priyadarshini over by promising to close the old court case) is dramatically richer.',
    strengthRating:6,
    prescription:'Most underwritten beat in the novel. The mechanism of acceptance is vague ("sealed in expectation"). Dramatise the Home Minister\'s private offer to close the old court case.' },
  { beatNumber:7, beatName:'B Story — The Marriage', chapterIds:['CH_11','CH_20'],
    sceneDescription:'Priyadarshini\'s dinner question (Ch 11) — the marriage\'s first crack of visible strain — plus Family Dinner (Ch 20) where "slightly sour sambhar" and her line "I never doubted you. But I am also relieved."',
    thematicFunction:'The personal cost of public courage. The B Story is the marriage — quiet, unspoken, weight-bearing.',
    craftNotes:'Ch 20 (Family Dinner) was an orphan beat — it carries the B Story\'s emotional resolution but was mapped to nothing. Priyadarshini\'s "also" is the novel\'s most economical emotional word.',
    strengthRating:6,
    prescription:'Three scenes needed: Ch 11 dinner (strengthen), one new scene in Ch 14-16 (Priyadarshini reads the surveillance dossier), and Ch 20 family dinner (already written, move on-screen).' },
  { beatNumber:8, beatName:'Fun and Games', chapterIds:['CH_05','CH_06','CH_07','CH_08'],
    sceneDescription:'Triple Agenda (Ch 5); Ethical Anchor (Ch 6) — Rs. 500-crore bribe as CSR dinner, refused; High-Octane Friday (Ch 7) — seven crises, all surgical; Midnight Incision (Ch 8) — 1 AM, "The process was followed."',
    thematicFunction:'The promise of the premise delivered: a doctor administering a state with clinical precision. Each chapter is a different kind of surgery.',
    craftNotes:'Ch 6 and Ch 8 are the best-crafted chapters in this run. The four together form the novel\'s most sustained argument for what "integrity as tactic" actually looks like in practice.',
    strengthRating:8,
    prescription:'Ch 9 (Midnight Incision) should be the punctuation mark on this run — Act I\'s final surgery, ending at 1 AM with "The process was followed. The files are safe. Let the law work."' },
  { beatNumber:9, beatName:'Midpoint', chapterIds:['CH_13'],
    sceneDescription:'The RIP Rally at Palace Grounds — a hundred thousand brought in by buses, a funeral oration for a living administrator — while Sampath is in Kodagu carrying a supply box in the rain after a landslide.',
    thematicFunction:'False low for the opposition\'s narrative, true high for Sampath\'s moral standing. The chapter inverts political theater.',
    craftNotes:'Brilliantly conceived midpoint. The simultaneity is the structural device — should be the model for at least one more chapter in Act II.',
    strengthRating:9,
    prescription:'Add one paragraph from Sampath\'s POV during the Kodagu rain scene where he recognises the simultaneity himself — "Somewhere in Bengaluru they are eulogising me. Here they need a box of medicines."' },
  { beatNumber:10, beatName:'Bad Guys Close In', chapterIds:['CH_14','CH_15','CH_16'],
    sceneDescription:'Spying & Surveillance (Ch 14); Grand Arrest (Ch 15) — Rs. 1,400 crore, 12 raids; Cultural Siege (Ch 16) — Karnataka Rakshana Vedike march. Three vectors: personal, institutional, cultural.',
    thematicFunction:'The system\'s full immune response across three modes of attack.',
    craftNotes:'Missing a single emotional through-line that connects Ch 14, 15, and 16. Sampath\'s body or sleep becoming the register of the siege.',
    strengthRating:7,
    prescription:'Add a brief physical detail in each: Ch 14 he cannot sleep; Ch 15 he skips a meal; Ch 16 his hands shake for the first time. This creates a physiological through-line across the three siege chapters.' },
  { beatNumber:11, beatName:'All Is Lost', chapterIds:['CH_17'],
    sceneDescription:'The face-to-face meeting with The Architect — no aides, no cameras, no record. The deal: tone down investigations, approve two projects, receive tenure extension. "Everyone finds their level in this system."',
    thematicFunction:'The comfortable exit is offered. Sampath\'s refusal is the novel\'s All Is Lost — by refusing, he loses any possibility of staying.',
    craftNotes:'"I am still a doctor. I am just treating a different patient." — the novel\'s most quotable line.',
    strengthRating:9,
    prescription:'The Architect needs a second appearance earlier (Ch 9 or Ch 12). Currently he appears only in Ch 17 — his weight depends on prior presence. One indirect mention in Act I raises the stakes enormously.' },
  { beatNumber:12, beatName:'Dark Night of the Soul', chapterIds:['CH_18'],
    sceneDescription:'Jyestha\'s House. The forgotten schoolteacher. Tea on a cement bench. "I cannot promise you a better government. I can only promise you that I told the truth." Her absolution: "That is more than most people have done."',
    thematicFunction:'The protagonist\'s moral re-centering at his lowest political moment. The state visits the citizen.',
    craftNotes:'The novel\'s emotional centre. Should remain untouched in revision.',
    strengthRating:10,
    prescription:'Already at 10/10. The novel\'s emotional centre. Do not change a word. Jyestha\'s absolution is perfect.' },
  { beatNumber:13, beatName:'Break Into Three', chapterIds:['CH_19'],
    sceneDescription:'No Tech Crime. The Rs. 340-crore welfare-portal siphon discovered. Kavitha — the 26-year-old analyst from Mysore — bypasses two layers of hierarchy. Sampath meets her the same evening.',
    thematicFunction:'Transition from operating to legacy-laying — one final operation that doubles as succession plot.',
    craftNotes:'Kavitha\'s introduction is too brief for the weight her Epilogue placement carries. This must become a succession scene.',
    strengthRating:7,
    prescription:'Kavitha\'s introduction needs to become a succession scene — Sampath recognises in her the same instinct he has, but uncorrupted by time. Give her one observation he could not have made at 26.' },
  { beatNumber:14, beatName:'Finale', chapterIds:['CH_20','CH_21','CH_22','CH_23'],
    sceneDescription:'Family Dinner (Ch 20); Kodagu Pitch Deck refused (Ch 21) — "The most elegant corruption"; Legacy Report (Ch 22) — 120 pages, the bell that cannot be unrung; The Unsolved Case (Ch 23) — the wound the system refuses to heal.',
    thematicFunction:'The protagonist\'s four finishing surgeries — domestic repair, final refusal, documentation, and the one wound that remains.',
    craftNotes:'The cumulative weight is the novel\'s true structural climax. Ch 20 correctly appears here AND in the B Story — a chapter belonging to multiple beats.',
    strengthRating:9,
    prescription:'In Ch 23, add one line where Sampath hesitates before dropping the envelope — "He stood at the postbox for longer than he expected to. Not because he doubted. Because he was memorising the act."' },
  { beatNumber:15, beatName:'Final Image', chapterIds:['CH_24','CH_EPILOGUE'],
    sceneDescription:'6 AM departure before farewell protocols. Twelve-minute conversation with the chai vendor in Cubbon Park about the vendor\'s son who wants to be an engineer. The flight to Ranchi. "The traffic signals in Bengaluru worked."',
    thematicFunction:'Mirrors the Opening Image — the fevered capital becomes the working city. The patient is alive.',
    craftNotes:'The chai vendor scene is the proof-of-concept the novel argues for. Do not cut a word.',
    strengthRating:10,
    prescription:'Already at 10/10. The Epilogue (Kavitha, Kodagu, Prabhakar, Jyestha) is the five-year follow-through — proof not of transformation but of demonstrated possibility.' },
];

const NOVEL_THESIS = {
  centralQuestion: 'Can a man of absolute integrity function within a system architecturally designed to punish honesty — and if so, what is the actual measure of his success?',
  thesis: 'The most radical act of governance is to refuse the grammar of the system; integrity is not a virtue but a tactic, and demonstrations, unlike heroes, can be repeated.',
  antithesis: '"Everyone finds their level in this system." — The Architect, Ch 17. Pragmatism is the only sustainable politics; idealism is either naive or performative.',
  synthesis: 'The patient is not cured, but the patient is alive — Sampath does not transform Karnataka, but he proves possibility itself, and in India that is the rarest political commodity.',
  premiseStatement: 'When an honest man is thrust into power within a system that has architected itself to punish honesty, integrity becomes a tactical weapon — and the most durable change he leaves behind is not policy but proof that change was possible.',
  themes: [
    { weight:'primary', theme:'Integrity is not a virtue — it is a tactic' },
    { weight:'primary', theme:'Corruption arrives as generosity, friendship, and pragmatism — never as itself' },
    { weight:'primary', theme:'Democracy is not a thing you save — it is a patient you tend' },
    { weight:'primary', theme:'Naming is always the first surgery' },
    { weight:'primary', theme:'The measure of an administration is whether the forgotten citizen feels the state remembers them' },
    { weight:'primary', theme:'Demonstrations, unlike heroes, can be repeated' },
    { weight:'secondary', theme:'Technology does not eliminate corruption — it upgrades it' },
    { weight:'secondary', theme:'Documentation is the most durable act of a reforming administrator' },
    { weight:'secondary', theme:'Public health governance is hostage to the politics of pleasure' },
    { weight:'secondary', theme:'Every honest administration leaves behind one unsolved case' },
    { weight:'tertiary', theme:'Public courage extracts an invisible domestic toll' },
    { weight:'tertiary', theme:'Language is a loyalty test in Indian politics' },
  ],
  strengths: [
    { title:'Sustained central metaphor', note:'The medical-political analogy is load-bearing across all 25 chapters without becoming labored — "limit the tumour\'s blood supply," "the patient is democracy."' },
    { title:'Set-piece chapters of genuine craft', note:'Ch 1 (locked door), Ch 13 (RIP rally + Kodagu simultaneous), Ch 17 (Architect confrontation), Ch 18 (Jyestha\'s house) — all hold at 9-10/10.' },
    { title:'Specific, researched, grounded detail', note:'Rs. 36,000 crore figure; 11:47 PM Midnight Incision; the 47-page Kodagu Pitch Deck; 4,200 RTI pages. Research is the novel\'s credibility engine.' },
    { title:'Moral grammar without sermon', note:'Sampath never delivers a thesis statement. The work argues through his choices — most powerfully in Ch 6 (asks for the bill) and Ch 21 (orders the demolition himself).' },
    { title:'Closing that earns its hope', note:'The Epilogue\'s modesty — "students eat warm food twice a week" as the equal of a Supreme Court case — refuses sentimentality while delivering catharsis.' },
  ],
  revisionPriorities: [
    { rank:1, issue:'Integrate the "old court case" ghost into Sampath\'s psychology', fix:'Add Ch 2A flashback or weave through Ch 1 (the retirement diary references it). This makes his acceptance psychologically three-dimensional.' },
    { rank:2, issue:'Add the Prologue from Novel_1 PDF as the opening', fix:'Insert verbatim; minor copy-edit for consistency. The medical interior monologue before the external Vidhana Soudha scene raises the Opening Image to 10/10.' },
    { rank:3, issue:'Expand Priyadarshini\'s presence in Acts II and III', fix:'Two new scenes — one Act II phone call/visit, one Act III chapter centered on her arrival in Bengaluru. She is currently the novel\'s most underserved major character.' },
    { rank:4, issue:'Vary Act II rhythm — currently too episodic', fix:'Thread a sustained diary or Priyadarshini-POV interlude between Ch 12 and Ch 13. Consider one Act II chapter from a non-Sampath perspective.' },
    { rank:5, issue:'Strengthen Kavitha in Ch 19', fix:'Lengthen the same-evening meeting; give her one specific technical observation Sampath cannot have made; ensure her chapter is a succession scene, not a report scene.' },
  ]
};

const PREVIZ_BUDGET = {
  total: 10000,
  breakdown: [
    { item: 'Unreal Engine MetaHuman scenes (4 key scenes)', cost: 4000 },
    { item: 'Kling/Runway video clips (18 scenes × ~$80)', cost: 1800 },
    { item: 'Pollinations / Midjourney concept frames (all 26)', cost: 200 },
    { item: 'ElevenLabs scratch dialogue (full script read)', cost: 300 },
    { item: 'Suno temp score (3 acts)', cost: 100 },
    { item: 'Editor assembly + PreViz cut (freelance)', cost: 2500 },
    { item: 'Contingency / iteration budget', cost: 1100 },
  ]
};

@Component({
  selector: 'app-storyboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './storyboard.component.html',
  styleUrl: './storyboard.component.scss'
})
export class StoryboardComponent implements OnInit {
  result: StoryboardResult | null = null;
  loading = false;
  activePanel: StoryboardPanel | null = null;
  activePanelIndex = 0;

  // Editable prompt per panel (sceneId → draft)
  promptDrafts: Record<string, string> = {};
  editingPrompt = false;

  // Active tab in detail view
  activeTab: 'previz' | 'refs' | 'budget' | 'stc' = 'previz';

  // Budget panel
  showBudget = false;
  budgetData = PREVIZ_BUDGET;
  previzEngines = PREVIZ_ENGINES;

  // Save the Cat
  stcBeats = STC_BEATS;
  novelThesis = NOVEL_THESIS;
  activeBeat: STC_Beat | null = null;

  get acts(): { id: string; label: string; panels: StoryboardPanel[] }[] {
    if (!this.result) return [];
    const map = new Map<string, { id: string; label: string; panels: StoryboardPanel[] }>();
    for (const p of this.result.panels) {
      if (!map.has(p.actId)) map.set(p.actId, { id: p.actId, label: p.actLabel, panels: [] });
      map.get(p.actId)!.panels.push(p);
    }
    return Array.from(map.values());
  }

  get budgetSpent(): number {
    return this.budgetData.breakdown.reduce((s, r) => s + r.cost, 0);
  }

  constructor(private claude: ClaudeService) {}

  ngOnInit() { this.generate(); }

  generate() {
    this.loading = true;
    this.result = null;
    this.claude.generateStoryboard().subscribe({
      next: r => {
        this.result = r;
        this.loading = false;
        if (r.panels.length) { this.activePanel = r.panels[0]; this.activePanelIndex = 0; }
      },
      error: () => { this.loading = false; }
    });
  }

  selectPanel(panel: StoryboardPanel, index: number) {
    this.activePanel = panel;
    this.activePanelIndex = index;
    this.editingPrompt = false;
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

  // ── Prompt editing ────────────────────────────────────────────────────────
  startEditPrompt(panel: StoryboardPanel) {
    this.promptDrafts[panel.sceneId] = panel.imagePrompt;
    this.editingPrompt = true;
  }

  savePrompt(panel: StoryboardPanel) {
    const draft = this.promptDrafts[panel.sceneId]?.trim();
    if (draft) panel.imagePrompt = draft;
    this.editingPrompt = false;
  }

  cancelEditPrompt() { this.editingPrompt = false; }

  // ── Image generation ──────────────────────────────────────────────────────
  generateImage(panel: StoryboardPanel) {
    panel.imageStatus = 'loading';
    panel.imageUrl = undefined;
    const url = this.claude.getImageUrl(panel);
    const img = new Image();
    img.onload  = () => { panel.imageUrl = url; panel.imageStatus = 'ready'; };
    img.onerror = () => { panel.imageStatus = 'error'; };
    img.src = url;
  }

  // ── Save the Cat ──────────────────────────────────────────────────────────
  beatsForPanel(panel: StoryboardPanel): STC_Beat[] {
    return STC_BEATS.filter(b => b.chapterIds.includes(panel.sceneId));
  }

  strengthColor(rating: number): string {
    if (rating >= 9) return '#4a9a4a';
    if (rating >= 7) return '#c6a04c';
    return '#c05050';
  }

  strengthLabel(rating: number): string {
    if (rating >= 9) return 'Strong';
    if (rating >= 7) return 'Solid';
    return 'Needs work';
  }

  jumpToBeat(beat: STC_Beat) {
    if (!this.result || !beat.chapterIds.length) return;
    const idx = this.result.panels.findIndex(p => beat.chapterIds.includes(p.sceneId));
    if (idx >= 0) this.selectPanel(this.result.panels[idx], idx);
  }

  isBeatActive(beat: STC_Beat): boolean {
    if (!this.activePanel) return false;
    return beat.chapterIds.includes(this.activePanel.sceneId);
  }

  // ── References ────────────────────────────────────────────────────────────
  refsFor(panel: StoryboardPanel): ReferenceScene[] {
    return FILM_REFERENCES[panel.sceneId] ?? DEFAULT_REFS;
  }

  // ── Export ────────────────────────────────────────────────────────────────
  exportPreVizPacket() {
    if (!this.result) return;
    const lines: string[] = [
      '# THE PRESIDENT\'S RULE — PreViz Production Packet',
      `# Generated: ${new Date().toLocaleDateString()}`,
      `# Budget: $${this.budgetData.total.toLocaleString()} USD`,
      '# For: Unreal Engine / Kling AI / Runway Gen-3',
      '',
      '---',
      ''
    ];
    for (const p of this.result.panels) {
      const refs = this.refsFor(p);
      lines.push(`## Ch ${p.chapterNumber}: ${p.chapterTitle}`);
      lines.push(`**Act:** ${p.actLabel}`);
      lines.push(`**Scene:** ${p.sceneHeading}`);
      lines.push(`**Camera:** ${p.cameraAngle}`);
      lines.push(`**Mood:** ${p.mood}`);
      lines.push(`**Color Palette:** ${p.colorPalette}`);
      lines.push(`**Soundscape:** ${p.soundscape}`);
      lines.push(`**Director's Note:** ${p.directorNote}`);
      lines.push('');
      lines.push(`### Image/Video Prompt`);
      lines.push('```');
      lines.push(p.imagePrompt);
      lines.push('```');
      lines.push('');
      lines.push('### Film References');
      for (const r of refs) {
        lines.push(`- **${r.film} (${r.year})** — ${r.scene}`);
        lines.push(`  *Why:* ${r.why} | *Borrow:* ${r.aspect}`);
      }
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    lines.push('## Budget Breakdown');
    for (const b of this.budgetData.breakdown) {
      lines.push(`- ${b.item}: $${b.cost.toLocaleString()}`);
    }
    lines.push(`- **TOTAL: $${this.budgetSpent.toLocaleString()} / $${this.budgetData.total.toLocaleString()}**`);

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'presidents-rule-previz-packet.md';
    a.click();
  }

  copyPrompt(panel: StoryboardPanel) {
    navigator.clipboard?.writeText(panel.imagePrompt).catch(() => {});
  }

  get isApiConfigured(): boolean { return this.claude.isConfigured; }
}
