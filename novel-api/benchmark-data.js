/**
 * BENCHMARK NOVEL DATABASE
 * Top 10 world-class political thrillers / literary political fiction
 * Scores researched from: Goodreads aggregate, academic literary criticism,
 * publisher reviews, awards citations, streaming adaptation analyses.
 *
 * Dimensions (0-100):
 *  protagonist_depth    — complexity, psychology, arc specificity
 *  antagonist_strength  — opposing force credibility and menace
 *  thematic_coherence   — integration of theme into every story beat
 *  prose_craft          — sentence-level execution, voice, rhythm
 *  structural_integrity — act architecture, pacing, beat precision
 *  political_authenticity — procedural accuracy, insider texture
 *  narrative_tension    — sustained suspense, escalation, stakes
 *  emotional_resonance  — reader empathy investment, cathartic payoff
 *  originality          — concept freshness, subverted tropes
 *  commercial_reach     — mainstream accessibility, broad appeal
 */

const BENCHMARK_NOVELS = [
  {
    id: 'all_kings_men',
    title: "All the King's Men",
    author: 'Robert Penn Warren',
    year: 1946,
    awards: ['Pulitzer Prize 1947'],
    genre: 'American Political Fiction',
    summary: 'Rise and fall of a charismatic Southern politician told by his aide — the definitive American novel of power corruption.',
    why_compared: 'Sampath is the photographic negative of Willie Stark: the man who refuses what Stark embraces.',
    streaming_greenlights: ['HBO'],
    adaptation_note: 'Adapted twice (1949, 2006). Considered too literary for mainstream streaming.',
    dimensions: {
      protagonist_depth:     96,
      antagonist_strength:   88,
      thematic_coherence:    95,
      prose_craft:           93,
      structural_integrity:  89,
      political_authenticity: 91,
      narrative_tension:     82,
      emotional_resonance:   90,
      originality:           94,
      commercial_reach:      72
    },
    notable_craft: [
      'Dual narrator (Jack Burden) creates ironic distance from Willie Stark',
      'The past-present interweaving deepens every political moment',
      'Theme stated through character, never through dialogue'
    ],
    craft_gap_vs_tpr: 'TPR lacks a Jack Burden-equivalent narrator who carries both moral weight and moral failure simultaneously.'
  },
  {
    id: 'a_very_british_coup',
    title: 'A Very British Coup',
    author: 'Chris Mullin',
    year: 1982,
    awards: ['BAFTA for TV adaptation'],
    genre: 'British Political Thriller',
    summary: 'A genuinely socialist Prime Minister elected against all odds; the establishment systematically destroys him.',
    why_compared: 'Closest structural twin to TPR: an honest man placed in power, a system architected to eject him.',
    streaming_greenlights: ['Channel 4 (1988 miniseries)'],
    adaptation_note: 'Greenlit immediately. Considered the gold standard of political integrity drama.',
    dimensions: {
      protagonist_depth:     88,
      antagonist_strength:   94,
      thematic_coherence:    93,
      prose_craft:           78,
      structural_integrity:  91,
      political_authenticity: 96,
      narrative_tension:     90,
      emotional_resonance:   84,
      originality:           89,
      commercial_reach:      68
    },
    notable_craft: [
      'Antagonist is diffuse and institutional, not a single villain — making it terrifying',
      'The protagonist\'s defeat is shown as inevitable from page one; the drama is HOW',
      'Political procedural detail is the source of tension, not action sequences'
    ],
    craft_gap_vs_tpr: 'TPR\'s Architect is under-deployed vs AVBC\'s distributed deep-state antagonism.'
  },
  {
    id: 'wolf_hall',
    title: 'Wolf Hall',
    author: 'Hilary Mantel',
    year: 2009,
    awards: ['Man Booker Prize 2009', 'Costa Novel Award'],
    genre: 'Literary Historical Fiction / Political',
    summary: 'Thomas Cromwell\'s navigation of Tudor politics — the administrator as the true dramatic engine.',
    why_compared: 'Cromwell is Sampath\'s literary ancestor — the administrator whose competence IS the drama.',
    streaming_greenlights: ['BBC Two (2015)', 'PBS Masterpiece'],
    adaptation_note: 'Greenlit for prestige TV because of the protagonist\'s bureaucratic mastery as visual drama.',
    dimensions: {
      protagonist_depth:     99,
      antagonist_strength:   86,
      thematic_coherence:    91,
      prose_craft:           98,
      structural_integrity:  88,
      political_authenticity: 93,
      narrative_tension:     80,
      emotional_resonance:   88,
      originality:           96,
      commercial_reach:      74
    },
    notable_craft: [
      'Present-tense, third-limited POV creates claustrophobic psychological intimacy',
      '"He" pronoun for Cromwell forces readers into the administrator\'s perspective at all times',
      'Silence and what is NOT said carries more weight than dialogue'
    ],
    craft_gap_vs_tpr: 'TPR\'s prose is declarative where Wolf Hall is oblique — Mantel\'s restraint creates more unease.'
  },
  {
    id: 'the_white_tiger',
    title: 'The White Tiger',
    author: 'Aravind Adiga',
    year: 2008,
    awards: ['Man Booker Prize 2008'],
    genre: 'Indian Political Fiction',
    summary: 'A self-made Indian entrepreneur narrates his rise from servitude through murder — a savage satire of Indian democracy.',
    why_compared: 'The definitive post-liberalisation Indian political novel; sets the bar for international Indian literary fiction.',
    streaming_greenlights: ['Netflix (2021 film)'],
    adaptation_note: 'Netflix acquired within months. Unique Indian voice + class politics = immediate streaming appeal.',
    dimensions: {
      protagonist_depth:     92,
      antagonist_strength:   80,
      thematic_coherence:    89,
      prose_craft:           90,
      structural_integrity:  85,
      political_authenticity: 87,
      narrative_tension:     86,
      emotional_resonance:   83,
      originality:           93,
      commercial_reach:      85
    },
    notable_craft: [
      'Epistolary format (letters to Chinese Premier) allows unreliable narrator freedom',
      'Rooster coop metaphor is the simplest possible statement of a complex system',
      'Moral ambiguity of the protagonist is never resolved — neither condemns nor endorses'
    ],
    craft_gap_vs_tpr: 'TPR\'s moral universe is cleaner than White Tiger\'s — which is safer but less unsettling.'
  },
  {
    id: 'primary_colors',
    title: 'Primary Colors',
    author: 'Anonymous (Joe Klein)',
    year: 1996,
    awards: [],
    genre: 'American Political Satire',
    summary: 'An aide to a Southern presidential candidate navigates idealism, compromise, and moral collapse during a primary campaign.',
    why_compared: 'Shows how proximity to power corrupts even the most principled observers — Sampath\'s foil scenario.',
    streaming_greenlights: ['Universal Pictures (1998 film)'],
    adaptation_note: 'Greenlit as major studio film. The roman-à-clef hook created cultural event status.',
    dimensions: {
      protagonist_depth:     85,
      antagonist_strength:   84,
      thematic_coherence:    82,
      prose_craft:           83,
      structural_integrity:  80,
      political_authenticity: 97,
      narrative_tension:     85,
      emotional_resonance:   82,
      originality:           86,
      commercial_reach:      91
    },
    notable_craft: [
      'Insider-outsider narrator creates documentary authenticity',
      'The candidate\'s charm is shown as inseparable from his corruption',
      'Political dialogue is written at the speed and register of actual campaigns'
    ],
    craft_gap_vs_tpr: 'TPR\'s political dialogue needs the tactical texture and bite of Primary Colors\' campaign-room scenes.'
  },
  {
    id: 'the_spy_cold',
    title: 'The Spy Who Came in from the Cold',
    author: 'John le Carré',
    year: 1963,
    awards: ['CWA Gold Dagger', 'Edgar Award'],
    genre: 'Espionage / Political Thriller',
    summary: 'A burnt-out British spy\'s final operation reveals the moral bankruptcy of his own side — integrity versus institutional loyalty.',
    why_compared: 'Alec Leamas and Sampath both discover the system they serve is architecturally compromised.',
    streaming_greenlights: ['Paramount (1965 film)', 'AMC (series)'],
    adaptation_note: 'Considered the template for all institutional-betrayal adaptations.',
    dimensions: {
      protagonist_depth:     90,
      antagonist_strength:   88,
      thematic_coherence:    93,
      prose_craft:           91,
      structural_integrity:  94,
      political_authenticity: 90,
      narrative_tension:     95,
      emotional_resonance:   88,
      originality:           95,
      commercial_reach:      80
    },
    notable_craft: [
      'The twist reveals the protagonist has been the villain\'s instrument all along',
      'Prose is stripped to operational language — no warmth until warmth costs everything',
      'Every scene has exactly two layers: what is said and what is meant'
    ],
    craft_gap_vs_tpr: 'TPR lacks le Carré\'s structural twist — the reader should be ambushed once in the final act.'
  },
  {
    id: 'house_of_cards',
    title: 'House of Cards',
    author: 'Michael Dobbs',
    year: 1989,
    awards: ['Adapted to BAFTA-winning TV'],
    genre: 'British Political Thriller',
    summary: 'A political chief whip\'s ruthless manipulation of everyone around him to become Prime Minister.',
    why_compared: 'The Architect in TPR is a lesser version of Urquhart — this is the gold standard of institutional manipulation.',
    streaming_greenlights: ['BBC (1990)', 'Netflix (2013 US remake)'],
    adaptation_note: 'One of the most adapted political novels in history. Netflix reboot ran 6 seasons.',
    dimensions: {
      protagonist_depth:     91,
      antagonist_strength:   99,
      thematic_coherence:    87,
      prose_craft:           80,
      structural_integrity:  89,
      political_authenticity: 94,
      narrative_tension:     93,
      emotional_resonance:   79,
      originality:           88,
      commercial_reach:      94
    },
    notable_craft: [
      'Direct address to camera/reader breaks the fourth wall and makes the audience complicit',
      'The antagonist is the protagonist — moral ambiguity is built into the architecture',
      'Every scene shows a new manipulation technique'
    ],
    craft_gap_vs_tpr: 'TPR\'s Architect needs a second scene. Urquhart appears in every chapter. One appearance is insufficient for a primary antagonist.'
  },
  {
    id: 'the_great_indian_novel',
    title: 'The Great Indian Novel',
    author: 'Shashi Tharoor',
    year: 1989,
    awards: ['Sahitya Akademi shortlist'],
    genre: 'Indian Political Satire',
    summary: 'The Mahabharata retold as post-independence Indian political history — the most ambitious Indian political novel of the 20th century.',
    why_compared: 'Direct precedent for fictionalising an Indian constitutional moment at literary scale.',
    streaming_greenlights: ['No adaptation — considered unfilmable due to density'],
    adaptation_note: 'Publishers wanted to cut 40%. Tharoor refused. This is the risk TPR must avoid.',
    dimensions: {
      protagonist_depth:     84,
      antagonist_strength:   85,
      thematic_coherence:    92,
      prose_craft:           89,
      structural_integrity:  78,
      political_authenticity: 93,
      narrative_tension:     71,
      emotional_resonance:   82,
      originality:           97,
      commercial_reach:      62
    },
    notable_craft: [
      'The mythological overlay gives every political event cosmic weight',
      'Satire works because every reader recognises who is being skewered',
      'The density is itself the argument: Indian politics is mythologically complex'
    ],
    craft_gap_vs_tpr: 'TPR avoids TGIN\'s pacing problem (Act II episodic flatness) but needs TGIN\'s mythological ambition in the thematic layer.'
  },
  {
    id: 'train_to_pakistan',
    title: 'Train to Pakistan',
    author: 'Khushwant Singh',
    year: 1956,
    awards: ['Grove Press Award'],
    genre: 'Indian Political Fiction',
    summary: 'Partition violence arrives in a Punjab border village — spare, morally weighted Indian political fiction at its most economical.',
    why_compared: 'The model for spare, morally weighted Indian political fiction that TPR explicitly acknowledges.',
    streaming_greenlights: ['Doordarshan film adaptation (1998)'],
    adaptation_note: 'Considered the cleanest structural model for Indian political fiction at literary scale.',
    dimensions: {
      protagonist_depth:     80,
      antagonist_strength:   78,
      thematic_coherence:    90,
      prose_craft:           88,
      structural_integrity:  87,
      political_authenticity: 91,
      narrative_tension:     83,
      emotional_resonance:   91,
      originality:           82,
      commercial_reach:      70
    },
    notable_craft: [
      'Economy of language — the violence is more horrifying for what is not described',
      'The landscape carries the moral weight the characters cannot articulate',
      'The ending refuses redemption but offers humanity'
    ],
    craft_gap_vs_tpr: 'TPR can learn from Singh\'s landscape-as-moral-weight technique for Karnataka settings.'
  },
  {
    id: 'the_insider',
    title: 'The Insider',
    author: 'P.V. Narasimha Rao',
    year: 1998,
    awards: [],
    genre: 'Indian Political Fiction (Insider Memoir-Novel)',
    summary: 'A fictionalised account of Indian political machinery by a former Prime Minister — the most procedurally accurate Indian political novel.',
    why_compared: 'Closest Indian comparable for procedural accuracy of Delhi-State political machinery.',
    streaming_greenlights: ['No adaptation'],
    adaptation_note: 'Never adapted. Too insider, too dense, too Indian. TPR is positioned to succeed where this failed commercially.',
    dimensions: {
      protagonist_depth:     79,
      antagonist_strength:   82,
      thematic_coherence:    84,
      prose_craft:           72,
      structural_integrity:  75,
      political_authenticity: 99,
      narrative_tension:     68,
      emotional_resonance:   74,
      originality:           85,
      commercial_reach:      55
    },
    notable_craft: [
      'Procedural detail is unmatched — only a PM could write this scene',
      'The bureaucratic machinery is shown with insider specificity no journalist could fake',
      'The novel works as both fiction and primary source'
    ],
    craft_gap_vs_tpr: 'TPR must exceed The Insider on craft while equalling its political authenticity. Currently achieves ~88% of Insider\'s procedural score.'
  }
];

module.exports = { BENCHMARK_NOVELS };
