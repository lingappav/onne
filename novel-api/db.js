const Datastore = require('@seald-io/nedb');
const path = require('path');
const fs = require('fs');

// Use Render's persistent disk if available, otherwise local ./data
const DB_DIR = process.env.NODE_ENV === 'production'
  ? path.resolve('/app/onne-db')
  : path.resolve(__dirname, '../data/db');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

function makeStore(name) {
  return new Datastore({ filename: path.join(DB_DIR, `${name}.db`), autoload: true });
}

const pitchesDb       = makeStore('pitches');
const filmAgreementDb = makeStore('film_agreement');
const tasksDb         = makeStore('tasks');
const journalDb       = makeStore('journal_posts');
const commentsDb      = makeStore('journal_comments');

// ── seed helpers ─────────────────────────────────────────────────────────────

function seedIfEmpty(db, docs, onDone) {
  db.count({}, (err, count) => {
    if (err || count > 0) { if (onDone) onDone(); return; }
    db.insert(docs, () => { if (onDone) onDone(); });
  });
}

// ── PITCH STATUS seed data ────────────────────────────────────────────────────

const PUBLISHER_PITCHES = [
  { type: 'publisher', name: 'Juggernaut Books', contact: 'Chiki Sarkar (Founder)', tier: 'Tier 1', status: 'not_sent', submitted: null, last_contact: null, notes: 'Political fiction specialist. Via literary agent preferred.', priority: 'high' },
  { type: 'publisher', name: 'Westland / Eka', contact: 'Karthika V.K. (Publisher)', tier: 'Tier 1', status: 'not_sent', submitted: null, last_contact: null, notes: 'Strong literary fiction list. Direct OK or via agent.', priority: 'high' },
  { type: 'publisher', name: 'Aleph Book Company', contact: 'David Davidar (Founder)', tier: 'Tier 1', status: 'not_sent', submitted: null, last_contact: null, notes: 'Prestige literary fiction. Small, curated. Very selective.', priority: 'high' },
  { type: 'publisher', name: 'Penguin Random House India', contact: 'Hamish Hamilton Imprint', tier: 'Tier 1', status: 'not_sent', submitted: null, last_contact: null, notes: 'Requires literary agent. Largest reach in India.', priority: 'high' },
  { type: 'publisher', name: 'HarperCollins India', contact: 'Fourth Estate Imprint', tier: 'Tier 2', status: 'not_sent', submitted: null, last_contact: null, notes: 'Literary + commercial crossover. Via agent.', priority: 'medium' },
  { type: 'publisher', name: 'Speaking Tiger Books', contact: 'Direct submissions OK', tier: 'Tier 2', status: 'not_sent', submitted: null, last_contact: null, notes: 'Independent, politically engaged. Direct submissions accepted.', priority: 'medium' },
  { type: 'publisher', name: 'Context (Westland)', contact: 'Karthika V.K.', tier: 'Tier 2', status: 'not_sent', submitted: null, last_contact: null, notes: 'Non-fiction adjacent. Some political literary fiction.', priority: 'medium' },
  { type: 'publisher', name: 'Bloomsbury India', contact: 'Direct submissions OK', tier: 'Tier 2', status: 'not_sent', submitted: null, last_contact: null, notes: 'Smaller India list. Considers indie authors directly.', priority: 'medium' },
  { type: 'publisher', name: 'Hachette India', contact: 'Thomas Abraham (MD)', tier: 'Tier 2', status: 'not_sent', submitted: null, last_contact: null, notes: 'Growing literary fiction list. Via agent preferred.', priority: 'medium' },
  { type: 'publisher', name: 'Simon & Schuster India', contact: 'Submissions team', tier: 'Tier 3', status: 'not_sent', submitted: null, last_contact: null, notes: 'Newer India operation. Worth including in batch.', priority: 'low' }
];

const AGENT_PITCHES = [
  { type: 'agent', name: 'Kanishka Gupta — Writer\'s Side', contact: 'Kanishka Gupta', tier: 'Tier 1', status: 'not_sent', submitted: null, last_contact: null, notes: 'Most active agent for Indian literary fiction. Books & Beyond podcast host. Sunday Cinemas option is a major differentiator.', priority: 'high' },
  { type: 'agent', name: 'Mita Kapur — Siyahi', contact: 'Mita Kapur', tier: 'Tier 1', status: 'not_sent', submitted: null, last_contact: null, notes: 'Literary prestige. Long track record with serious fiction.', priority: 'high' },
  { type: 'agent', name: 'Jayapriya Vasudevan — Jacaranda Press', contact: 'Jayapriya Vasudevan', tier: 'Tier 2', status: 'not_sent', submitted: null, last_contact: null, notes: 'Some literary fiction. Boutique agency.', priority: 'medium' },
  { type: 'agent', name: 'Anish Chandy — Labyrinth Literary', contact: 'Anish Chandy', tier: 'Tier 2', status: 'not_sent', submitted: null, last_contact: null, notes: 'Newer, ambitious. Worth approaching simultaneously.', priority: 'medium' },
  { type: 'agent', name: 'Suhail Mathur — Book Bakers', contact: 'Suhail Mathur', tier: 'Tier 3', status: 'not_sent', submitted: null, last_contact: null, notes: 'Wider commercial net. Good for backup.', priority: 'low' }
];

const FUNDRAISE_CONTACTS = [
  { type: 'fundraise', category: 'Tech Philanthropists', name: 'Rohini Nilekani', org: 'Rohini Nilekani Philanthropies', channel: 'Foundation application', ask_inr: 500000, status: 'not_sent', notes: 'Backs independent writing & civic discourse. "Independent and Public-Spirited Media" track. Apply formally.', priority: 'high' },
  { type: 'fundraise', category: 'Tech Philanthropists', name: 'Sudha Murty / Narayana Murthy', org: 'Infosys Foundation', channel: 'Foundation application', ask_inr: 500000, status: 'not_sent', notes: 'Books, libraries, Kannada cultural work. Strongest fit for a Karnataka political novel.', priority: 'high' },
  { type: 'fundraise', category: 'Tech Philanthropists', name: 'Kiran Mazumdar-Shaw', org: 'Biocon Foundation', channel: 'Foundation application', ask_inr: 300000, status: 'not_sent', notes: 'Arts and ideas adjacent.', priority: 'medium' },
  { type: 'fundraise', category: 'Tech Philanthropists', name: 'Mohandas Pai', org: 'Manipal Global / Aarin Capital', channel: 'Twitter / Direct', ask_inr: 100000, status: 'not_sent', notes: 'Vocal, engaged with ideas, accessible on Twitter. Lower-friction ask.', priority: 'medium' },
  { type: 'fundraise', category: 'Business Families', name: 'Jitu Virwani', org: 'Embassy Group', channel: 'CSR application', ask_inr: 500000, status: 'not_sent', notes: 'Real-estate scale; arts patronage growing.', priority: 'medium' },
  { type: 'fundraise', category: 'Business Families', name: 'Sangita Jindal', org: 'JSW Foundation / Art India', channel: 'Foundation application', ask_inr: 500000, status: 'not_sent', notes: 'India\'s most active corporate-arts giver. Mumbai-anchored.', priority: 'medium' },
  { type: 'fundraise', category: 'Business Families', name: 'Tata Trusts', org: 'Multiple sub-trusts', channel: 'Formal application', ask_inr: 1000000, status: 'not_sent', notes: 'Slow process, high standing. Apply early.', priority: 'high' },
  { type: 'fundraise', category: 'Grants', name: 'India Foundation for the Arts (IFA)', org: 'IFA', channel: 'Rolling grant application', ask_inr: 500000, status: 'not_sent', notes: 'Arts Practice grant. Up to ₹5L. Strong fit for political novel. Apply by Day 20.', priority: 'high' },
  { type: 'fundraise', category: 'Grants', name: 'Toto Funds the Arts', org: 'Toto', channel: 'Annual grant', ask_inr: 200000, status: 'not_sent', notes: 'Emerging-writer grant ₹1–2L. Check age eligibility.', priority: 'medium' },
  { type: 'fundraise', category: 'Grants', name: 'Sangam House', org: 'Sangam House', channel: 'Annual residency', ask_inr: 200000, status: 'not_sent', notes: 'Residency grant (in-kind). Frees writing time.', priority: 'medium' }
];

const SUGGESTED_CONTACTS = [
  { type: 'suggested', category: 'International Publishers', name: 'Granta Publications (UK)', reason: 'Political fiction from the Indian subcontinent. Strong international literary prestige for rights.', action: 'Submit via UK literary agent after Indian deal is secured.' },
  { type: 'suggested', category: 'International Publishers', name: 'Europa Editions (US/EU)', reason: 'Specialises in translated and world literature political fiction.', action: 'Submit simultaneously with UK agents.' },
  { type: 'suggested', category: 'International Publishers', name: 'Restless Books (US)', reason: 'International voices, political themes. Indie but impactful.', action: 'Direct submission accepted.' },
  { type: 'suggested', category: 'OTT / Film Rights', name: 'Netflix India (Original Film/Series)', reason: 'Political thriller format. Constitutional collapse story = high-concept OTT pitch.', action: 'Submit via Sunday Cinemas or separate rep after film deal closes.' },
  { type: 'suggested', category: 'OTT / Film Rights', name: 'Amazon Prime Video India', reason: 'Series adaptation rights. Political thrillers performing well on Prime India.', action: 'Via production house or directly to acquisitions.' },
  { type: 'suggested', category: 'OTT / Film Rights', name: 'ZEE5 Originals', reason: 'Regional language + Hindi co-production. Kannada Super Star attachment adds value.', action: 'Post Sunday Cinemas deal announcement.' },
  { type: 'suggested', category: 'Awards / Visibility', name: 'JCB Prize for Literature', reason: 'Top Indian literary prize. Eligibility after publication. Win = international advance.', action: 'Submit post-publication.' },
  { type: 'suggested', category: 'Awards / Visibility', name: 'DSC Prize for South Asian Literature', reason: 'International South Asian prize. Strong visibility with diaspora readers.', action: 'Submit after UK/US deal.' },
  { type: 'suggested', category: 'Awards / Visibility', name: 'Sahitya Akademi Award', reason: 'Most prestigious Indian literary recognition. English fiction category.', action: 'Post-publication via publisher nomination.' }
];

const FUNDRAISE_SUMMARY = {
  _id: 'summary',
  target_usd: 9000,
  raised_usd: 0,
  stream_a_patrons: 0,
  stream_b_sponsors: 0,
  stream_c_big: 0,
  substack_paid: 0,
  day_of_90: 0,
  last_updated: new Date().toISOString(),
  notes: 'Fundraise launched. Sunday Cinemas 24-month film option secured Feb 2026 — use as credibility signal in every cold ask.'
};

// ── FILM AGREEMENT seed data ──────────────────────────────────────────────────

const FILM_AGREEMENT = {
  _id: 'film_agreement',
  title: 'The President\'s Rule — Feature Film Option Agreement',
  production_company: 'Sunday Cinemas',
  option_type: '24-Month Exclusive Film Option',
  option_start: '2026-02-01',
  option_expiry: '2028-01-31',
  budget_min_usd: 2000000,
  budget_max_usd: 3000000,
  format: 'Feature Film (Theatrical)',
  language_primary: 'Kannada',
  language_secondary: 'Hindi',
  star_attachment: 'Kannada Super Star (attached)',
  director_status: 'TBD',
  rights_granted: [
    'Feature film theatrical rights',
    'OTT streaming rights (post-theatrical window)',
    'Digital distribution rights'
  ],
  rights_reserved: [
    'Novel publishing rights',
    'Series adaptation rights',
    'International co-production rights (post-option exercise)',
    'Sequel / prequel rights'
  ],
  option_fee_inr: 'Confidential',
  royalty_on_exercise: 'TBD — negotiation pending',
  screenplay_credit: 'Based on novel by Vishwa Shambhulingappa',
  milestones: [
    { milestone: 'Option Agreement signed', date: '2026-02-01', status: 'completed', notes: 'Secured' },
    { milestone: 'Screenplay commission', date: '2026-06-01', status: 'pending', notes: 'Writer TBD' },
    { milestone: 'First draft screenplay', date: '2026-10-01', status: 'pending', notes: '' },
    { milestone: 'Star attachment confirmed (public)', date: '2026-12-01', status: 'pending', notes: 'Kannada Super Star attached privately' },
    { milestone: 'Budget financing package closed', date: '2027-03-01', status: 'pending', notes: '$2–3M USD target' },
    { milestone: 'Pre-production begins', date: '2027-06-01', status: 'pending', notes: '' },
    { milestone: 'Principal photography', date: '2027-09-01', status: 'pending', notes: '' },
    { milestone: 'Post-production & VFX', date: '2028-01-01', status: 'pending', notes: '' }
  ],
  key_contacts: [
    { role: 'Production Company', name: 'Sunday Cinemas', email: '', phone: '' },
    { role: 'Author / Rights Holder', name: 'Vishwa Shambhulingappa', email: 'lingappa.vishwa@gmail.com', phone: '' }
  ],
  commercial_notes: 'Political thriller with constitutional-collapse premise. Kannada Super Star attachment secures regional theatrical viability. Budget of $2–3M positions as premium Kannada production with pan-India OTT potential. Sunday Cinemas option is the primary credibility signal for all publisher and investor conversations.',
  last_updated: new Date().toISOString()
};

// ── COPYWRITING TASKS seed data ───────────────────────────────────────────────

const DEFAULT_TASKS = [
  { category: 'Publisher Pitch', title: 'Write one-page pitch document (print PDF)', status: 'todo', priority: 'critical', due: '2026-06-01', notes: 'Core pitch asset. Required before any publisher submission.' },
  { category: 'Publisher Pitch', title: 'Write 3-page synopsis (chapters + arc)', status: 'todo', priority: 'critical', due: '2026-06-01', notes: 'Publishers require this before accepting full manuscript.' },
  { category: 'Publisher Pitch', title: 'Write query letter template (agent version)', status: 'todo', priority: 'high', due: '2026-06-07', notes: 'Personalise for each agent: Kanishka, Mita, Jayapriya, Anish, Suhail.' },
  { category: 'Publisher Pitch', title: 'Write query letter template (publisher direct version)', status: 'todo', priority: 'high', due: '2026-06-07', notes: 'For Speaking Tiger, Bloomsbury — accepts direct submissions.' },
  { category: 'Publisher Pitch', title: 'Polish first 3 chapters to submission standard', status: 'todo', priority: 'critical', due: '2026-06-14', notes: 'Most publishers ask for 3 chapters + synopsis. Must be pristine.' },
  { category: 'Fundraising', title: 'Write IFA Arts Practice grant application', status: 'todo', priority: 'high', due: '2026-06-15', notes: 'Up to ₹5L. Rolling cycle. Apply by Day 20 of 90-day campaign.' },
  { category: 'Fundraising', title: 'Write Toto Funds the Arts application', status: 'todo', priority: 'medium', due: '2026-07-01', notes: 'Check age eligibility first.' },
  { category: 'Fundraising', title: 'Write Infosys Foundation application letter', status: 'todo', priority: 'high', due: '2026-06-20', notes: 'Kannada cultural work angle. Most aligned for a Karnataka political novel.' },
  { category: 'Fundraising', title: 'Write Rohini Nilekani Philanthropies application', status: 'todo', priority: 'high', due: '2026-06-20', notes: '"Independent and Public-Spirited Media" track.' },
  { category: 'Film / Rights', title: 'Draft OTT pitch deck (Netflix India / Amazon Prime)', status: 'todo', priority: 'medium', due: '2026-07-15', notes: 'Use Sunday Cinemas deal as anchor. Political thriller = high-concept OTT.' },
  { category: 'Film / Rights', title: 'Write series adaptation treatment (6-episode structure)', status: 'todo', priority: 'medium', due: '2026-08-01', notes: 'Complement to film deal. Separate rights reserved.' },
  { category: 'Marketing', title: 'Write author bio (long form — 400 words)', status: 'todo', priority: 'high', due: '2026-06-07', notes: 'Used in all pitch materials, website, press kit.' },
  { category: 'Marketing', title: 'Write author bio (short form — 80 words)', status: 'todo', priority: 'high', due: '2026-06-07', notes: 'Used for Substack header, social profiles, podcast intros.' },
  { category: 'Marketing', title: 'Write novel back-cover blurb (250 words)', status: 'todo', priority: 'critical', due: '2026-06-07', notes: 'This is the sales copy. Rewrite until every sentence earns its place.' },
  { category: 'Marketing', title: 'Write Substack launch announcement post', status: 'todo', priority: 'high', due: '2026-06-14', notes: 'First public post. Set tone, announce the project, soft fundraise CTA.' },
  { category: 'Marketing', title: 'Write press release: Sunday Cinemas option announcement', status: 'todo', priority: 'high', due: '2026-06-21', notes: 'Embargo until Sunday Cinemas approves. Draft now.' },
  { category: 'Chapter Revision', title: 'Revise Chapter 1 (Delhi Gambit) to submission standard', status: 'todo', priority: 'critical', due: '2026-06-14', notes: 'Opening chapter. Must hook agent on page 1.' },
  { category: 'Chapter Revision', title: 'Revise Chapter 2 based on benchmark insights', status: 'todo', priority: 'high', due: '2026-06-21', notes: 'Use Chapter Workshop tool.' },
  { category: 'Chapter Revision', title: 'Complete all 24 chapter revisions (benchmark-driven)', status: 'todo', priority: 'high', due: '2026-09-01', notes: 'Target: all benchmark dimensions at 80+ before publisher submission.' },
  { category: 'Social / Platform', title: 'Set up Substack: thepresidentsrule.substack.com', status: 'todo', priority: 'high', due: '2026-06-07', notes: 'Pin fundraising banner. Schedule first post.' },
  { category: 'Social / Platform', title: 'Write 4-week Substack content calendar', status: 'todo', priority: 'medium', due: '2026-06-07', notes: 'One post per week. Each must also be the weekly outreach story.' }
];

// ── seed all collections ──────────────────────────────────────────────────────

function seedAll() {
  seedIfEmpty(pitchesDb, [...PUBLISHER_PITCHES, ...AGENT_PITCHES, ...FUNDRAISE_CONTACTS, ...SUGGESTED_CONTACTS]);
  pitchesDb.findOne({ _id: 'summary' }, (err, doc) => {
    if (!doc) pitchesDb.insert(FUNDRAISE_SUMMARY);
  });
  filmAgreementDb.findOne({ _id: 'film_agreement' }, (err, doc) => {
    if (!doc) filmAgreementDb.insert(FILM_AGREEMENT);
  });
  seedIfEmpty(tasksDb, DEFAULT_TASKS.map((t, i) => ({ ...t, order: i })));
}

// ── 90-DAY PLAN DB ────────────────────────────────────────────────────────────
const planDb       = makeStore('plan90');
const activityDb   = makeStore('plan90_activity');

const PLAN_CHAPTERS = [
  // Act I
  { _id:'CH_01', act:'act1', num:1, title:'The Broken Compass', sub:'Midnight summons in Ranchi. SUVs. Dal and schoolbags. The locked door.', words_target:3000, status:'not_started', started_date:null, completed_date:null, notes:'', word_count_actual:0 },
  { _id:'CH_02', act:'act1', num:2, title:'Delhi Gambit', sub:'Integrity as political shield. A deal sealed in expectation, not ink.', words_target:2500, status:'not_started', started_date:null, completed_date:null, notes:'', word_count_actual:0 },
  { _id:'CH_03', act:'act1', num:3, title:'Language & a Bad Punchline', sub:'A loyalty test in Kannada. "Learn in 90 days or find another job — with full heart."', words_target:2500, status:'not_started', started_date:null, completed_date:null, notes:'', word_count_actual:0 },
  { _id:'CH_04', act:'act1', num:4, title:'Digital Backlash', sub:'#AntiSampath. The Diluting Machine. "We are running a state, not a startup."', words_target:2500, status:'not_started', started_date:null, completed_date:null, notes:'', word_count_actual:0 },
  { _id:'CH_05', act:'act1', num:5, title:'Triple Agenda', sub:'Fiscal sanity, law reset, no free lunches. "I am no longer your ATM."', words_target:2500, status:'not_started', started_date:null, completed_date:null, notes:'', word_count_actual:0 },
  { _id:'CH_06', act:'act1', num:6, title:'Ethical Anchor', sub:'Rs. 500 Cr bribe dressed as CSR. "My principles are not for sale at any price."', words_target:2500, status:'not_started', started_date:null, completed_date:null, notes:'', word_count_actual:0 },
  { _id:'CH_07', act:'act1', num:7, title:'The High-Octane Friday', sub:'7 crises, 7 decisions, 8 hours. "A functioning democracy would be nice."', words_target:3000, status:'not_started', started_date:null, completed_date:null, notes:'', word_count_actual:0 },
  { _id:'CH_08', act:'act1', num:8, title:'Shadow Economy', sub:'Rs. 36,000 Cr black money. 70% digital compliance. First fracture in a decades-old wall.', words_target:2500, status:'not_started', started_date:null, completed_date:null, notes:'', word_count_actual:0 },
  // Act II
  { _id:'CH_09', act:'act2', num:9, title:'Midnight Incision', sub:'11:47 PM. Court seal. Sealed FIR. "The process was followed. Let the law work."', words_target:2500, status:'not_started', started_date:null, completed_date:null, notes:'', word_count_actual:0 },
  { _id:'CH_10', act:'act2', num:10, title:'Shadow Siege', sub:'#DirtyDoctor. Fabricated audio clip. "Cancerous cells are expert at disguise."', words_target:2500, status:'not_started', started_date:null, completed_date:null, notes:'', word_count_actual:0 },
  { _id:'CH_11', act:'act2', num:11, title:'The No Alcohol Dilemma', sub:'Health policy becomes culture war. "Nobody films the bootleg mafia killing people quietly."', words_target:2500, status:'not_started', started_date:null, completed_date:null, notes:'', word_count_actual:0 },
  { _id:'CH_12', act:'act2', num:12, title:'The Stray Dog Dilemma', sub:'#NaayiSarkar. Heat maps. 45% reduction. "No one trends that."', words_target:2500, status:'not_started', started_date:null, completed_date:null, notes:'', word_count_actual:0 },
  { _id:'CH_13', act:'act2', num:13, title:'The RIP Moment', sub:'Funeral rally at Palace Grounds. He\'s in Kodagu in the rain. "Rice, not rhetoric."', words_target:2500, status:'not_started', started_date:null, completed_date:null, notes:'', word_count_actual:0 },
  { _id:'CH_14', act:'act2', num:14, title:'Spying & Surveillance', sub:'His office is watching him. "They have everything except a reason."', words_target:2500, status:'not_started', started_date:null, completed_date:null, notes:'', word_count_actual:0 },
  { _id:'CH_15', act:'act2', num:15, title:'The Grand Arrest', sub:'Rs. 1,400 Cr fraud. 12 simultaneous raids. "The tumour has been named."', words_target:3000, status:'not_started', started_date:null, completed_date:null, notes:'', word_count_actual:0 },
  { _id:'CH_16', act:'act2', num:16, title:'Chanakya\'s Theory', sub:'PILs, op-eds, documentaries. Sarcastic compliance. 45-minute YouTube video.', words_target:2500, status:'not_started', started_date:null, completed_date:null, notes:'', word_count_actual:0 },
  { _id:'CH_17', act:'act2', num:17, title:'Confrontation', sub:'The Architect. No cameras. "I am still a doctor. Different patient."', words_target:2500, status:'not_started', started_date:null, completed_date:null, notes:'', word_count_actual:0 },
  // Act III
  { _id:'CH_18', act:'act3', num:18, title:'Jyestha\'s House', sub:'An old teacher. Tea. "I cannot promise a better government. I can promise the truth."', words_target:2500, status:'not_started', started_date:null, completed_date:null, notes:'', word_count_actual:0 },
  { _id:'CH_19', act:'act3', num:19, title:'No Tech Crime', sub:'Rs. 340 Cr stolen through welfare portal. Kavitha, 26. Technology upgrades corruption.', words_target:2500, status:'not_started', started_date:null, completed_date:null, notes:'', word_count_actual:0 },
  { _id:'CH_20', act:'act3', num:20, title:'Family Dinner', sub:'Slightly sour sambhar. "I never doubted you. But I am also relieved it\'s almost over."', words_target:2000, status:'not_started', started_date:null, completed_date:null, notes:'', word_count_actual:0 },
  { _id:'CH_21', act:'act3', num:21, title:'Kodagu Pitch Deck', sub:'47-page development plan. 30,000 acres. "The most elegant corruption he has seen."', words_target:2500, status:'not_started', started_date:null, completed_date:null, notes:'', word_count_actual:0 },
  { _id:'CH_22', act:'act3', num:22, title:'Counter Attack', sub:'120-page legacy report. "You can restore the old system. You cannot unring the bell."', words_target:2500, status:'not_started', started_date:null, completed_date:null, notes:'', word_count_actual:0 },
  { _id:'CH_23', act:'act3', num:23, title:'The Unsolved Case', sub:'Prabhakar, 34. Filed sealed. The file goes to three addresses. No cover letter.', words_target:2500, status:'not_started', started_date:null, completed_date:null, notes:'', word_count_actual:0 },
  { _id:'CH_24', act:'act3', num:24, title:'Reset in Democracy', sub:'6 AM departure. Chai in Cubbon Park. "Not a hero. A demonstration."', words_target:3000, status:'not_started', started_date:null, completed_date:null, notes:'', word_count_actual:0 },
  { _id:'CH_EP', act:'act3', num:25, title:'Epilogue — What the Patient Does Next', sub:"Kavitha's RTI. Prabhakar's case surfaces. Jyestha's students eat warm food twice a week.", words_target:2000, status:'not_started', started_date:null, completed_date:null, notes:'', word_count_actual:0 }
];

const PLAN_MILESTONES = [
  { _id:'MS_01', day:7,  title:'Week 1 Research Complete', desc:'Character Bible, World Bible, Beat Sheets locked', phase:'phase1', status:'upcoming', completed_date:null, notes:'' },
  { _id:'MS_02', day:21, title:'Act I — First 4 Chapters Drafted', desc:'Chapters 1–4 in first draft (~10,000 words)', phase:'phase1', status:'upcoming', completed_date:null, notes:'' },
  { _id:'MS_03', day:30, title:'Act I COMPLETE', desc:'All 8 chapters drafted (~24,000 words)', phase:'phase1', status:'upcoming', completed_date:null, notes:'' },
  { _id:'MS_04', day:44, title:'Act II COMPLETE', desc:'Chapters 9–17 drafted (~27,000 words)', phase:'phase2', status:'upcoming', completed_date:null, notes:'' },
  { _id:'MS_05', day:52, title:'Act III First Half + Superstar Emails', desc:'Chapters 18–21 drafted + first 2 superstar emails sent', phase:'phase2', status:'upcoming', completed_date:null, notes:'' },
  { _id:'MS_06', day:60, title:'🎉 FIRST DRAFT COMPLETE', desc:'All 24 chapters + Epilogue (~72,000 words)', phase:'phase2', status:'upcoming', completed_date:null, notes:'', is_key:true },
  { _id:'MS_07', day:68, title:'Self-Edit Pass + Crowdfunding Live', desc:'Full manuscript self-edited. Crowdfunding campaign launched.', phase:'phase3', status:'upcoming', completed_date:null, notes:'' },
  { _id:'MS_08', day:76, title:'All 5 Superstar Approaches Sent', desc:'Beta reader feedback received', phase:'phase3', status:'upcoming', completed_date:null, notes:'' },
  { _id:'MS_09', day:90, title:'🏁 Query-Ready Manuscript', desc:'Submission-ready manuscript + $10K funding pipeline locked', phase:'phase3', status:'upcoming', completed_date:null, notes:'', is_key:true }
];

const PLAN_FUNDING = [
  { _id:'FND_01', name:'Crowdfunding (Wishberry/Milaap)', icon:'🌐', target_usd:2500, raised_usd:0, status:'not_started', activate_day:61, pitch_angle:'Fund the first fictional novel about India\'s constitutional democracy crisis. 50,000 copies across Karnataka.', notes:'' },
  { _id:'FND_02', name:'Sunday Cinemas Film Advance', icon:'🎬', target_usd:2000, raised_usd:0, status:'agreement_exists', activate_day:60, pitch_angle:'First draft delivered on time. Activate the writing fee under the existing agreement.', notes:'24-month option agreement from Feb 2026 already secured.' },
  { _id:'FND_03', name:'Distribution Sponsorship (Political/Cultural orgs)', icon:'🏛️', target_usd:2500, raised_usd:0, status:'not_started', activate_day:45, pitch_angle:'Sponsor distribution of 10,000 copies across Karnataka university libraries. Policy communication, not a book sale.', notes:'ONOE angle — frame as funding a policy idea.' },
  { _id:'FND_04', name:'Literary Grants (IFA, Sahitya Akademi)', icon:'🎓', target_usd:1500, raised_usd:0, status:'not_started', activate_day:30, pitch_angle:'Political fiction addressing constitutional democracy. First novel to fictionalise President\'s Rule as a governance experiment.', notes:'' },
  { _id:'FND_05', name:'Speaking / Literary Events', icon:'🎤', target_usd:1500, raised_usd:0, status:'not_started', activate_day:75, pitch_angle:'The novelist who researched India\'s real democratic crisis. Fiction that explains what journalism cannot.', notes:'' }
];

const PLAN_META = {
  _id: 'meta',
  start_date: '2026-05-20',
  target_date: '2026-09-30',
  total_days: 133,
  title: "The President's Rule — 90-Day Command Centre",
  author: 'Vishwa Shambhulingappa',
  words_total_target: 72000,
  notes: 'Target: Complete manuscript by end of September 2026. Sunday Cinemas option active till Feb 2028.',
  investor_returns: {
    publishing_advance_low: 3000,
    publishing_advance_high: 8000,
    film_option_value: 50000,
    film_production_royalty_pct: 2.5,
    film_budget_mid: 2500000,
    ott_rights_low: 20000,
    ott_rights_high: 100000,
    royalties_5yr_low: 10000,
    royalties_5yr_high: 50000,
    translation_rights: 5000,
    total_low: 88000,
    total_high: 213000,
    notes: 'Projections based on comparable Indian political fiction. Film production royalty calculated on $2.5M budget at 2.5% author rate.'
  }
};

function seedPlanIfNeeded() {
  planDb.findOne({ _id: 'meta' }, (err, doc) => {
    if (doc) return;
    planDb.insert(PLAN_META);
    planDb.insert(PLAN_CHAPTERS);
    planDb.insert(PLAN_MILESTONES);
    planDb.insert(PLAN_FUNDING);
  });
}
seedPlanIfNeeded();

seedAll();

module.exports = { pitchesDb, filmAgreementDb, tasksDb, planDb, activityDb, journalDb, commentsDb };
