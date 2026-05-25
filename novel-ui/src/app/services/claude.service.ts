import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface StoryboardPanel {
  sceneId: string;
  chapterTitle: string;
  actLabel: string;
  panelIndex: number;
  sceneHeading: string;
  visualDescription: string;
  cameraAngle: string;
  colorPalette: string;
  mood: string;
  keyCharacters: string[];
  soundscape: string;
  directorNote: string;
}

export interface StoryboardResult {
  novelTitle: string;
  logline: string;
  panels: StoryboardPanel[];
  generatedAt: string;
}

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
  private readonly apiUrl = 'https://api.anthropic.com/v1/messages';

  constructor(private http: HttpClient) {}

  get isConfigured(): boolean {
    return !!environment.anthropicApiKey;
  }

  generateStoryboard(): Observable<StoryboardResult> {
    if (!this.isConfigured) {
      return of(this.buildDemoStoryboard());
    }
    return this.callClaudeApi();
  }

  private callClaudeApi(): Observable<StoryboardResult> {
    const prompt = this.buildPrompt();

    const headers = new HttpHeaders({
      'x-api-key': environment.anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    });

    const body = {
      model: 'claude-opus-4-7',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }]
    };

    return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
      map(res => this.parseResponse(res.content[0].text)),
      catchError(() => of(this.buildDemoStoryboard()))
    );
  }

  private buildPrompt(): string {
    const scenesText = SCENES_FOR_STORYBOARD.map((s, i) =>
      `SCENE ${i + 1}: ${s.sceneId}\n${s.actLabel} | ${s.chapterTitle}\nHEADING: ${s.sceneHeading}\nBRIEFING:\n${s.briefing}`
    ).join('\n\n---\n\n');

    return `You are a cinematic storyboard director preparing an AI-animated feature film based on the Indian political novel "The President's Rule" by Vishwa Shambhulingappa.

NOVEL CONTEXT:
- Title: The President's Rule
- Logline: When a renowned oncologist from Jharkhand is unwillingly appointed Special Administrator of Karnataka during President's Rule, he treats a fevered democracy with the same surgical precision he brought to his patients.
- Tagline: "The patient is democracy."
- Tone: Measured, morally weighty, clinically observant, darkly comic in flashes — the voice of an oncologist's chart turned into prose.
- Visual Reference: Wolf Hall (2015 BBC) for the administrative interiors; Sacred Games for Bengaluru street texture; Sarkar (2005) for political confrontation staging.

PROTAGONIST: Dr. Sampath Kumar, mid-50s, lean, silver-haired, always impeccably dressed in white or cream kurta. Moves with surgical economy. His face is a diagnostic mask — you cannot read his emotions until his hands betray him (he touches his glasses when anxious, folds them away when resolved).

For each of the following ${SCENES_FOR_STORYBOARD.length} scenes, generate a storyboard panel with these exact fields in JSON format:
- sceneId (copy from input)
- chapterTitle (copy from input)
- actLabel (copy from input)
- panelIndex (1-based)
- sceneHeading (copy from input)
- visualDescription (80-120 words: what the camera sees — composition, foreground/background, blocking, specific visual details that advance character/theme)
- cameraAngle (e.g., "Low angle medium shot", "Over-the-shoulder close-up", "Wide establishing aerial")
- colorPalette (3-4 colors with emotional meaning, e.g., "Amber and deep shadow — bureaucratic gold rotting at the edges")
- mood (10-15 words capturing the emotional atmosphere of the scene)
- keyCharacters (array of character names present)
- soundscape (what we hear: ambient sound + score direction, 20-30 words)
- directorNote (1 key staging or performance instruction, 20-30 words)

Return ONLY a valid JSON array of ${SCENES_FOR_STORYBOARD.length} panel objects, no prose outside the JSON.

SCENES TO STORYBOARD:

${scenesText}`;
  }

  private parseResponse(text: string): StoryboardResult {
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found');
      const panels: StoryboardPanel[] = JSON.parse(jsonMatch[0]);
      return {
        novelTitle: "The President's Rule",
        logline: "The patient is democracy.",
        panels,
        generatedAt: new Date().toISOString()
      };
    } catch {
      return this.buildDemoStoryboard();
    }
  }

  private buildDemoStoryboard(): StoryboardResult {
    const panels: StoryboardPanel[] = SCENES_FOR_STORYBOARD.map((s, i) => ({
      sceneId: s.sceneId,
      chapterTitle: s.chapterTitle,
      actLabel: s.actLabel,
      panelIndex: i + 1,
      sceneHeading: s.sceneHeading,
      visualDescription: this.getDemoVisualDescription(s.sceneId),
      cameraAngle: this.getDemoCameraAngle(i),
      colorPalette: this.getDemoColorPalette(i),
      mood: this.getDemoMood(s.sceneId),
      keyCharacters: this.getDemoCharacters(s.sceneId),
      soundscape: this.getDemoSoundscape(i),
      directorNote: this.getDemoDirectorNote(s.sceneId)
    }));

    return {
      novelTitle: "The President's Rule",
      logline: "The patient is democracy.",
      panels,
      generatedAt: new Date().toISOString()
    };
  }

  private getDemoVisualDescription(id: string): string {
    const map: Record<string, string> = {
      ACT1_CH1_ARRIVAL: 'Wide shot: Vidhana Soudha\'s neo-Dravidian dome dominates the frame against a blood-orange sky. Sampath Kumar, small against the architecture, steps from a black Ambassador car. He carries a leather medical bag — absurdly domestic against the granite monumentality. The camera holds wide as he pauses, removes his glasses, looks up. The building does not look back.',
      ACT1_CH3_SHADOW_ECONOMY: 'Medium shot across the mahogany desk. The Rs. 36,000-crore file lies open. Sampath\'s hands move page to page with clinical precision — the same hands that have held scalpels. Oil portraits of past administrators watch from the walls in heavy gold frames. The desk lamp is the only warm light in a cold room.',
      ACT2_CH10_MEDIA_SIEGE: 'Split-frame: left side is a television news graphic with Sampath\'s frozen face and a red BREAKING chyron. Right side: the real Sampath in a dim apartment, watching the same image. His reflection ghost-overlaps the screen. He uncaps a pen. Begins taking notes.',
      ACT2_CH13_THE_BRIBE: 'Tight two-shot across a glass table. The leather portfolio sits precisely centered between them like a chess piece mid-game. The Architect is always slightly out of focus — we see Sampath\'s face clearly: reading the man the way he reads a scan, looking for what is hidden.',
      ACT3_CH22_COFFEE_LAND: 'Aerial: 30,000 acres of Western Ghats mist dissolves into a cut to fluorescent boardroom. The projected presentation is crisp and beautiful — the visuals of land reclassification look like a sustainability report. Sampath stands before it. He does not point at the screen. He looks at the people in the room.',
      ACT3_EPILOGUE: 'Low angle looking up at Sampath, white coat, walking toward his modest clinic door. Behind him: open Ranchi sky — enormous, indifferent, the same sky that was over Bengaluru. A patient waits on a plastic chair, medical file in hand. Life continues, smaller and more precise.'
    };
    return map[id] || 'A cinematic tableau of power and restraint — the visual grammar of constitutional democracy under siege.';
  }

  private getDemoCameraAngle(i: number): string {
    const angles = [
      'Wide establishing shot → slow push to medium as protagonist pauses',
      'Medium shot across desk, slight low angle (documents as foreground)',
      'Split-frame wide; camera holds, no movement',
      'Tight two-shot, shallow depth — antagonist slightly soft',
      'Aerial → match cut to boardroom medium wide',
      'Low angle medium shot looking up; camera static'
    ];
    return angles[i] || 'Medium shot';
  }

  private getDemoColorPalette(i: number): string {
    const palettes = [
      'Amber and deep charcoal — bureaucratic gold fading to institutional grey',
      'Tungsten lamp warm against cold stone — the archive at midnight',
      'Television blue-white vs. domestic sepia — the image vs. the man',
      'Ash and slate with a single chrome accent — power stripped of ornament',
      'Forest green dissolving to fluorescent white — nature vs. legal language',
      'Morning white and open sky — the colour of beginning again'
    ];
    return palettes[i] || 'Measured neutral tones with single accent of institutional amber';
  }

  private getDemoMood(id: string): string {
    const map: Record<string, string> = {
      ACT1_CH1_ARRIVAL: 'Gravity without dread — a man walking toward something he did not choose but will not flee',
      ACT1_CH3_SHADOW_ECONOMY: 'Clinical attention becoming moral weight — the moment a number becomes a crime',
      ACT2_CH10_MEDIA_SIEGE: 'Steady refusal in the face of spectacle — documentation as resistance',
      ACT2_CH13_THE_BRIBE: 'Surgical calm under maximum pressure — integrity performing its final test',
      ACT3_CH22_COFFEE_LAND: 'Awe at the elegance of corruption — and the quiet violence of a rubber stamp',
      ACT3_EPILOGUE: 'Not triumph, not defeat — the dignified resumption of ordinary purpose'
    };
    return map[id] || 'Restrained moral weight';
  }

  private getDemoCharacters(id: string): string[] {
    const map: Record<string, string[]> = {
      ACT1_CH1_ARRIVAL: ['Dr. Sampath Kumar'],
      ACT1_CH3_SHADOW_ECONOMY: ['Dr. Sampath Kumar', 'Kavitha (IAS Officer)'],
      ACT2_CH10_MEDIA_SIEGE: ['Dr. Sampath Kumar', 'Priyadarshini'],
      ACT2_CH13_THE_BRIBE: ['Dr. Sampath Kumar', 'The Architect'],
      ACT3_CH22_COFFEE_LAND: ['Dr. Sampath Kumar', 'Bureaucrats'],
      ACT3_EPILOGUE: ['Dr. Sampath Kumar', 'Patient (unnamed)']
    };
    return map[id] || ['Dr. Sampath Kumar'];
  }

  private getDemoSoundscape(i: number): string {
    const sounds = [
      'Wind across granite plaza. A distant pressure horn. Then silence. Score: single cello, no vibrato.',
      'Clock ticking. Paper turning. Air conditioning hum. Score: low strings, motionless.',
      'Television audio bleeds from one side of frame. Apartment silence from the other. Pen on paper.',
      'Ambient hotel ventilation. Ice settling in glasses. Score: none — silence is the pressure.',
      'Distant traffic dissolves to boardroom air conditioning. Projector fan. Score: piano, one held note.',
      'Morning birds. Street chai-vendor calls. Someone coughing in a waiting room. No score — just life.'
    ];
    return sounds[i] || 'Ambient silence with score of single instrument';
  }

  private getDemoDirectorNote(id: string): string {
    const map: Record<string, string> = {
      ACT1_CH1_ARRIVAL: 'Hold the wide shot three beats longer than comfortable — let the architecture dwarf him before he decides to walk forward.',
      ACT1_CH3_SHADOW_ECONOMY: 'Sampath turns each page at exactly the same pace — no hesitation, no acceleration. The horror is in the evenness.',
      ACT2_CH10_MEDIA_SIEGE: 'The notepad must be practical, not symbolic — he is genuinely taking notes, not performing calm.',
      ACT2_CH13_THE_BRIBE: 'Sampath does not look at the portfolio — he watches The Architect\'s hands the entire scene. He reads people, not documents.',
      ACT3_CH22_COFFEE_LAND: 'The REJECTED stamp happens off-frame; we hear it before we see it. Impact before image.',
      ACT3_EPILOGUE: 'The patient waiting outside must look ordinary — this is the point. Democracy is also ordinary. Protect it anyway.'
    };
    return map[id] || 'Let the silence carry the scene before dialogue begins.';
  }
}
