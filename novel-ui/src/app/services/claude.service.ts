import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface VideoTool {
  name: string;
  url: string;
  icon: string;
  description: string;
}

export interface StoryboardPanel {
  sceneId: string;
  chapterNumber: number | string;
  chapterTitle: string;
  actLabel: string;
  actId: string;
  panelIndex: number;
  sceneHeading: string;
  visualDescription: string;
  cameraAngle: string;
  colorPalette: string;
  mood: string;
  keyCharacters: string[];
  soundscape: string;
  directorNote: string;
  imagePrompt: string;
  imageUrl?: string;
  imageStatus: 'idle' | 'loading' | 'ready' | 'error';
  videoTools: VideoTool[];
}

export interface StoryboardResult {
  novelTitle: string;
  logline: string;
  panels: StoryboardPanel[];
  generatedAt: string;
}

// ── Full 25-chapter + epilogue scene list ────────────────────────────────────

const ALL_CHAPTERS: {
  sceneId: string; chapterNumber: number | string; chapterTitle: string;
  actId: string; actLabel: string; sceneHeading: string;
  briefing: string; imagePrompt: string;
}[] = [
  { sceneId:'CH_00_PROLOGUE', chapterNumber:0, chapterTitle:'Prologue', actId:'ACT_1', actLabel:'Act I — Setup',
    sceneHeading:'INT. SAMPATH\'S MIND — ABSTRACT',
    briefing:`Sampath's interior thesis — politics is a malignancy of a different order than cancer. He reflects on the legibility of cancer vs. the illegibility of governance.`,
    imagePrompt:'cinematic split composition: left side a medical microscope slide showing cancer cells labeled in clinical white light, right side a chaotic Indian parliament chamber in shadow and red emergency light, ultra-realistic, dramatic, 4k Indian political drama' },
  { sceneId:'CH_01', chapterNumber:1, chapterTitle:'The Broken Compass', actId:'ACT_1', actLabel:'Act I — Setup',
    sceneHeading:'INT. SAMPATH\'S HOME, RANCHI — MIDNIGHT',
    briefing:`Midnight summons. Karnataka has lost its third coalition in eight months. The PM imposes President's Rule and chooses an oncologist from Ranchi as Special Administrator.`,
    imagePrompt:'Indian oncologist mid-50s silver hair in white kurta receiving a shocking late night phone call in dimly lit modest home Ranchi India, clock showing midnight, warm interior light, cinematic ultra-realistic 4k' },
  { sceneId:'CH_02', chapterNumber:2, chapterTitle:'The Appointment', actId:'ACT_1', actLabel:'Act I — Setup',
    sceneHeading:'EXT. VIDHANA SOUDHA, BENGALURU — DUSK',
    briefing:`Dr. Sampath Kumar steps from a black government car at Vidhana Soudha. The neo-Dravidian dome looms amber against a blood-orange sky. He carries a medical bag as if here for a house call.`,
    imagePrompt:'Indian man in cream kurta stepping out of black Ambassador government car in front of Vidhana Soudha Bengaluru, blood orange sunset sky, imposing neo-Dravidian granite architecture dome, wide cinematic shot, 4k photorealistic' },
  { sceneId:'CH_03', chapterNumber:3, chapterTitle:'The 36,000-Crore File', actId:'ACT_1', actLabel:'Act I — Setup',
    sceneHeading:'INT. ADMINISTRATOR\'S CHAMBER — NIGHT',
    briefing:`Kavitha slides a manila folder across the mahogany desk. Rs. 36,000 crores. Oil portraits of past governors watch. Sampath reads each page with clinical detachment.`,
    imagePrompt:'Indian government office at night, large mahogany desk, thick manila file open showing large numbers, official portraits in ornate gold frames on walls, single desk lamp warm light, two figures across desk, cinematic noir ultra-realistic' },
  { sceneId:'CH_04', chapterNumber:4, chapterTitle:'Coalition Archaeology', actId:'ACT_1', actLabel:'Act I — Setup',
    sceneHeading:'INT. STATE LEGISLATURE CHAMBER — DAY',
    briefing:`Sampath maps the fallen coalition — three parties, seventeen defections, and the money trail behind each vote. He treats the political collapse like a patient's medical history.`,
    imagePrompt:'Indian state legislature chamber empty wooden seats, one man studying documents pinned to large board with red string connections like a medical case map, dramatic overhead light, cinematic political thriller 4k' },
  { sceneId:'CH_05', chapterNumber:5, chapterTitle:'The Infrastructure of Loyalty', actId:'ACT_1', actLabel:'Act I — Setup',
    sceneHeading:'EXT. BENGALURU STREETS — EARLY MORNING',
    briefing:`Sampath walks Bengaluru before the city wakes. He observes patronage networks written into the city's physical texture — which roads are maintained, where power actually flows.`,
    imagePrompt:'Indian administrator in white kurta walking alone through Bengaluru streets at dawn, chai stalls opening, political party flags on crumbling walls, documentary style, warm morning golden light, cinematic' },
  { sceneId:'CH_06', chapterNumber:6, chapterTitle:'The First Order', actId:'ACT_1', actLabel:'Act I — Setup',
    sceneHeading:'INT. ADMINISTRATOR\'S CHAMBER — MORNING',
    briefing:`Sampath signs his first administrative order — a budget audit no one expected him to actually initiate. The bureaucracy goes quiet.`,
    imagePrompt:'Indian administrator in white kurta signing official government document at ornate mahogany desk Vidhana Soudha, officials watching with alarmed expressions, dramatic natural light through tall windows, cinematic' },
  { sceneId:'CH_07', chapterNumber:7, chapterTitle:'Kavitha', actId:'ACT_1', actLabel:'Act I — Setup',
    sceneHeading:'INT. IAS OFFICERS\' CORRIDOR — DAY',
    briefing:`Young IAS officer Kavitha Rao emerges as Sampath's key ally — the only person in the building who reads files the way he does.`,
    imagePrompt:'Young Indian woman IAS officer 30s in formal navy saree walking purposefully through government marble corridor carrying stacked files, older administrator following, high ceilings, cinematic political drama 4k' },
  { sceneId:'CH_08', chapterNumber:8, chapterTitle:'The 36,000-Crore Wall Falls', actId:'ACT_1', actLabel:'Act I — Setup',
    sceneHeading:'INT. PRESS CONFERENCE HALL — DAY',
    briefing:`Sampath announces the first major recovery from the shadow economy. Rs. 36,000 crore irregularities referred to investigative agencies. The room goes silent.`,
    imagePrompt:'Indian administrator at press conference podium in grand government hall, microphones clustered, photographers below with flashes, shocked journalists, dramatic spotlights, historic announcement moment, ultra-realistic cinematic' },
  { sceneId:'CH_09', chapterNumber:9, chapterTitle:'The Architect', actId:'ACT_2', actLabel:'Act II — Confrontations',
    sceneHeading:'INT. PRIVATE CLUB, BENGALURU — EVENING',
    briefing:`First glimpse of The Architect — never named, always in grey. He watches Sampath from across a private club, assessing. The hunter has been made.`,
    imagePrompt:'Shadowy well-dressed Indian businessman in grey suit at exclusive Bengaluru private club, whisky glass, watching someone across candlelit room, blurred silk-suited figures in background, sinister calm, cinematic noir 4k' },
  { sceneId:'CH_10', chapterNumber:10, chapterTitle:'The Fabricated Audio', actId:'ACT_2', actLabel:'Act II — Confrontations',
    sceneHeading:'INT. SAMPATH\'S APARTMENT — DAY',
    briefing:`Breaking news: fabricated audio of Sampath in a bribery call. Sampath watches this in his apartment. He does not react with rage. He picks up a notepad and begins documenting.`,
    imagePrompt:'Indian man in white kurta sitting in sparse government apartment watching television showing Indian news channel with his own face in red BREAKING NEWS graphic, calmly taking notes by hand, dim apartment vs bright TV light, cinematic' },
  { sceneId:'CH_11', chapterNumber:11, chapterTitle:'Priyadarshini', actId:'ACT_2', actLabel:'Act II — Confrontations',
    sceneHeading:'INT. GOVERNMENT APARTMENT — NIGHT',
    briefing:`Priyadarshini sees Sampath's calm in the face of the media attack. His calm frightens her more than rage would. The invisible domestic toll begins to surface.`,
    imagePrompt:'Indian woman in elegant saree standing in apartment doorway looking at husband taking notes while news shows his face on TV, worry and quiet devastation, warm domestic light vs cold TV glow, intimate cinematic drama 4k' },
  { sceneId:'CH_12', chapterNumber:12, chapterTitle:'The Press Siege', actId:'ACT_2', actLabel:'Act II — Confrontations',
    sceneHeading:'EXT. VIDHANA SOUDHA — MORNING',
    briefing:`Media vans surround Vidhana Soudha. Sampath walks through the press scrum without pausing. He answers two questions precisely, refuses three, walks inside.`,
    imagePrompt:'Indian administrator walking through press media scrum outside Vidhana Soudha government building, microphones thrust at him, camera flashes, security personnel alongside, composed expression, morning light, documentary cinematic style' },
  { sceneId:'CH_13', chapterNumber:13, chapterTitle:'The 500-Crore Offer', actId:'ACT_2', actLabel:'Act II — Confrontations',
    sceneHeading:'INT. FIVE-STAR HOTEL SUITE — NIGHT',
    briefing:`The Architect offers Rs. 500 crore. Sampath slides the leather portfolio back. "I once had a patient who offered me his factory to misread a scan. That man is dead."`,
    imagePrompt:'Two Indian men in luxurious hotel suite facing each other across glass coffee table, leather portfolio between them like a chess piece, one grey suit one white kurta, night city lights through floor windows, tense cinematic thriller 4k' },
  { sceneId:'CH_14', chapterNumber:14, chapterTitle:'Bad Guys Close In', actId:'ACT_2', actLabel:'Act II — Confrontations',
    sceneHeading:'INT. SURVEILLANCE ROOM — NIGHT',
    briefing:`The state's intelligence apparatus begins monitoring Sampath's family. Priyadarshini's phone is tapped. The pressure becomes personal.`,
    imagePrompt:'Dark intelligence surveillance room with multiple screens showing Indian family members being tracked, intelligence officers faces in green monitor glow, sinister atmosphere, cinematic thriller 4k' },
  { sceneId:'CH_15', chapterNumber:15, chapterTitle:'The Defection Letter', actId:'ACT_2', actLabel:'Act II — Confrontations',
    sceneHeading:'INT. ADMINISTRATOR\'S CHAMBER — DAY',
    briefing:`Kavitha arrives: three senior IAS officers who supported Sampath's audit have accepted transfers. The machinery of retaliation is working methodically.`,
    imagePrompt:'Young Indian woman IAS officer handing a formal letter to seated government administrator, both looking grave, formal government office, daylight through tall windows, institutional retaliation, cinematic' },
  { sceneId:'CH_16', chapterNumber:16, chapterTitle:'The Opposition Arrives', actId:'ACT_2', actLabel:'Act II — Confrontations',
    sceneHeading:'INT. VIDHANA SOUDHA MEETING ROOM — DAY',
    briefing:`A delegation of former coalition MLAs demands Sampath rescind the audit. He listens for three hours. Signs nothing.`,
    imagePrompt:'Tense Indian government meeting room, administrator facing a row of angry politicians and lawyers across long table, documents spread everywhere, heated confrontation, cinematic political drama ultra-realistic 4k' },
  { sceneId:'CH_17', chapterNumber:17, chapterTitle:'All Is Lost', actId:'ACT_2', actLabel:'Act II — Confrontations',
    sceneHeading:'INT. SAMPATH\'S APARTMENT — LATE NIGHT',
    briefing:`The PM's office calls informally: stand down on the audit. Sampath holds the phone for a long moment after the call ends.`,
    imagePrompt:'Indian man in white kurta standing alone in sparse apartment at night holding phone to ear with call just ended, face in shadow, Bengaluru city lights through window, isolated abandoned, cinematic high contrast drama' },
  { sceneId:'CH_18', chapterNumber:18, chapterTitle:'Dark Night of the Soul', actId:'ACT_2', actLabel:'Act II — Confrontations',
    sceneHeading:'INT. SAMPATH\'S APARTMENT — 3 AM',
    briefing:`Sampath and Priyadarshini at 3am. She asks: "What do you actually believe you can accomplish?" He cannot give a clean answer. Integrity without guaranteed outcome.`,
    imagePrompt:'Indian couple sitting on floor of sparse apartment at 3am, two tea cups going cold, quiet devastation, soft lamp light only, window showing dark city, intimate domestic drama, Japanese minimalist cinematic' },
  { sceneId:'CH_19', chapterNumber:19, chapterTitle:'Break Into Three', actId:'ACT_3', actLabel:'Act III — Resolution',
    sceneHeading:'INT. ADMINISTRATOR\'S CHAMBER — DAWN',
    briefing:`Sampath arrives at dawn and makes the decision. He will complete the mandate. Not because he will win. Because the record must be made.`,
    imagePrompt:'Indian administrator arriving at Vidhana Soudha government office at dawn, first golden light through tall ornate windows, empty marble hallways, sense of resolve and purpose, cinematic warm golden dawn light' },
  { sceneId:'CH_20', chapterNumber:20, chapterTitle:'The Coorg Gambit', actId:'ACT_3', actLabel:'Act III — Resolution',
    sceneHeading:'EXT. COORG COFFEE ESTATE — DAWN',
    briefing:`Sampath visits the 30,000-acre Western Ghats coffee estate at center of the fraud. Standing in the mist, the scale of what is being stolen becomes physical.`,
    imagePrompt:'Lone Indian figure in white kurta standing in vast Karnataka Western Ghats coffee plantation at dawn, thick mist filling valley below, ancient shade trees, birds in canopy, breathtaking aerial cinematic photography 4k' },
  { sceneId:'CH_21', chapterNumber:21, chapterTitle:'Priyadarshini\'s Evidence', actId:'ACT_3', actLabel:'Act III — Resolution',
    sceneHeading:'INT. GOVERNMENT APARTMENT — EVENING',
    briefing:`Priyadarshini, using her own professional network, uncovers a financial document the intelligence agencies missed. She has been investigating in parallel.`,
    imagePrompt:'Indian woman in elegant saree handing important documents to husband at kitchen table, evening warm light, laptop open, papers spread, moment of triumph and partnership, domestic intelligence coup, cinematic warm drama 4k' },
  { sceneId:'CH_22', chapterNumber:22, chapterTitle:'The 47-Page Pitch Deck', actId:'ACT_3', actLabel:'Act III — Resolution',
    sceneHeading:'INT. BOARDROOM — DAY',
    briefing:`The most elegant corruption Sampath has ever seen — 47 pages of agricultural zone reclassification. Flawless language. Airtight legal structure. "Whoever wrote this understands the law better than anyone who made it." REJECTED.`,
    imagePrompt:'Indian administrator in government boardroom raising REJECTED rubber stamp over thick official document, presentation showing lush Karnataka Western Ghats on screen behind him, bureaucrats watching, dramatic decisive moment, cinematic' },
  { sceneId:'CH_23', chapterNumber:23, chapterTitle:'The Final Audit', actId:'ACT_3', actLabel:'Act III — Resolution',
    sceneHeading:'INT. ADMINISTRATOR\'S CHAMBER — LAST WEEK',
    briefing:`The final audit: sixty-three pages, seven categories of irregularity, four CBI referrals. The work is finished. The record is made.`,
    imagePrompt:'Indian administrator and young woman IAS officer reviewing massive stack of completed government audit documents late at night, exhausted satisfied expressions, desk lamp, papers everywhere, historic documentation moment, cinematic' },
  { sceneId:'CH_24', chapterNumber:24, chapterTitle:'The Handover', actId:'ACT_3', actLabel:'Act III — Resolution',
    sceneHeading:'INT. VIDHANA SOUDHA — FORMAL CEREMONY — MORNING',
    briefing:`Karnataka's elected government is restored. Sampath formally hands over the Administrator's seal. He collects his medical bag and walks out the same entrance he arrived at.`,
    imagePrompt:'Formal Indian government ceremony, administrator in white kurta handing official brass seal to incoming suited politician, grand Vidhana Soudha hall morning light, symbolic historic transition, cinematic political drama' },
  { sceneId:'CH_EPILOGUE', chapterNumber:'Epilogue', chapterTitle:'Proof of Concept', actId:'ACT_3', actLabel:'Act III — Epilogue',
    sceneHeading:'EXT. SAMPATH\'S CLINIC, RANCHI — MORNING',
    briefing:`One year later. Sampath walks toward his modest oncology clinic. A patient waits. Karnataka is still broken in some ways, better in others. The patient is not cured. But the patient is alive. He picks up a pen. Begins again.`,
    imagePrompt:'Indian doctor in white coat walking toward modest oncology clinic in Ranchi morning light, elderly patient waiting on wooden bench outside with medical file, ordinary life resumed after great events, hopeful quiet resolution, cinematic 4k' },
];

const VIDEO_TOOLS: VideoTool[] = [
  { name:'Kling AI',          url:'https://klingai.com',                 icon:'movie',        description:'Text-to-video · Cinematic quality · Best for dramatic scenes' },
  { name:'Runway Gen-3',      url:'https://runwayml.com',                icon:'videocam',     description:'Image-to-video · Motion control · Visual effects' },
  { name:'Luma Dream Machine',url:'https://lumalabs.ai/dream-machine',   icon:'auto_awesome', description:'Text & image to video · Photorealistic motion' },
  { name:'Midjourney',        url:'https://midjourney.com',              icon:'palette',      description:'High-quality stills · Film concept art · Poster design' },
];

// ── Old 6-scene constant kept for reference only — no longer used ────────────
const SCENES_FOR_STORYBOARD = [
  {
    sceneId: 'ACT1_CH1_ARRIVAL',
    actLabel: 'Act I — The Inciting Incident',
    chapterTitle: 'Chapter 1: The Appointment',
    sceneHeading: 'EXT. VIDHANA SOUDHA, BENGALURU — DUSK',
    briefing: `Dr. Sampath Kumar, 55, renowned oncologist from Ranchi, steps out of a black government car in front of Vidhana Soudha.
The imposing neo-Dravidian granite building looms — its dome lit amber against a blood-orange sky.
The plaza is eerily empty save for two armed guards.
Sampath carries a small medical bag as if he came for a house call.
He looks up at the building, removes his glasses, cleans them — a nervous habit.
Inside that building is a state in political cardiac arrest.`
  },
  {
    sceneId: 'ACT1_CH3_SHADOW_ECONOMY',
    actLabel: 'Act I — The Inciting Incident',
    chapterTitle: 'Chapter 3: The 36,000-Crore File',
    sceneHeading: 'INT. VIDHANA SOUDHA, ADMINISTRATOR\'S CHAMBER — NIGHT',
    briefing: `Sampath sits at an enormous mahogany desk. The room is oppressively ornate — oil paintings of past governors watch him.
A young IAS officer, Kavitha, slides a manila folder across the desk.
"The shadow economy file, sir. It has been on this desk for three years."
The folder is thick. Sampath opens it. His face reads each page with clinical detachment — the same face he uses to deliver terminal diagnoses.
Numbers: Rs. 36,000 crores. The scale makes the room feel smaller.
He closes the folder and looks out the window at Bengaluru's glittering night skyline.`
  },
  {
    sceneId: 'ACT2_CH10_MEDIA_SIEGE',
    actLabel: 'Act II — Complications & Confrontations',
    chapterTitle: 'Chapter 10: The Fabricated Audio',
    sceneHeading: 'INT. TELEVISION STUDIO CONTROL ROOM — DAY',
    briefing: `A breaking news chyron: "EXCLUSIVE: Special Administrator caught in bribery call — AUDIO PROOF"
Screens show Sampath's face frozen in a news anchor graphic.
The fabricated audio plays over studio monitors. It's convincing. It's designed to be.
Cut to: Sampath watching this on a small TV in his spartan government apartment.
He does not react with rage. He takes out a notepad and begins writing — documenting, as if taking notes on a patient's symptoms.
His wife Priyadarshini enters, sees the screen, sees his calm — and that calm frightens her more than anger would.`
  },
  {
    sceneId: 'ACT2_CH13_THE_BRIBE',
    actLabel: 'Act II — Complications & Confrontations',
    chapterTitle: 'Chapter 13: The 500-Crore Offer',
    sceneHeading: 'INT. FIVE-STAR HOTEL SUITE — NIGHT',
    briefing: `A sleek, modern suite. The Architect — never named, always in grey — sits across from Sampath.
Between them on the glass table: a leather portfolio. Inside: details of Rs. 500 crores transferred to an untraceable account.
"You can end this quietly, Doctor. Take the appointment. Consider it a consulting fee."
Sampath pours himself water. Sets the glass down precisely.
"I once had a patient who offered me his factory to misread a scan."
He slides the portfolio back across the table without opening it.
"That man is dead. He died because I misread the scan."
A beat. The Architect's smile doesn't change. But something behind his eyes does.`
  },
  {
    sceneId: 'ACT3_CH22_COFFEE_LAND',
    actLabel: 'Act III — Climax & Resolution',
    chapterTitle: 'Chapter 22: The 47-Page Pitch Deck',
    sceneHeading: 'EXT. COORG COFFEE ESTATE — DAWN',
    briefing: `Aerial: 30,000 acres of protected Western Ghats coffee plantation, mist-draped hills, ancient shade trees.
Cut to: a boardroom in Bengaluru. Sampath stands before a projected presentation — "Agricultural Zone Reclassification: Economic Development Initiative."
47 pages of the most elegant corruption he has ever seen.
The language is flawless. The legal structure is airtight. Every safeguard has been anticipated.
Sampath closes the presentation.
"Whoever wrote this — they understand the law better than anyone who made it."
He stamps the file: REJECTED.`
  },
  {
    sceneId: 'ACT3_EPILOGUE',
    actLabel: 'Act III — Epilogue',
    chapterTitle: 'Epilogue: Proof of Concept',
    sceneHeading: 'EXT. RANCHI, JHARKHAND — SAMPATH\'S CLINIC — MORNING',
    briefing: `One year later.
Sampath Kumar, in a white doctor's coat, walks toward his modest oncology clinic in Ranchi.
A patient waits outside — an old man, holding a file of medical reports.
Sampath nods, opens the door.
Behind him, unseen: Karnataka is still broken in some ways, better in others.
The patient is not cured. But the patient is alive.
He sits down. Picks up a pen. Begins again.
The scalpel is just a pen now. The room is just a consultation room.
The lesson of democracy and medicine is the same: do the next right thing. Every day.`
  }
];


@Injectable({ providedIn: 'root' })
export class ClaudeService {
  private readonly claudeUrl = 'https://api.anthropic.com/v1/messages';

  constructor(private http: HttpClient) {}

  get isConfigured(): boolean { return !!environment.anthropicApiKey; }

  generateStoryboard(): Observable<StoryboardResult> {
    if (!this.isConfigured) return of(this.buildBaseStoryboard());
    return this.callClaudeForNotes();
  }

  /** Pollinations.AI — free, no API key, generates image from text prompt */
  getImageUrl(panel: StoryboardPanel): string {
    const p = `${panel.imagePrompt}, cinematic Indian political drama, ultra-realistic, 4k, 16:9 widescreen`;
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=1280&height=720&seed=${panel.panelIndex * 7}&nologo=true`;
  }

  private callClaudeForNotes(): Observable<StoryboardResult> {
    const base = this.buildBaseStoryboard();
    const text = ALL_CHAPTERS.map((c, i) =>
      `PANEL ${i+1}|${c.sceneId}|Ch${c.chapterNumber}:"${c.chapterTitle}"|${c.actLabel}\nSCENE:${c.sceneHeading}\n${c.briefing}`
    ).join('\n---\n');

    const headers = new HttpHeaders({
      'x-api-key': environment.anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-calls': 'true'
    });

    return this.http.post<any>(this.claudeUrl, {
      model: 'claude-opus-4-7',
      max_tokens: 16000,
      messages: [{ role: 'user', content: `Storyboard director for Indian political film "The President's Rule". For each of ${ALL_CHAPTERS.length} panels return JSON array: sceneId, visualDescription(60-80w), cameraAngle, colorPalette, mood(10-12w), soundscape(20-25w), directorNote(15-20w). PANELS:\n${text}` }]
    }, { headers }).pipe(
      map(res => {
        const m = res.content[0].text.match(/\[[\s\S]*\]/);
        if (!m) return base;
        const notes: any[] = JSON.parse(m[0]);
        return { ...base, panels: base.panels.map((p, i) => ({ ...p, ...(notes[i] ? {
          visualDescription: notes[i].visualDescription ?? p.visualDescription,
          cameraAngle: notes[i].cameraAngle ?? p.cameraAngle,
          colorPalette: notes[i].colorPalette ?? p.colorPalette,
          mood: notes[i].mood ?? p.mood,
          soundscape: notes[i].soundscape ?? p.soundscape,
          directorNote: notes[i].directorNote ?? p.directorNote,
        } : {}) })) };
      }),
      catchError(() => of(base))
    );
  }

  private buildBaseStoryboard(): StoryboardResult {
    return {
      novelTitle: "The President's Rule",
      logline: "The patient is democracy.",
      generatedAt: new Date().toISOString(),
      panels: ALL_CHAPTERS.map((c, i) => ({
        sceneId: c.sceneId, chapterNumber: c.chapterNumber, chapterTitle: c.chapterTitle,
        actLabel: c.actLabel, actId: c.actId, panelIndex: i + 1, sceneHeading: c.sceneHeading,
        visualDescription: c.briefing.split('\n')[0].trim(),
        cameraAngle: this.defaultCamera(c.actId, i),
        colorPalette: this.defaultPalette(c.actId),
        mood: this.defaultMood(c.sceneId),
        keyCharacters: this.defaultChars(c.sceneId),
        soundscape: this.defaultSound(c.actId, i),
        directorNote: this.defaultNote(c.sceneId),
        imagePrompt: c.imagePrompt,
        imageUrl: undefined,
        imageStatus: 'idle' as const,
        videoTools: VIDEO_TOOLS
      }))
    };
  }

  private defaultCamera(actId: string, i: number): string {
    return ['Wide establishing — slow push to medium','Medium, slight low angle — protagonist vs architecture','Over-the-shoulder — documents as foreground weight','Tight close-up — eyes only then pull to reveal','Aerial → match cut to interior medium wide','Static wide — subject moves through frame','Hand-held medium — intimacy without stability','Low angle looking up — burden and resolve'][i % 8];
  }

  private defaultPalette(actId: string): string {
    return ({ACT_1:'Amber and deep charcoal — institutional gold beginning to corrode',ACT_2:'Cold slate and television blue — the colour of siege and media war',ACT_3:'Forest green dissolving to morning white — nature and earned resolution'} as Record<string,string>)[actId] ?? 'Measured neutrals with single amber accent';
  }

  private defaultMood(id: string): string {
    return ({
      CH_00_PROLOGUE:'Intellectual calm before the storm — the thesis before the man',
      CH_01:'Ordinary life breaking open — the summons that changes everything',
      CH_02:'Gravity without dread — walking toward what you did not choose',
      CH_03:'Clinical attention becoming moral weight — a number becomes a crime',
      CH_04:'Archaeological patience — reading a collapse like a medical history',
      CH_05:'Observational alertness — the city as a diagnostic chart',
      CH_06:'Quiet institutional thunder — one signature changes the room',
      CH_07:'Alliance forming in competence — two people reading the same file',
      CH_08:'Silence after revelation — the room absorbing what it cannot undo',
      CH_09:'Menace in stillness — the predator taking measure of its target',
      CH_10:'Steady refusal in the face of spectacle — documentation as resistance',
      CH_11:'The invisible domestic toll — the price paid in private',
      CH_12:'Composure as political act — silence louder than any statement',
      CH_13:'Surgical calm under maximum pressure — the final integrity test',
      CH_14:'Cold institutional menace — power applied to the personal',
      CH_15:'Quiet devastation — the machinery of retaliation working methodically',
      CH_16:'Exhausted patience — three hours of listening, zero signatures',
      CH_17:'The weight of an unanswered phone — institutional abandonment',
      CH_18:'Honesty between two people — integrity without guaranteed outcome',
      CH_19:'Resolve replacing uncertainty — the decision made before dawn',
      CH_20:'The scale of theft becomes physical — awe at what is being lost',
      CH_21:'Domestic partnership turned intelligence operation — the overlooked witness',
      CH_22:'Awe at elegant corruption — the quiet violence of a rubber stamp',
      CH_23:'Exhausted completion — the record made, the work finished',
      CH_24:'Formal ceremony disguising profound transition — the clean handover',
      CH_EPILOGUE:'Not triumph, not defeat — the dignified resumption of ordinary purpose'
    } as Record<string,string>)[id] ?? 'Restrained moral weight — integrity under institutional pressure';
  }

  private defaultChars(id: string): string[] {
    return ({
      CH_00_PROLOGUE:['Dr. Sampath Kumar (voice)'],
      CH_01:['Dr. Sampath Kumar','Priyadarshini'], CH_02:['Dr. Sampath Kumar'],
      CH_03:['Dr. Sampath Kumar','Kavitha (IAS)'], CH_04:['Dr. Sampath Kumar','Kavitha (IAS)'],
      CH_05:['Dr. Sampath Kumar'], CH_06:['Dr. Sampath Kumar','Senior Bureaucrats'],
      CH_07:['Dr. Sampath Kumar','Kavitha (IAS)'], CH_08:['Dr. Sampath Kumar','Media'],
      CH_09:['The Architect'], CH_10:['Dr. Sampath Kumar','Priyadarshini'],
      CH_11:['Dr. Sampath Kumar','Priyadarshini'], CH_12:['Dr. Sampath Kumar','Media Corps'],
      CH_13:['Dr. Sampath Kumar','The Architect'], CH_14:['Intelligence Officers','Priyadarshini'],
      CH_15:['Kavitha (IAS)','Dr. Sampath Kumar'], CH_16:['Dr. Sampath Kumar','Opposition MLAs'],
      CH_17:['Dr. Sampath Kumar'], CH_18:['Dr. Sampath Kumar','Priyadarshini'],
      CH_19:['Dr. Sampath Kumar','Kavitha (IAS)'], CH_20:['Dr. Sampath Kumar'],
      CH_21:['Priyadarshini','Dr. Sampath Kumar'], CH_22:['Dr. Sampath Kumar','Bureaucrats'],
      CH_23:['Dr. Sampath Kumar','Kavitha (IAS)'], CH_24:['Dr. Sampath Kumar','Incoming Government'],
      CH_EPILOGUE:['Dr. Sampath Kumar','Patient (unnamed)']
    } as Record<string,string[]>)[id] ?? ['Dr. Sampath Kumar'];
  }

  private defaultSound(actId: string, i: number): string {
    return ['Interior silence. Single breath. Score: cello, no vibrato, one note.','Wind through granite. Distant street noise. Score: low strings, held chord.','Clock. Paper turning. Air conditioning. Score: piano, sparse.','Television audio from adjacent room. Pen on paper. No score.','Hotel ventilation. Ice in glass. Score: none — silence is the pressure.','Morning birds. Street chai vendor. Coughing. No score — just life.','Crowd dissolving to institutional silence. Score: single held brass tone.','Government car engine. Briefcase latch. Score: understated, inevitable.'][i % 8];
  }

  private defaultNote(id: string): string {
    return ({
      CH_00_PROLOGUE:'Voice-over only. No face. The thesis before the man.',
      CH_01:'Hold on Priyadarshini\'s face after the call. Her reaction is the scene.',
      CH_02:'Hold the wide three beats longer — let the architecture dwarf him first.',
      CH_03:'Sampath turns each page at the same pace. The horror is in the evenness.',
      CH_04:'The board connections must look like a cancer staging diagram.',
      CH_05:'Camera follows his eyes, not his steps. He reads the city like a scan.',
      CH_06:'The pen moves without hesitation. The signature is the entire action.',
      CH_07:'They finish each other\'s file-reading sentences. Alliance through competence.',
      CH_08:'The silence after the announcement must last five full seconds.',
      CH_09:'The Architect is never fully in frame. A threat should not be entirely visible.',
      CH_10:'The notepad must be practical — he is genuinely documenting, not performing calm.',
      CH_11:'Priyadarshini does not cry. She goes very still. That stillness is the scene.',
      CH_12:'He stops for exactly one answer. One. Then continues walking.',
      CH_13:'Sampath never looks at the portfolio. He watches The Architect\'s hands.',
      CH_14:'Show the screens, not the operators. Power through the observed.',
      CH_15:'Kavitha places the letter and steps back. Distance says everything.',
      CH_16:'Every time someone raises their voice, Sampath lowers his.',
      CH_17:'Hold on the dead phone for eight full seconds after the call ends.',
      CH_18:'No dialogue for the first two minutes. Let the tea go cold together.',
      CH_19:'Dawn light must reach him before he picks up the phone. Light precedes resolve.',
      CH_20:'The aerial shot must feel like a crime scene. Because it is.',
      CH_21:'He doesn\'t take the document immediately. He looks at her first.',
      CH_22:'The REJECTED stamp is heard before it is seen. Impact precedes image.',
      CH_23:'Kavitha stacks the final page. Neither speaks. They don\'t need to.',
      CH_24:'He picks up the medical bag himself. He arrived with it; he leaves with it.',
      CH_EPILOGUE:'The waiting patient must look completely ordinary. Democracy is also ordinary.'
    } as Record<string,string>)[id] ?? 'Let the silence carry the scene before any movement begins.';
  }
}
