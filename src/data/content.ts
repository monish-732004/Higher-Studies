// All site content lives here. Text supports light markup: **bold** and *italic*.

export type CountryCode = 'US' | 'CA' | 'DE' | 'GB' | 'SG' | 'NL' | 'IE'
export type Tier = 'dream' | 'highReach' | 'range' | 'target' | 'safety' | 'warning'
export type Medal = 'gold' | 'silver' | 'bronze'

export interface Country {
  code: CountryCode
  name: string
  flag: string
  lat: number
  lon: number
}

export const countries: Country[] = [
  { code: 'US', name: 'USA', flag: '🇺🇸', lat: 39, lon: -98 },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', lat: 56, lon: -106 },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', lat: 51, lon: 10 },
  { code: 'GB', name: 'UK', flag: '🇬🇧', lat: 54, lon: -2 },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', lat: 1.35, lon: 103.8 },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', lat: 52.1, lon: 5.3 },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', lat: 53.4, lon: -8 },
]

export const india = { lat: 21, lon: 78 }

export const flagOf = (code: CountryCode) => countries.find((c) => c.code === code)!.flag

// ───────────────────────── 5.0 Hero ─────────────────────────
export const hero = {
  title: 'MS Abroad Roadmap – Fall 2028',
  subtitle: 'CS / Cloud Computing / AI Infrastructure',
  profile: [
    'B.Tech CS (Cloud Computing) – SRMIST | CGPA 9.36 / 10',
    'BS Data Science – IIT Madras',
    'Target: MS CS / Cloud / AI Infra – Fall 2028',
  ],
}

// ───────────────────── 5.1 Documents & Tests ─────────────────────
export const documents = {
  commonTitle: '✅ Needed for every college',
  common: [
    { icon: 'transcript', text: 'Transcripts – SRM + IIT Madras' },
    { icon: 'certificate', text: 'Degree certificate (provisional if applying before graduating)' },
    { icon: 'cv', text: 'Resume / CV' },
    { icon: 'passport', text: 'Passport copy' },
    { icon: 'score', text: 'IELTS or TOEFL score' },
  ] as const,
  countries: [
    {
      code: 'US',
      colleges: 'Stanford, CMU, UC Berkeley, UIUC, Georgia Tech, UCSD, Northeastern, UMass, ASU',
      requirements: [
        'SOP (+ extra essays at some, e.g. CMU)',
        '3 LORs',
        'IELTS 7.0+ / TOEFL 100+',
        'GRE – optional at most, check each program',
        'Bank / loan documents – after admit, for I-20',
      ],
    },
    {
      code: 'CA',
      colleges: 'Toronto, UBC, Waterloo, McGill, Alberta',
      requirements: [
        'Statement of Interest',
        '2–3 LORs (mainly professors)',
        'IELTS 6.5–7.0',
        'No GRE',
        'Name professors you want to work with (research-based programs)',
      ],
    },
    {
      code: 'DE',
      colleges: 'TU Munich, RWTH Aachen, KIT, TU Berlin, LMU',
      requirements: [
        'Motivation Letter',
        'APS Certificate ⚠️ (mandatory for Indians, apply early)',
        'IELTS 6.5+',
        'LOR – often not required',
        'No GRE',
        'Some ask for a short essay or course descriptions',
      ],
    },
    {
      code: 'GB',
      colleges: 'Oxford, Cambridge, Imperial, UCL, Edinburgh',
      requirements: ['Personal Statement', '2 LORs (3 for Oxford/Cambridge)', 'IELTS 6.5–7.5', 'No GRE'],
    },
    {
      code: 'SG',
      colleges: 'NUS, NTU, SMU, SUTD, SIT',
      requirements: ['SOP', '2 LORs', 'IELTS 6.5+ / TOEFL 90+', 'GRE – recommended for NUS/NTU'],
    },
    {
      code: 'NL',
      colleges: 'TU Delft, Amsterdam, Eindhoven, Leiden, Utrecht',
      requirements: ['Motivation Letter', '2 LORs', 'IELTS 6.5+', 'No GRE', 'Course descriptions sometimes asked'],
    },
    {
      code: 'IE',
      colleges: 'TCD, UCD, UCC, Galway, DCU',
      requirements: ['SOP', '2 LORs', 'IELTS 6.5', 'No GRE'],
    },
  ] as { code: CountryCode; colleges: string; requirements: string[] }[],
  keyPoints: [
    '💡 One IELTS score (7.0+) covers almost every college',
    '💡 GRE only matters for USA + Singapore',
    '⚠️ Requirements change every year – confirm on each program page before applying',
  ],
}

// ───────────────────── 5.2 College Ranking ─────────────────────
export interface RankedCollege {
  name: string
  country: CountryCode
  warn?: boolean
}

const c = (name: string, country: CountryCode, warn = false): RankedCollege => ({ name, country, warn })

export const ranking = {
  intro: 'Top 5 per country, ranked; same number = same level',
  levels: [
    [c('Stanford', 'US'), c('CMU', 'US'), c('MIT', 'US', true)],
    [c('Oxford', 'GB'), c('Cambridge', 'GB'), c('UC Berkeley', 'US')],
    [c('University of Toronto', 'CA')],
    [c('NUS', 'SG'), c('Imperial College', 'GB')],
    [c('UIUC', 'US'), c('University of Waterloo', 'CA')],
    [c('UBC', 'CA'), c('NTU', 'SG')],
    [c('TU Munich', 'DE'), c('TU Delft', 'NL'), c('UCL', 'GB')],
    [c('RWTH Aachen', 'DE'), c('Edinburgh', 'GB'), c('McGill', 'CA')],
    [c('University of Amsterdam', 'NL'), c('KIT Karlsruhe', 'DE', true), c('LMU Munich', 'DE', true)],
    [c('TU Eindhoven', 'NL'), c('TU Berlin', 'DE', true), c('Leiden', 'NL')],
    [c('Trinity College Dublin', 'IE'), c('University of Alberta', 'CA'), c('Utrecht', 'NL'), c('SMU', 'SG')],
    [c('UCD', 'IE'), c('SUTD', 'SG')],
    [c('UCC', 'IE'), c('Galway', 'IE'), c('DCU', 'IE'), c('SIT', 'SG')],
  ] as RankedCollege[][],
  notes: [
    '⚠️ MIT – no standalone MS in CS for outside applicants',
    '⚠️ KIT, LMU, TU Berlin – many CS courses taught in German, check before applying',
    'SMU, SUTD, SIT – weak fit for Cloud/AI Infra',
    'Georgia Tech sits just below UIUC and shares level 5.',
  ],
}

// ───────────────────── 5.3 IELTS / TOEFL ─────────────────────
export const ielts = {
  columns: ['Tier', 'Colleges', 'Minimum IELTS', 'Aim for (IELTS)', 'TOEFL (old 0–120 scale)'],
  rows: [
    {
      tier: 'dream' as Tier,
      label: '🌟 Dream',
      colleges: 'Stanford, CMU, UC Berkeley, Oxford, Cambridge, Imperial, Toronto, NUS',
      minimum: '7.0–7.5',
      aim: '7.5–8.0, no band below 7.0',
      toefl: '105+',
      minRange: [7.0, 7.5],
      aimRange: [7.5, 8.0],
    },
    {
      tier: 'range' as Tier,
      label: '🎯 Range',
      colleges: 'Georgia Tech, UIUC, UCSD, Waterloo, UBC, McGill, TU Munich, RWTH, TU Delft, Amsterdam, UCL, Edinburgh',
      minimum: '6.5–7.0',
      aim: '7.0–7.5, no band below 6.5',
      toefl: '95–105',
      minRange: [6.5, 7.0],
      aimRange: [7.0, 7.5],
    },
    {
      tier: 'safety' as Tier,
      label: '✅ Safety',
      colleges: 'Northeastern, UMass, ASU, Alberta, TCD, UCD, Manchester, Glasgow, Utrecht, Groningen',
      minimum: '6.0–6.5',
      aim: '7.0, no band below 6.0',
      toefl: '80–95',
      minRange: [6.0, 6.5],
      aimRange: [7.0, 7.0],
    },
  ],
  notes: [
    'Single target: **IELTS 7.5, no band below 7.0**. That covers all three tiers.',
    'Take IELTS in **May–July 2027** (scores are valid 2 years).',
    'TOEFL moved to a 1–6 scale in January 2026. The figures above are old-scale equivalents.',
  ],
}

// ───────────────────── 5.4 GRE plan ─────────────────────
export const gre = {
  title: 'GRE plan (only needed for 🇺🇸 USA & 🇸🇬 Singapore)',
  tiers: [
    {
      tier: 'dream' as Tier,
      label: '🌟 **Dream**',
      colleges: 'Stanford, CMU, UC Berkeley, NUS',
      status: 'Optional (USA) / Recommended (NUS)',
      aim: 'Quant 167–170 | Total 325+ | AWA 4.0+',
      quant: [167, 170],
    },
    {
      tier: 'range' as Tier,
      label: '🎯 **Range**',
      colleges: 'Georgia Tech, UIUC, UCSD, NTU',
      status: 'Optional (USA) / Recommended (NTU)',
      aim: 'Quant 165+ | Total 318–325 | AWA 3.5+',
      quant: [165, 170],
    },
    {
      tier: 'safety' as Tier,
      label: '✅ **Safety**',
      colleges: 'Northeastern, UMass, ASU',
      status: 'Optional',
      aim: 'Quant 160+ | Total 310–318 | AWA 3.5',
      quant: [160, 170],
    },
  ],
  notNeededLabel: '❌ **GRE not needed:**',
  notNeeded: [
    { code: 'CA' as CountryCode, colleges: 'Toronto, UBC, Waterloo, McGill, Alberta' },
    { code: 'DE' as CountryCode, colleges: 'TU Munich, RWTH, KIT' },
    { code: 'GB' as CountryCode, colleges: 'Oxford, Cambridge, Imperial, UCL, Edinburgh' },
    { code: 'NL' as CountryCode, colleges: 'TU Delft, Amsterdam, Eindhoven' },
    { code: 'IE' as CountryCode, colleges: 'TCD, UCD, UCC' },
  ],
  whenToSubmit: [
    { rule: 'Quant 165+ → submit everywhere', tier: 'safety' as Tier },
    { rule: 'Quant 160–164 → only Safety schools', tier: 'target' as Tier },
    { rule: 'Quant below 160 → don’t submit', tier: 'warning' as Tier },
  ],
  timeline: [
    'Dec 2026 – Jan 2027 → Diagnostic test',
    'Feb – Mar 2027 → Prep + take GRE',
    'Apr 2027 → Retake if Quant < 165',
  ],
  notes: [
    '💡 Quant matters most for CS',
    '💡 Valid 5 years | ~2 hrs | ~₹22,000',
    '⚠️ Check each program page – policies change yearly',
  ],
}

// ───────────────────── 5.5 CGPA ─────────────────────
export const cgpa = {
  title: 'CGPA targets (for SRMIST applicants, non-IIT)',
  mine: '📌 My CGPA: **9.36 / 10** ✅',
  value: 9.36,
  tiers: [
    {
      tier: 'dream' as Tier,
      label: '🌟 **Dream**',
      colleges: 'Stanford, CMU, UC Berkeley, Oxford, Cambridge, Imperial, Toronto, NUS',
      minimum: '8.5',
      aim: '9.2+ (top 5% of class)',
      status: '✅ Cleared – research & LORs decide here',
      minValue: 8.5,
      aimValue: 9.2,
    },
    {
      tier: 'range' as Tier,
      label: '🎯 **Range**',
      colleges: 'Georgia Tech, UIUC, UCSD, Waterloo, UBC, McGill, TU Munich, RWTH, TU Delft, Amsterdam, UCL, Edinburgh',
      minimum: '8.0',
      aim: '8.5+',
      status: '✅ Comfortably above',
      minValue: 8.0,
      aimValue: 8.5,
    },
    {
      tier: 'safety' as Tier,
      label: '✅ **Safety**',
      colleges: 'Northeastern, UMass, ASU, Alberta, TCD, UCD, Manchester, Glasgow, Utrecht, Groningen',
      minimum: '7.0–7.5',
      aim: '8.0+',
      status: '✅ Well above',
      minValue: 7.0,
      aimValue: 8.0,
    },
  ],
  germanyNote:
    '🇩🇪 Germany note: admission is mostly grade-based. 9.36 ≈ German grade 1.3–1.4 (1.0 is best), which is very strong for TUM, RWTH and KIT.',
  whatMattersTitle: 'What matters now:',
  whatMatters: [
    'Applications go out Sep 2027 → transcripts up to Sem 6',
    'So Sem 5 & 6 (this year) count the most',
    'Keep CGPA 9.2+ through final year',
    'Keep IIT Madras BS grades strong too',
    'Get a class rank certificate from SRM (e.g. "Top 3%")',
    '💡 CGPA is NOT the weak point. Research + internship + LORs decide Dream schools.',
  ],
}

// ───────────────────── Tiered hierarchies ─────────────────────
export interface TierItem {
  n: number
  title: string
  body: string
}
export interface TierGroup {
  medal: Medal
  heading: string
  items: TierItem[]
}

// 5.6 LOR hierarchy
export const lor: TierGroup[] = [
  {
    medal: 'gold',
    heading: '🥇 Tier 1: Highest value',
    items: [
      {
        n: 1,
        title: 'A foreign professor you did research with.',
        body: 'Summer research programs like DAAD WISE (Germany), Summer@EPFL, CMU RISS, or NUS/NTU summer research. A letter from a professor at a university abroad is the strongest letter you can get, especially when applying to that same country (DAAD for TUM and RWTH).',
      },
      {
        n: 2,
        title: 'An IIT or IISc professor you did research under on-campus.',
        body: 'For example IISc or IIT summer fellowships like IAS-SRFP, or research at an IIT Madras centre like HTIC. Much stronger than a letter from your online BS faculty.',
      },
      {
        n: 3,
        title: 'Your SRM research supervisor, with a real output.',
        body: 'If the work leads to a paper, preprint or working system. Admissions committees read what the letter says more than where it’s from.',
      },
    ],
  },
  {
    medal: 'silver',
    heading: '🥈 Tier 2: Strong',
    items: [
      {
        n: 4,
        title: 'Your manager at a Big Tech or well-known tech company.',
        body: 'Google, Microsoft, AWS, NVIDIA, Databricks and similar, in a cloud or infra role where you owned something. Even better if the manager has a master’s or PhD.',
      },
      {
        n: 5,
        title: 'An IIT Madras BS faculty member who supervised a project.',
        body: 'Only counts if they actually supervised you. Being a student in their online lectures isn’t enough.',
      },
      {
        n: 6,
        title: 'A Google Summer of Code or open-source mentor.',
        body: 'A maintainer of a recognised project (Kubernetes, Apache, PyTorch ecosystem) who reviewed your code. Highly credible for systems and cloud programs.',
      },
    ],
  },
  {
    medal: 'bronze',
    heading: '🥉 Tier 3: Solid, fine for Range and Safety',
    items: [
      {
        n: 7,
        title: 'An SRM professor from a core course where you ranked near the top.',
        body: 'Cloud Computing, OS, Distributed Systems. Much stronger if you also did a project with them.',
      },
      {
        n: 8,
        title: 'A startup CTO or engineering lead.',
        body: 'Good if they can describe real engineering work you did, like the PRIMUS backend work.',
      },
      {
        n: 9,
        title: 'A manager from a short internship.',
        body: 'PRIMUS or AJA Labs managers. Two months is thin, but acceptable for Safety schools.',
      },
    ],
  },
]

// 5.7 SOP hierarchy
export const sop: { tiers: TierGroup[]; structureTitle: string; structure: TierItem[] } = {
  tiers: [
    {
      medal: 'gold',
      heading: '🥇 Tier 1: Highest value (most of the SOP)',
      items: [
        {
          n: 1,
          title: 'Research: a specific problem, what you did, and what you found.',
          body: 'Written as a story: the GPU scheduling or parallelism problem, your approach, the result, and the open question it left you with. That open question is why you need an MS.',
        },
        {
          n: 2,
          title: 'A clear, specific direction.',
          body: 'Not "I’m passionate about AI and cloud". Something like: "I want to work on how large AI workloads are scheduled and served efficiently across distributed GPU clusters."',
        },
        {
          n: 3,
          title: 'Program-specific fit.',
          body: 'Name 2–3 professors, labs or courses and say what connects to your work. For example CMU’s Parallel Data Lab, Georgia Tech’s systems courses, the distributed systems group at TU Delft, or the cloud computing group at VU Amsterdam. Most Indian applicants’ SOPs fail here by writing one generic version.',
        },
      ],
    },
    {
      medal: 'silver',
      heading: '🥈 Tier 2: Strong supporting evidence',
      items: [
        {
          n: 4,
          title: 'Industry work with numbers.',
          body: 'PRIMUS backend pipelines: requests per day, latency reduced, data volume processed.',
        },
        {
          n: 5,
          title: 'Projects that show systems thinking.',
          body: 'Something built and deployed on AWS or GCP, with a trade-off you reasoned about (cost vs speed, consistency vs availability).',
        },
        {
          n: 6,
          title: 'The dual degree, framed as a deliberate choice.',
          body: 'SRM gave systems, IIT Madras gave data and ML, and AI infrastructure sits where those meet.',
        },
      ],
    },
    {
      medal: 'bronze',
      heading: '🥉 Tier 3: Brief mentions only',
      items: [
        { n: 7, title: 'B&N Tech Agencies:', body: 'one or two lines about delivering real work for real clients.' },
        { n: 8, title: 'AWS certification or hackathon:', body: 'one line each, only if they support the story.' },
        { n: 9, title: 'Challenges or setbacks:', body: 'only if they explain something, kept short and factual.' },
      ],
    },
  ],
  structureTitle: 'A simple 5-part SOP structure',
  structure: [
    { n: 1, title: 'Opening:', body: 'a real technical problem you ran into, not a life story.' },
    { n: 2, title: 'What you’ve done:', body: 'research first, then industry, then projects.' },
    { n: 3, title: 'Why an MS now:', body: 'the gap between what you can do and what you want to do.' },
    { n: 4, title: 'Why this program:', body: 'specific professors, labs, courses.' },
    { n: 5, title: 'Your goal:', body: 'where you’ll be 3–5 years after the MS.' },
  ],
}

// 5.8 Internships
export const internships = {
  alertTitle: '⏰ Urgent alerts',
  alerts: [
    'MITACS Globalink 2027 has already closed (deadline was 16 September 2026).',
    'DAAD WISE 2027 (Germany) closes around **1 November 2026**. 5th-semester students appear eligible, with a CGPA bar of about 8.0. **A German host professor’s acceptance is required before applying.** Email professors at TUM, RWTH and KIT now, and confirm on DAAD’s official page.',
    'Now in **3rd year**, so **summer 2027 is the last internship before applications go out.**',
  ],
  tiers: [
    {
      medal: 'gold',
      heading: '🥇 Tier 1: Highest value',
      items: [
        {
          n: 1,
          title: 'Research internships abroad.',
          body: 'DAAD WISE (Germany), Summer@EPFL (Switzerland), NUS/NTU summer research. A foreign professor’s LOR plus research experience at once. The biggest single boost for Dream schools.',
        },
        {
          n: 2,
          title: 'Big Tech in a cloud or infra role.',
          body: 'Google, Microsoft, Amazon/AWS, NVIDIA, Adobe, Atlassian. Target SDE, SRE, platform or cloud intern roles. Most open summer applications in August–October.',
        },
        {
          n: 3,
          title: 'Open-source programmes for cloud infrastructure.',
          body: 'LFX Mentorship (Linux Foundation, covering CNCF projects like Kubernetes and Prometheus) and Google Summer of Code (applications typically open in March).',
        },
      ],
    },
    {
      medal: 'silver',
      heading: '🥈 Tier 2: Strong',
      items: [
        {
          n: 4,
          title: 'IIT or IISc research internships.',
          body: 'IAS-SRFP summer fellowships, IIT Madras summer programmes, HTIC (in an infra-type role).',
        },
        {
          n: 5,
          title: 'Product companies or startups with real infrastructure scale.',
          body: 'Razorpay, Zerodha, Postman, Freshworks, Zoho, Swiggy, Flipkart. Platform, SRE, data engineering or MLOps roles with end-to-end ownership.',
        },
        {
          n: 6,
          title: 'Research with an SRM supervisor.',
          body: 'Not technically an internship, but it runs alongside everything and is the main research story.',
        },
      ],
    },
    {
      medal: 'bronze',
      heading: '🥉 Tier 3: Acceptable',
      items: [
        {
          n: 7,
          title: 'Cloud practice teams at IT services firms.',
          body: 'TCS, Infosys, Accenture, Capgemini. Real work, but lower-signal.',
        },
        {
          n: 8,
          title: 'Small startups via Internshala or LinkedIn.',
          body: 'Only if the work is backend, cloud or data infrastructure.',
        },
        {
          n: 9,
          title: 'More short internships like PRIMUS and AJA Labs.',
          body: 'A third adds little unless it’s clearly cloud-focused.',
        },
      ],
    },
  ] as TierGroup[],
  timelineTitle: 'Internship timeline',
  timeline: [
    {
      when: 'This week – 1 Nov 2026',
      what: 'Email German professors for DAAD WISE. Apply to Big Tech summer 2027 internships.',
    },
    {
      when: 'Oct 2026 – Mar 2027',
      what: 'Research with SRM supervisor during the semester. Apply for IAS-SRFP, Summer@EPFL and IIT summer programmes as their windows open.',
    },
    { when: 'Dec 2026 – Jan 2027', what: 'A short winter project, such as first LFX or open-source contributions.' },
    { when: 'Mar – Apr 2027', what: 'Apply for GSoC or LFX summer projects as a backup.' },
    { when: 'May – Jul 2027', what: 'Main internship: whichever Tier 1 or 2 offer lands.' },
    {
      when: 'Sep 2027',
      what: 'Applications begin, with this internship on the CV and its supervisor as a recommender.',
    },
  ],
}

// 5.9 Certifications
export const certifications = {
  tiers: [
    {
      medal: 'gold',
      heading: '🥇 Tier 1: Highest value for Cloud/AI Infra',
      items: [
        {
          n: 1,
          title: 'AWS Certified Solutions Architect – Associate.',
          body: 'The most widely recognised cloud certification. About $150. Skip AWS Cloud Practitioner and go straight to this.',
        },
        {
          n: 2,
          title: 'CKA (Certified Kubernetes Administrator).',
          body: 'A hands-on exam fixing real clusters, which makes it highly credible for infrastructure roles. About $445, often discounted in Linux Foundation sales.',
        },
        {
          n: 3,
          title: 'NVIDIA certifications and DLI courses.',
          body: '*Fundamentals of Accelerated Computing with CUDA* and the *NVIDIA-Certified Associate: AI Infrastructure and Operations*. They fit the goal most directly and pair with SRM’s GPU honours.',
        },
      ],
    },
    {
      medal: 'silver',
      heading: '🥈 Tier 2: Strong',
      items: [
        {
          n: 4,
          title: 'Google Cloud Associate Cloud Engineer.',
          body: 'A second cloud provider, or for GCP-heavy companies.',
        },
        {
          n: 5,
          title: 'HashiCorp Terraform Associate.',
          body: 'Infrastructure-as-code for platform and SRE roles. Cheap and quick.',
        },
        {
          n: 6,
          title: 'AWS Machine Learning Engineer – Associate or Google Professional ML Engineer.',
          body: 'Deploying ML models (MLOps).',
        },
        { n: 7, title: 'Azure Administrator (AZ-104).', body: 'Only for Microsoft-heavy employers.' },
      ],
    },
    {
      medal: 'bronze',
      heading: '🥉 Tier 3: Fine as learning, weak as credentials',
      items: [
        {
          n: 8,
          title: 'NPTEL Cloud Computing or Parallel Computing (Elite + Gold).',
          body: 'Recognised in India, little weight abroad.',
        },
        {
          n: 9,
          title: 'Coursera specialisations.',
          body: 'DeepLearning.AI, Andrew Ng’s ML course. Great learning, not really credentials.',
        },
        {
          n: 10,
          title: 'Entry-level certifications.',
          body: 'AWS Cloud Practitioner, AZ-900, Google Cloud Digital Leader. Too basic for a CS student.',
        },
      ],
    },
  ] as TierGroup[],
  orderLabel: 'Recommended order:',
  order: [
    'SRM GPU honours (ongoing)',
    'AWS Solutions Architect – Associate (Dec 2026 – Feb 2027)',
    'NVIDIA DLI CUDA + AI Infrastructure associate',
    'CKA (mid-2027)',
  ],
  orderTail: 'Then stop at 3, and build a small GitHub project for each.',
}

// 5.10 SRM faculty & paths
export const faculty = {
  checkFirst:
    '**⚠️ Check first:** Dr. K.R. Jansi’s SRM profile lists her research interests as wireless networks, security, blockchain and mobile sensing, not GPU computing, though she co-designed SRM’s GPU-Accelerated Computing honours curriculum. Ask what projects she’s actually running before committing.',
  tableTitle: '🎯 SRM faculty worth approaching',
  columns: ['Faculty', 'Background', 'Fit'],
  people: [
    {
      id: 'amutha',
      short: 'Dr. B. Amutha',
      name: 'Dr. B. Amutha, Professor, Computing Technologies',
      background: 'Head of the Accelerated Computing Lab. Co-designed the GPU honours curriculum',
      stars: 3,
      fit: '⭐⭐⭐ Best fit. Lab projects include GPU optimisation, distributed inference caching and deploying deep learning models.',
    },
    {
      id: 'nambiar',
      short: 'Dr. Athira Nambiar',
      name: 'Dr. Athira Nambiar, Research Associate Professor, Computational Intelligence',
      background: 'PhD with distinction, University of Lisbon (Portugal). Postdoc at IIT Madras. ~50 papers incl. CVPR and ICCV',
      stars: 2,
      fit: '⭐⭐ Most internationally credentialed. Computer vision, not infra, but a strong letter would carry weight abroad.',
    },
    {
      id: 'rubia',
      short: 'Dr. Jency Rubia J',
      name: 'Dr. Jency Rubia J, Assistant Professor, Computing Technologies',
      background: 'Postdoc at IIT Guwahati',
      stars: 1,
      fit: '⭐ Quantum-inspired ML and hardware architecture. Off path.',
    },
    {
      id: 'chittoor',
      short: 'Dr. Prithvi Krishna Chittoor',
      name: 'Dr. Prithvi Krishna Chittoor, Assistant Professor, Computational Intelligence',
      background: 'Postdoc at SUTD (Singapore)',
      stars: 1,
      fit: '⭐ Robotics and UAVs. Off path, possible Singapore contact.',
    },
    {
      id: 'selvin',
      short: 'Dr. Selvin Paul Peter J',
      name: 'Dr. Selvin Paul Peter J, Professor, Computing Technologies',
      background: 'PhD from VTU, 20+ years teaching',
      stars: 1,
      fit: '⭐ Cloud Computing research area, teaches the Cloud Computing course. Reasonable course-professor LOR.',
    },
  ],
  visiting:
    'Foreign visiting professors: Prof. Ovidiu Bagdasar (University of Derby, UK) and Prof. Tommaso Pecorella (University of Florence, Italy). Easy first contacts abroad.',
  visitingPeople: [
    { id: 'bagdasar', short: 'Prof. Ovidiu Bagdasar' },
    { id: 'pecorella', short: 'Prof. Tommaso Pecorella' },
  ],
  pathsTitle: '🛣️ The 3 paths',
  paths: [
    {
      id: 'abroad',
      short: 'Student Abroad Program',
      title: 'SRM’s Student Abroad Program (most important).',
      body: 'Research internships at Carnegie Mellon, Harvard Medical School, UC Berkeley, Northeastern and the Australian National University, plus semester abroad and a 3.5 + 1.5 pathway with Binghamton University. Listed under the Computational Intelligence department, so ask the international relations office whether Computing Technologies students can apply.',
    },
    {
      id: 'honours',
      short: 'GPU Honours',
      title: 'Honours in GPU-Accelerated Computing.',
      body: '20 credits in the Computing Technologies department: CUDA, MPI/OpenMP, high-performance computing, GPU computing, built on NVIDIA’s frameworks. No prerequisites listed.',
    },
    {
      id: 'lab',
      short: 'Accelerated Computing Lab',
      title: 'Dr. Amutha’s Accelerated Computing Lab.',
      body: 'Email her and mention the distributed inference caching or GPU optimisation projects.',
    },
  ],
  sources: [
    'https://www.srmist.edu.in/lab/accelerated-computing/',
    'https://webstor.srmist.edu.in/web_assets/downloads/2025/curriculum-honors-in-gpu-accelerated-computing.pdf',
    'https://www.srmist.edu.in/faculty/k-r-jansi/',
    'https://www.srmist.edu.in/faculty/dr-athira-m-nambiar/',
    'https://www.srmist.edu.in/department/department-of-computational-intelligence/student-abroad-program/',
    'https://www.srmist.edu.in/department/department-of-computing-technologies/visiting-professor/',
  ],
}

// 5.11 Footer
export const footer = {
  card: 'Requirements change every year – confirm on each program page before applying.',
  text: '⚠️ Requirements, deadlines and scores change every year. Confirm everything on each official program page before applying.',
}

export const sections = [
  { id: 'hero', label: 'Overview' },
  { id: 'documents', label: 'Documents' },
  { id: 'ranking', label: 'Ranking' },
  { id: 'targets', label: 'Targets' },
  { id: 'lor', label: 'LORs' },
  { id: 'sop', label: 'SOP' },
  { id: 'internships', label: 'Internships' },
  { id: 'certifications', label: 'Certs' },
  { id: 'faculty', label: 'SRM Faculty' },
  { id: 'footer', label: 'Disclaimer' },
]
