import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-vision-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './vision-landing.component.html',
  styleUrl: './vision-landing.component.scss'
})
export class VisionLandingComponent {

  novelStats = [
    { num: '25', label: 'Chapters' },
    { num: '72K', label: 'Words' },
    { num: '3', label: 'Acts' },
    { num: '78/100', label: 'Craft Score' },
  ];

  revenueModel = [
    { stage: 'Phase 1', label: '1,000 Founding Readers', amount: '₹10L', detail: '₹1,000 per founding reader funds the novel infrastructure, website & community. Direct from the author\'s circle.' },
    { stage: 'Phase 2', label: 'Book Presale + OTT Rights', amount: '₹1–5Cr', detail: 'First edition presale + OTT streaming rights negotiation once manuscript is complete. JCB / Crossword award circuit elevates valuation.' },
    { stage: 'Phase 3', label: 'Feature Film Production', amount: '₹5–15Cr', detail: 'Principal photography with A-list Kannada/national cast. Co-production model with Sunday Cinemas\' existing studio relationships.' },
    { stage: 'Phase 4', label: 'Theatrical + OTT Release', amount: '₹100–1000Cr', detail: 'Pan-India theatrical + Netflix/Prime OTT. Political dramas with credible scripts routinely cross ₹100–500Cr. Target: ₹1,000Cr with right cast and distribution.' },
  ];

  journey = [
    {
      phase: '01',
      icon: 'create',
      title: 'Writer\'s Total Creative Freedom',
      body: 'Vishwa Shambhulingappa writes with zero studio interference. No compromise, no committee notes. Every character, every political confrontation, every scene belongs to the writer. This is literature first — which is exactly what makes it filmmaker-proof.'
    },
    {
      phase: '02',
      icon: 'auto_stories',
      title: 'The Novel IS the Pre-Production',
      body: 'A finished novel with 72,000 words, 25 chapters, 9 fully psychologised characters, and 12 primary themes contains more production value than any treatment document. It eliminates the back-and-forth that kills most Indian film projects before they start.'
    },
    {
      phase: '03',
      icon: 'verified_user',
      title: '1,000 Founding Readers Build the Base',
      body: 'Before a single pitch is made, 1,000 readers from the author\'s immediate circle invest ₹1,000 each. This ₹10 Lakh funds the website, community infrastructure, and manuscript completion — and proves audience demand before a producer\'s meeting ever happens.'
    },
    {
      phase: '04',
      icon: 'movie',
      title: 'Sunday Cinemas Acquires the Film Option',
      body: 'Ramenahalli Jagannatha — producer of two Kannada films, director of Hondisi Bareyiri, Teerataroopa Tandeyavarge, and Tamma Sukhagamana Bayasuva — has adopted "The President\'s Rule" and will direct it himself. He is personally mentoring Vishwa Shambhulingappa through the entire writing process, guiding the research team, and will bring in experienced screenplay writers to adapt the novel into film language — ensuring the story scales to a commercial box-office hit without losing its literary soul.'
    },
    {
      phase: '05',
      icon: 'groups',
      title: 'Community Determines the Climax',
      body: 'The novel\'s series of incidents is rooted in documented real-world events. The founding 1,000 readers participate in a structured conversation about the story\'s resolution — keeping the creative integrity intact while building the most engaged pre-release audience in modern Indian cinema.'
    },
    {
      phase: '06',
      icon: 'theater_comedy',
      title: 'Cast-Ready, Director-Ready Manuscript',
      body: 'Ramenahalli Jagannatha directs. The screenplay team adapts. The novel — complete, precise, cinematic — is the master document that keeps every creative decision honest. No rewrites from scratch. No development hell. From the writer\'s table to the director\'s table in a straight line.'
    },
    {
      phase: '07',
      icon: 'rocket_launch',
      title: 'Pan-India Release · ₹1,000Cr Target',
      body: 'Political dramas with integrity — Gangubai Kathiawadi, The Kerala Story, Sarkar, Raazi — prove the commercial ceiling for content-driven Indian cinema. "The President\'s Rule" targets pan-India theatrical + OTT with a story that speaks directly to every Indian who has watched democracy be tested.'
    },
  ];

  themes = [
    { icon: 'healing', title: 'Integrity as a Tactic', body: 'Not a virtue — a weapon. Sampath Kumar treats democracy the way he treats a malignant tumour: diagnose precisely, cut without sentiment, document everything.' },
    { icon: 'balance', title: 'Corruption Arrives as Friendship', body: 'The novel\'s most chilling insight: the Rs. 500Cr bribe arrives as reasonable advice. The Rs. 36,000Cr shadow economy is managed by people who are personally kind. This is how systems survive.' },
    { icon: 'local_hospital', title: 'The Patient is Democracy', body: 'Karnataka under President\'s Rule is not a setting — it is a patient on a table. The question is not whether the patient survives. The question is whether the doctor can leave the theatre without blood on his hands.' },
    { icon: 'visibility', title: 'Documentation is the Strongest Sword', body: 'Every honest administrator leaves behind files. Every file is a seed. Sampath\'s greatest weapon is not authority — it is the discipline to name what he sees, in writing, without euphemism.' },
    { icon: 'people', title: 'Youth of India are the Audience', body: 'This story is told for the generation that watches democracy bend and wonders if it has to. The answer is no. But it requires the kind of proof only a story can give.' },
  ];

  pillars = [
    { icon: 'shield', label: 'Author Rights Fully Protected', detail: 'Print rights, sequel rights, and all prose rights remain permanently with Vishwa Shambhulingappa. Sunday Cinemas holds only the 24-month film option with a hard auto-revert clause. The writer owns the work.' },
    { icon: 'currency_rupee', label: '₹1,000 per Founding Reader', detail: '₹10 Lakhs from 1,000 founding readers funds the infrastructure. No investor dilution, no platform fees, no intermediaries. Every rupee goes to the manuscript and community.' },
    { icon: 'verified', label: 'Novel-First Methodology', detail: 'No pitch decks, no half-baked treatments. Sunday Cinemas\' model: finish the novel to the highest possible literary standard first. A complete, award-calibre manuscript commands terms that screenplays never can.' },
    { icon: 'movie_creation', label: 'AI-Enabled Production Pipeline', detail: 'Modern AI tools (Kling, Runway Gen-3, Midjourney, ElevenLabs) make a proof-of-concept animated short possible at ₹10L — validating the visual language before a full production budget is committed.' },
  ];

  comparables = [
    { title: 'The White Tiger', detail: 'Booker Prize → Netflix global. Single-protagonist political-moral trajectory. Proof: literary awards accelerate OTT acquisition.', flag: '🏆' },
    { title: 'Gangubai Kathiawadi', detail: '₹209Cr box office. Book-first source material, strong female-led political narrative. Bhansali template for literary adaptation at scale.', flag: '🎬' },
    { title: 'The Kerala Story', detail: '₹290Cr box office. Politically charged content-driven cinema with limited star cast and strong word-of-mouth. Closest genre comparison.', flag: '📽️' },
    { title: 'Sarkar (Tamil)', detail: '₹250Cr+ gross. Political drama with superstar. The upper ceiling when "The President\'s Rule" has its A-list cast moment.', flag: '⭐' },
    { title: 'Wolf Hall (BBC)', detail: 'Proof that administrative-procedural political drama with a morally complex protagonist is premium global content. OTT blueprint.', flag: '📺' },
    { title: 'All the King\'s Men', detail: 'The literary ancestor — Pulitzer Prize, three film adaptations. Sampath Kumar is its photographic negative: the man who refuses what Stark embraces.', flag: '📚' },
  ];

  founderReturns = [
    {
      tier: 'Immediate',
      icon: 'auto_stories',
      title: 'The Founding Copy — Numbered & Signed',
      value: '₹800 market value',
      body: 'First-edition physical book, author-signed, hand-numbered 1–1,000. Not a print-run copy — a founding artefact. When the film releases, copy #1 to #1,000 become collector\'s editions. The White Tiger first editions sold for 12× cover price after the Booker.'
    },
    {
      tier: 'Immediate',
      icon: 'movie_filter',
      title: 'The Full AI Storyboard — Director\'s Cut Access',
      value: 'Not publicly available',
      body: 'All 6 key scenes visually directed by AI, with camera angles, color palettes, mood direction, and Ramenahalli\'s director notes. This is the production document. Founding readers see it before any studio does. Film enthusiasts get the closest thing to sitting in the pre-production room.'
    },
    {
      tier: 'During Writing',
      icon: 'edit_note',
      title: 'Chapter-by-Chapter Live Access',
      value: 'Real manuscript, not extracts',
      body: 'Read every chapter as Vishwa completes it — including the research notes, the scenes that get cut, and the reasons. You are not reading a polished preview. You are reading the novel being made. No other reader in India will have had this access before publication.'
    },
    {
      tier: 'During Writing',
      icon: 'how_to_vote',
      title: 'Vote on the Climax — Your Voice in the Story',
      value: 'Unique creative stake',
      body: 'The series of incidents are factually grounded. The resolution is still open. Founding readers participate in a structured conversation — with the writer and the director — about how this story ends. This is not a survey. Your read of what democracy requires is genuinely part of the creative process.'
    },
    {
      tier: 'Production Phase',
      icon: 'clapperboard',
      title: 'On-Set Access Pass — One Day, Real Production',
      value: '₹50,000+ equivalent',
      body: 'One founding reader per week, drawn by lot, gets an on-set observer pass for a day of principal photography. Watch Ramenahalli direct. Watch the novel become a film. This is the film-making education that no school offers and no money normally buys.'
    },
    {
      tier: 'Production Phase',
      icon: 'mic',
      title: 'Screenplay Reading Session — With the Director',
      value: 'Industry-closed event',
      body: 'All 1,000 founding readers are invited to a virtual table-read of the adapted screenplay — with Ramenahalli Jagannatha walking through the adaptation choices: what changed from the novel, what was kept, and why. A masterclass in film language, conducted by the director himself.'
    },
    {
      tier: 'At Release',
      icon: 'local_movies',
      title: 'Premiere Invitation — First Screening, Founding Audience',
      value: 'By invitation only',
      body: 'The 1,000 founding readers are the first audience to see the completed film — at the official premiere. You are not a guest. You are credited as a founding audience member in the opening scroll. The director thanks you by name in the programme. You were there before everyone else.'
    },
    {
      tier: 'At Release',
      icon: 'workspace_premium',
      title: 'Permanent Credit — Film, Novel, and Digital',
      value: 'Lasting recognition',
      body: 'Your name in the published novel\'s acknowledgements. Your name in the film\'s end credits under "Founding Audience." Your name on this website permanently. In 10 years, when someone asks how this film got made — your name is part of the documented answer.'
    },
  ];

  milestones = [
    { date: 'Month 1–2', status: 'active', label: '1,000 Founding Readers', detail: 'Build the founding community from the author\'s immediate circle. Launch the website, publish Chapter 1 preview, open presale.' },
    { date: 'Month 3–4', status: 'upcoming', label: 'Manuscript Completion', detail: 'Complete all 25 chapters. Integrate the "old court case" flashback (Act I) and two additional Priyadarshini scenes. Submit to beta readers.' },
    { date: 'Month 5', status: 'upcoming', label: 'Literary Award Circuit', detail: 'Submit to JCB Prize for Literature, Crossword Book Award, Sahitya Akademi (English). Award longlisting dramatically increases OTT and film rights value.' },
    { date: 'Month 6', status: 'upcoming', label: 'Publisher Pitches', detail: 'Approach HarperCollins India, Penguin Random House India, Westland with complete manuscript + 1,000 pre-committed readers as proof of audience.' },
    { date: 'Q3 2026', status: 'upcoming', label: 'Screenplay Adaptation', detail: 'Ramenahalli Jagannatha leads the screenplay team in adapting the completed novel into film language — retaining the political authenticity while structuring for commercial box-office scale.' },
    { date: '2027', status: 'upcoming', label: 'Principal Photography', detail: 'Ramenahalli Jagannatha directs. Cast announced, co-production structured. Target: pan-India theatrical + OTT dual window. ₹1,000Cr ceiling validated by comparable political dramas.' },
  ];
}
