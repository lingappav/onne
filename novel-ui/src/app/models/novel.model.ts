export interface NovelData {
  master_novel: MasterNovel;
}

export interface MasterNovel {
  metadata: Metadata;
  thematic_architecture: ThematicArchitecture;
  structural_map: StructuralMap;
  chapters: Chapter[];
  chapter_writing_status?: string;
  characters: Character[];
  narrative_intelligence: NarrativeIntelligence;
  craft_assessment: CraftAssessment;
  reference_documents: ReferenceDocument[];
  continuity_report: ContinuityReport;
  generation_log?: any;
}

export interface Metadata {
  title: string;
  subtitle: string;
  genre: string[];
  subgenre_tags: string[];
  tone: string;
  comparable_titles: string[];
  logline: string;
  tagline: string;
  elevator_pitch: string;
  word_count_estimated: number;
  chapter_count: number;
  act_count: number;
  has_prologue: boolean;
  has_epilogue: boolean;
  source_files: any;
  author: Author;
  rights_status: string;
  last_analyzed: string;
  analysis_confidence: string;
  sudowrite_quality_tier: string;
  notes_for_revision: string[];
}

export interface Author {
  name: string;
  pen_name: string;
  swa_member_no: string;
  email: string;
  country: string;
}

export interface ThematicArchitecture {
  central_question: string;
  thesis: string;
  antithesis: string;
  synthesis: string;
  premise_statement: string;
  motifs: Motif[];
  themes: Theme[];
  thesis_character: string;
  antithesis_character: string;
  synthesis_moment: string;
}

export interface Motif {
  motif: string;
  first_appearance: string;
  appearances: string[];
  significance: string;
}

export interface Theme {
  theme: string;
  weight: string;
  chapters_where_active: string[];
}

export interface StructuralMap {
  structure_framework: string;
  acts: Act[];
  beat_sheet: BeatSheet;
  subplot_overlay: SubplotOverlay;
}

export interface Act {
  act_id: string;
  act_name: string;
  act_label: string;
  chapter_ids: string[];
  dramatic_function: string;
  dominant_emotion: string;
  act_question: string;
  act_answer: string;
}

export interface BeatSheet {
  framework: string;
  beats: Beat[];
  missing_beats: any[];
  beat_coverage_score: string;
  beat_coverage_notes: string;
}

export interface Beat {
  beat_number: number;
  beat_name: string;
  chapter_id: string;
  scene_description: string;
  thematic_function: string;
  strength_rating: number;
  craft_notes: string;
}

export interface SubplotOverlay {
  primary_arc: string;
  b_story: string;
  c_story: string;
  d_story: string;
}

export interface Chapter {
  chapter_id: string;
  chapter_title: string;
  chapter_number: number;
  source?: any;
  synopsis?: Synopsis;
  intention?: Intention;
  scenes?: Scene[];
  beat_patterns?: BeatPattern;
  threads?: ChapterThreads;
}

export interface Synopsis {
  one_line: string;
  plot_summary: string;
  dramatic_summary: string;
}

export interface Intention {
  narrative_purpose: string;
  emotional_target: string;
  thematic_payload: string;
  setup_elements: string[];
  payoff_elements: string[];
  act_position: string;
  beat_sheet_position: string | null;
  inferred: boolean;
  confidence: string;
}

export interface Scene {
  scene_id: string;
  setting: {
    location: string;
    time_of_day: string | null;
    atmosphere: string;
  };
  pov_character: string;
  characters_present: string[];
  scene_goal: string;
  scene_conflict: string;
  scene_outcome: string;
  disaster_or_hook: string;
  reaction_beat: string | null;
  dialogue_density: string;
  pacing_rhythm: string;
  tension_scores: {
    dramatic: number;
    emotional: number;
    philosophical: number;
    pacing: number;
  };
  opening_line: string;
  closing_line: string;
}

export interface BeatPattern {
  dominant_beat_type: string;
  emotional_arc: string;
  tension_arc: string;
  opening_hook_strength: number;
  closing_hook_strength: number;
}

export interface ChapterThreads {
  introduced: Thread[];
  advanced: any[];
  resolved: any[];
  cliffhanger: boolean;
  cliffhanger_description?: string;
}

export interface Thread {
  thread_id: string;
  type: string;
  description: string;
  urgency: string;
}

export interface Character {
  character_id: string;
  full_name: string;
  aliases: string[];
  role: string;
  archetype: string;
  age_range?: string;
  age?: number;
  origin?: string;
  profession?: string;
  psychology: CharacterPsychology;
  arc: CharacterArc;
  chapter_moods: ChapterMood[];
  voice_signature: string;
  symbolic_associations: string[];
  relationships: Relationship[];
  chapters_present: string[];
  first_appearance: string;
  last_appearance: string;
}

export interface CharacterPsychology {
  ghost?: string;
  want: string;
  need: string | null;
  lie_they_believe: string;
  fear: string | null;
  flaw: string | null;
  strength: string;
  fatal_flaw?: string;
  inferred?: boolean;
  confidence?: string;
}

export interface CharacterArc {
  arc_type: string;
  arc_summary: string;
  transformation_moment: string | null;
}

export interface ChapterMood {
  chapter_id: string;
  emotional_state: string;
  motivation: string;
  want_status: string;
  need_status: string;
  key_choice: string | null;
  mood_shift: string | null;
}

export interface Relationship {
  with_character_id: string;
  type: string;
  dynamic: string;
  arc_of_relationship: string;
}

export interface NarrativeIntelligence {
  pov_strategy: string;
  timeline_structure: string;
  flashback_count: number;
  flashback_potential: string;
  flashforward_count: number;
  flashforward_locations: string[];
  narrator_register: string;
  subplots: Subplot[];
}

export interface Subplot {
  subplot_id: string;
  subplot_name: string;
  primary_characters: string[];
  function: string;
  chapters_active: string[];
  resolved: boolean;
  resolution_chapter: string | null;
  resolution_status?: string;
}

export interface CraftAssessment {
  sudowrite_benchmark: SudowriteBenchmark;
  award_potential: AwardPotential;
  strengths: Strength[];
  critical_gaps: CriticalGap[];
  revision_priorities: RevisionPriority[];
}

export interface SudowriteBenchmark {
  overall_tier: string;
  score_out_of_100: number;
  dimensions: Record<string, number>;
  justification: string;
}

export interface AwardPotential {
  readiness: string;
  closest_category: string;
  comparable_winners: string[];
  what_would_elevate_it: string[];
}

export interface Strength {
  strength: string;
  evidence: string;
}

export interface CriticalGap {
  gap: string;
  severity: string;
  affected_chapters: string[];
  fix: string;
}

export interface RevisionPriority {
  rank: number;
  issue: string;
  category: string;
  fix: string;
}

export interface ReferenceDocument {
  doc_id: string;
  filename: string;
  origin: string;
  doc_type: string;
  summary: string;
  key_facts: string[];
  influences_chapters: string[];
  contradictions_with_manuscript: string[];
}

export interface ContinuityReport {
  total_issues: number;
  inconsistencies: Inconsistency[];
  dangling_threads: DanglingThread[];
  narrative_gaps: NarrativeGap[];
}

export interface Inconsistency {
  id: string;
  type: string;
  description: string;
  chapter_a: string;
  chapter_b: string;
  severity: string;
  fix: string;
}

export interface DanglingThread {
  thread_id: string;
  description: string;
  introduced_in: string;
  status: string;
  resolution_status?: string;
}

export interface NarrativeGap {
  description: string;
  between_chapters: string[];
  what_is_missing: string;
}
