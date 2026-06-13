import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface Criterion {
  no: number;
  regulation: string;          // 8 CFR 204.5(h)(3)(x) shorthand
  title: string;
  icon: string;
  strength: 'strong' | 'building' | 'planned';
  field: 'creative' | 'software' | 'both';
  evidence: string[];
  gap?: string;                // honest note on what still needs to be built
}

@Component({
  selector: 'app-eb1a-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './eb1a-profile.component.html',
  styleUrl: './eb1a-profile.component.scss'
})
export class Eb1aProfileComponent {

  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  profile = {
    name: 'Vishwa Shambhulingappa',
    legalName: 'Shambhulingappa',
    penName: 'Vishwa',
    field: 'Creative Writing & Software Architecture — a dual field of extraordinary ability',
    tagline:
      'Twenty years of screenwriting and original storytelling, fifteen years architecting enterprise software for global institutions — converging on a single body of work: turning original Indian political fiction into Pan-India cinema through an AI-enabled novel-to-screen pipeline.',
    swa: 'Screenwriters Association of India — Member No. 46108',
    linkedin: 'https://www.linkedin.com/in/vishwa-shambhulingappa-233a0594',
    education: 'B.E., Electronics & Communication — VTU, Karnataka (2010)',
  };

  // ── The two careers, presented as one converging arc ──
  pillars = [
    {
      icon: 'auto_stories',
      kicker: '20 Years',
      title: 'Original Storytelling & Screenwriting',
      body: 'Two decades of sustained creative work culminating in the novel *The President\'s Rule*, optioned for film by Sunday Cinemas. Member of the Screenwriters Association of India. Two Kannada feature films and an original novel-to-cinema methodology now backed to execute autonomously.',
    },
    {
      icon: 'architecture',
      kicker: '15 Years',
      title: 'Enterprise Software Architecture',
      body: 'Senior / Principal engineer across Mindtree, American Express GBT, Dell, and Fidelity Investments. Architected distributed, performance-critical systems used by global financial institutions; led and mentored engineering squads across India and the United States.',
    },
    {
      icon: 'merge',
      kicker: 'The Synthesis',
      title: 'The Novel-to-Cinema AI Pipeline',
      body: 'The rare convergence: an engineer who builds the AI-enabled production pipeline (storyboard generation, manuscript intelligence, community review loop) AND the writer who authors the literary source. One person spanning the full stack from prose to screen.',
    },
  ];

  // ── The 8 USCIS EB1A criteria, mapped honestly across both careers ──
  criteria: Criterion[] = [
    {
      no: 1,
      regulation: '8 CFR 204.5(h)(3)(i)',
      title: 'Nationally or Internationally Recognized Awards',
      icon: 'emoji_events',
      strength: 'building',
      field: 'both',
      evidence: [
        'Film rights to debut novel The President\'s Rule optioned by Sunday Cinemas (Feb 2026, 24-month) — a competitive, recognition-based selection by an established production house.',
        'Two Kannada feature film credits — Iruvudellava Bittu and Hondisi Bareyiri — placing the work within a recognised national film tradition.',
      ],
      gap: 'Strengthen with a JCB Prize / Crossword / Sahitya Akademi longlisting once the manuscript is complete, and document any engineering awards (Fidelity / Dell internal recognition, hackathons, patents).',
    },
    {
      no: 2,
      regulation: '8 CFR 204.5(h)(3)(ii)',
      title: 'Membership in Associations Requiring Outstanding Achievement',
      icon: 'badge',
      strength: 'strong',
      field: 'creative',
      evidence: [
        'Member, Screenwriters Association of India (No. 46108) — a professional body for working screenwriters.',
        'Backed by Sunday Cinemas and personally mentored by Ramenahalli Jagannatha (producer-director of multiple Kannada features) — selective creative association.',
      ],
      gap: 'Document SWA membership eligibility requirements to show the bar for admission reflects outstanding achievement, per USCIS expectations.',
    },
    {
      no: 3,
      regulation: '8 CFR 204.5(h)(3)(iii)',
      title: 'Published Material About the Applicant in Professional / Major Media',
      icon: 'newspaper',
      strength: 'planned',
      field: 'both',
      evidence: [
        'Public-facing author platform: the writer\'s journal, vision pages, and the documented "5 Engineerings" creative journey on this site.',
        'Substack chapter releases and founding-reader community building a press-ready public record.',
      ],
      gap: 'Secure independent coverage — film-trade press on the Sunday Cinemas option, literary press on the novel, tech press on the AI pipeline. This is the criterion most in need of third-party media.',
    },
    {
      no: 4,
      regulation: '8 CFR 204.5(h)(3)(iv)',
      title: 'Judging the Work of Others',
      icon: 'gavel',
      strength: 'building',
      field: 'software',
      evidence: [
        'Played a mini-architect role at Fidelity — leading a squad, reviewing engineers\' code, and setting best practices for security, quality, and reusable solutions.',
        'Led and mentored engineering teams at Dell, High Media, Mindtree and Amex GBT — formally evaluating others\' technical work.',
        'Leads the founding-reader review loop and research team for the novel — evaluating contributions to the creative work.',
      ],
      gap: 'Convert into formal evidence: invitations to review conference papers / open-source PRs, or a documented role as a judge for a writing competition or hackathon.',
    },
    {
      no: 5,
      regulation: '8 CFR 204.5(h)(3)(v)',
      title: 'Original Contributions of Major Significance',
      icon: 'lightbulb',
      strength: 'strong',
      field: 'both',
      evidence: [
        'Software: built reusable libraries to integrate legacy WPF/.NET modules into the Interop/OpsWorx (Glue42) container at Fidelity — a "lift-and-shift" architecture reusable across any C#/.NET application.',
        'Software: authored a tool to convert .NET applications to multi-targeting at Dell, enabling a single monorepo across all .NET versions — multiplying engineering-team productivity for a framework used by 90% of Dell client apps.',
        'Software: developed a B2B FMCG barter system from scratch (High Media / Aass Pass) solving retailer-consumer offer-sharing with live bargaining.',
        'Creative: an original novel-first, community-reviewed, AI-storyboarded methodology for taking literary fiction to Pan-India cinema — a distinctive contribution to how Indian films are developed.',
      ],
      gap: 'Tie each contribution to impact letters from senior architects / producers attesting to significance beyond the immediate employer.',
    },
    {
      no: 6,
      regulation: '8 CFR 204.5(h)(3)(vi)',
      title: 'Authorship of Scholarly / Professional Articles',
      icon: 'article',
      strength: 'building',
      field: 'creative',
      evidence: [
        'Body of original long-form writing: the novel The President\'s Rule and a sustained public essay series (writer\'s journal, the 5-Engineerings journey).',
        'Documented research strands underpinning the novel — Kautilya\'s Dandaneeti, media-trial architecture, federalism beneath One Nation One Election.',
      ],
      gap: 'For EB1A this criterion favours scholarly/professional publications — pursue a published book (HarperCollins / Penguin / Westland), bylined essays, or a technical article/whitepaper to satisfy it cleanly.',
    },
    {
      no: 7,
      regulation: '8 CFR 204.5(h)(3)(vii)',
      title: 'Display of Work at Artistic Exhibitions or Showcases',
      icon: 'theaters',
      strength: 'building',
      field: 'creative',
      evidence: [
        'Two Kannada feature films exhibited theatrically — Iruvudellava Bittu and Hondisi Bareyiri.',
        'The AI storyboard / proof-of-concept animated showcase and the public novel-in-progress as a continuously displayed body of creative work.',
      ],
      gap: 'Document theatrical exhibition records / screening certificates for the films, and any festival showings, to formalise this criterion.',
    },
    {
      no: 8,
      regulation: '8 CFR 204.5(h)(3)(viii)',
      title: 'Leading or Critical Role for Distinguished Organizations',
      icon: 'workspace_premium',
      strength: 'strong',
      field: 'both',
      evidence: [
        'Senior Full-Stack Engineer / mini-architect at Fidelity Investments — leading a squad on the myWS–OpsWorx integration.',
        'Principal Software Engineer at Dell on the Dell Client Framework — a platform used by 90% of client apps on Dell machines.',
        'Co-Founder & Tech Lead, High Media (Aass Pass FMCG startup).',
        'Module Lead / Senior Engineer on revenue-generating systems at American Express Global Business Travel via Mindtree.',
        'The creative lead and author backed by Sunday Cinemas to autonomously execute the novel and its film.',
      ],
      gap: 'Strongest criterion — secure letters from Fidelity / Dell leadership and Sunday Cinemas confirming the leading/critical nature of the role.',
    },
  ];

  // ── High remuneration is a 9th supporting line (criterion ix) ──
  remuneration = {
    icon: 'payments',
    title: 'High Salary / Remuneration (8 CFR 204.5(h)(3)(ix))',
    body: 'Fifteen-year progression to Senior Full-Stack Engineer at Fidelity Investments and Principal Software Engineer at Dell — roles commanding remuneration in the upper bands for the U.S./India enterprise-software market. Document with pay records and Bureau of Labor Statistics wage-level comparisons.',
    strength: 'building' as const,
  };

  // ── Career timeline blending both tracks ──
  timeline = [
    { year: '2006–2010', track: 'creative', label: 'Origins of the Storyteller', detail: 'Began writing original stories as a teenager; trained as an engineer at VTU while building the writing habit that would define the next two decades.' },
    { year: '2010–2014', track: 'software', label: 'Mindtree · Amex Travel Expert', detail: 'Software Engineer → Senior Engineer on American Express Gateway Travel Expert. WPF, PRISM/Unity, MVVM, WCF duplex channels. Migrated CAB to Microsoft Prism.' },
    { year: '2014–2018', track: 'software', label: 'Mindtree · GTT / CSE (Amex GBT)', detail: 'Module Lead on revenue-generating corporate-travel systems. Modernised ASP.NET Classic → ASP.NET Core + Angular; led full .NET and server migrations.' },
    { year: '2017–2019', track: 'creative', label: 'Two Kannada Feature Films', detail: 'Returned to India to pursue filmmaking; worked on Iruvudellava Bittu and Hondisi Bareyiri — learning the decade-long patience cinema demands.' },
    { year: '2018–2020', track: 'software', label: 'High Media · Aass Pass (Co-Founder)', detail: 'Co-Founder & Tech Lead of an FMCG startup. Built a B2B barter system and live-bargaining features from scratch on Angular + microservices.' },
    { year: '2020–2022', track: 'software', label: 'Value Soft · Mobiveil · Dell', detail: 'Senior .NET → Project Lead → Principal Software Engineer. AI chatbot adapters, Nordson dispensing software, and the Dell Client Framework used by 90% of Dell client apps.' },
    { year: '2023–Now', track: 'software', label: 'Fidelity Investments · Senior Full-Stack Engineer', detail: 'Mini-architect on myWS–OpsWorx (Glue42) integration. Built reusable interop libraries, Java Spring Boot domain APIs on Aerospike, and AWS infrastructure via Terraform.' },
    { year: '2022–2026', track: 'creative', label: 'The President\'s Rule', detail: 'Authored the debut political novel; six documented research strands. Film rights optioned by Sunday Cinemas (Feb 2026, 24-month), with Ramenahalli Jagannatha to direct.' },
    { year: '2026–2030', track: 'creative', label: 'The 5th Engineering — Backed to Execute', detail: 'Sunday Cinemas backs Vishwa to execute autonomously: a tribe of writers producing gold-standard novels at scale, and an AI-enabled novel-to-cinema pipeline targeting Pan-India release.' },
  ];

  // ── Headline software contributions (for the criterion-5 / criterion-8 detail strip) ──
  techHighlights = [
    { icon: 'account_balance', org: 'Fidelity Investments', role: 'Senior Full-Stack Engineer', detail: 'myWS ↔ OpsWorx (Glue42) interop; reusable lift-and-shift libraries; Spring Boot domain APIs on Aerospike for AIML model outputs; AWS SQS + Terraform IaC.' },
    { icon: 'devices', org: 'Dell Inc.', role: 'Principal Software Engineer', detail: 'Dell Client Framework (used by 90% of Dell client apps); Stream JSON-RPC POCs; .NET multi-targeting tool enabling a single monorepo across all .NET versions.' },
    { icon: 'precision_manufacturing', org: 'Nordson ASYMTEK (via Mobiveil)', role: 'Project Lead', detail: 'Cloud Canvas dispensing software — Web APIs driving stateless control of multiple lab dispensing machines; integrated lookup-camera hardware to UI.' },
    { icon: 'storefront', org: 'High Media — Aass Pass', role: 'Co-Founder & Tech Lead', detail: 'FMCG barter marketplace from scratch; live consumer bargaining; Angular + lightweight microservices.' },
    { icon: 'flight', org: 'American Express GBT (via Mindtree)', role: 'Module / Senior Engineer', detail: 'Global Ticket Trax & Central Solution Exchanges — revenue-generating corporate-travel systems; ASP.NET Core + Angular modernisation; SSIS ETL.' },
  ];

  creativeHighlights = [
    { icon: 'menu_book', title: 'The President\'s Rule', detail: 'Debut literary political novel set in Karnataka; six research strands from Kautilya to One Nation One Election. Film rights optioned by Sunday Cinemas.' },
    { icon: 'movie', title: 'Two Kannada Feature Films', detail: 'Iruvudellava Bittu and Hondisi Bareyiri — theatrical credits placing the work within a recognised national film tradition.' },
    { icon: 'groups', title: 'Founding-Reader Review Loop', detail: 'An original democratic review methodology: 1,000 readers pressure-test each chapter; AI consolidates the signal into a single honest direction.' },
    { icon: 'movie_filter', title: 'AI Storyboard Pipeline', detail: 'Novel-to-screen proof-of-concept using modern generative tools — the engineer and the writer in one person.' },
  ];

  strengthLabel: Record<string, string> = {
    strong: 'Strong evidence',
    building: 'Evidence building',
    planned: 'Needs development',
  };
}
