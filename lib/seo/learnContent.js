// Single source of truth for /resources sub-pages, glossary, and sitemap.
// Each section becomes its own SEO-friendly URL.
//
// Tone: written for users, not lawyers. Plain English. Examples where useful.

export const LEARN_SECTIONS = [
  {
    slug: 'before-you-start',
    eyebrow: 'Preparation',
    title: 'Before You Start Your Ontario Separation Agreement',
    description: 'What documents and information to gather before creating your separation agreement online — tax returns, Notices of Assessment, pay stubs, asset and debt lists.',
    keywords: ['what do you need for separation agreement Ontario', 'separation agreement document checklist'],
    intro: 'You do not need everything on day one — but having a few documents nearby makes the process faster and smoother. Here is what each item is and why it helps.',
    body: [
      {
        h: 'Your last 3 years of tax returns (T1)',
        p: 'The T1 General is the federal tax return you (or your accountant) file every April. The number on it called "Total Income" — line 15000 — is what support is calculated from. Three years of returns lets the calculation smooth out one-off years where you got a bonus, sold an investment, or had a slow year. If you can only find one year, start there. The rest can come later.',
      },
      {
        h: 'Your most recent Notice of Assessment',
        p: 'The Notice of Assessment (NOA) is the letter CRA sends back after you file. It confirms what they think your income was. It is a one-page document. If you cannot find the paper copy, log into CRA "My Account" online — every NOA from the last 10 years is sitting there.',
      },
      {
        h: 'A recent pay stub or two',
        p: 'If your situation has changed mid-year — new job, raise, hours cut — pay stubs show your current monthly income. Without them, support could be calculated off last year and may not reflect today.',
      },
      {
        h: 'A rough list of what each of you owns and owes',
        p: 'Think: the house, cars, bank accounts, investments, RRSPs, pensions, businesses, valuable personal items. On the debt side: mortgage, line of credit, credit cards, student loans, car loans, tax debt. You do not need exact values yet — a rough list is enough to start.',
      },
      {
        h: 'Supporting property documents',
        p: 'Recent statements (one per account), the mortgage statement, vehicle ownership, appraisals if you have them. Nice to have, not required to start.',
      },
      {
        h: 'The other party\'s email',
        p: 'We use this to invite them to the agreement. Both of you log in separately, contribute information, and sign electronically. Without this you can still build a draft alone, but you cannot finalize signatures.',
      },
    ],
  },

  {
    slug: 'using-the-calculator',
    eyebrow: 'Calculator',
    title: 'Using the Ontario Support Calculator',
    description: 'How the OurSeparation calculator works: income, parenting time, separation date, and the high/mid/low SSAG ranges it produces.',
    keywords: ['Ontario support calculator', 'SSAG calculator', 'how SSAG ranges work', 'Federal Child Support Tables Ontario'],
    intro: 'The calculator is the math behind your agreement. Type in income for both parties, dates, the number of kids, and the parenting setup, and it tells you what support looks like.',
    body: [
      {
        h: 'What the calculator needs',
        p: 'Line 15000 income for each party (from your most recent T1 tax return), the relationship dates, the number of children, and the parenting arrangement. Province defaults to Ontario.',
      },
      {
        h: 'What you get back',
        p: 'Three numbers — low, mid, and high — because the Spousal Support Advisory Guidelines (SSAG) give a range, not a single answer. Mid is what most people agree on. Low is reasonable when the payor has high fixed costs. High is reasonable when the recipient took years out of the workforce for the family.',
      },
      {
        h: 'Date-aware tables',
        p: 'The calculator automatically picks the correct Federal Child Support Table based on your separation date. The Tables changed in 2006, 2011, 2017, and 2025 — using the wrong one gives you a wrong number. The app handles this for you.',
      },
      {
        h: 'When to use it',
        p: 'Use it before you build an agreement to get a sense of the numbers. Or use it standalone if you only need answers. Saved calculations can later be linked to a full agreement.',
      },
    ],
  },

  {
    slug: 'info-tab',
    eyebrow: 'Tab 1',
    title: 'Info: Names, Dates, Children, and Relationship Basics',
    description: 'The first tab of the Ontario separation agreement builder — full legal names, dates of birth, occupations, parental titles, and the three key relationship dates.',
    keywords: ['separation agreement names', 'date of separation Ontario', 'cohabitation date Ontario', 'legal name separation agreement'],
    intro: 'This is the foundation of the agreement. Everything else builds on it. Take your time getting it right.',
    body: [
      {
        h: 'Your name and your spouse\'s name',
        p: 'Use full legal names exactly as they appear on government ID. Driver\'s licence, passport, or citizenship card. If your driver\'s licence says "Robert" but everyone calls you "Bob," use "Robert." The legal document needs to match the legal you.',
      },
      {
        h: 'Date of birth',
        p: 'Appears in the recitals (the introduction of the document). It also quietly affects whether the SSAG "Rule of 65" applies to your spousal support — a rule that can make support indefinite if your age plus the years married is 65 or more at separation.',
      },
      {
        h: 'Occupation',
        p: 'What each of you does for a living. If you are between jobs, write what you do when employed. If you are a stay-at-home parent, that is a valid occupation — write that. Court documents need to identify what each of you actually does.',
      },
      {
        h: 'Parental title',
        p: 'If you have kids, this is what you would like to be called in the document — Mother, Father, or a gender-neutral title. Only used in places where the document talks about the kids ("the children shall spend Mother\'s Day with their Mother…").',
      },
      {
        h: 'The other party\'s email',
        p: 'Their personal email — not a shared one, not a work one if you can avoid it. This is how they get invited to the agreement, log in, contribute their information, and eventually sign.',
      },
      {
        h: 'Date of marriage',
        p: 'The day you legally got married, from your marriage certificate. Leave this blank if you were not married — common-law relationships are valid in Ontario and have their own rules.',
      },
      {
        h: 'Date of cohabitation',
        p: 'When you started living together as a couple. This is one people get confused about. Cohabitation means living together as a couple, not as roommates. If you started dating in 2018, moved in together in 2020, and got married in 2022, your cohabitation date is 2020. If you and a roommate shared an apartment for two years before you started dating, cohabitation starts when the relationship started, not when you moved in.',
      },
      {
        h: 'Date of separation',
        p: 'The single most important date in the whole agreement. The day you decided the relationship was over. Almost every clause that mentions money, property, or support refers back to it. Property values are calculated as of this day. Support clocks start ticking from this day. Pick the day that feels most accurate — the other party will need to agree to it too.',
      },
      {
        h: 'Marriage location and signing city',
        p: 'Marriage location is where the marriage actually happened (city/town). Signing city is where you will be when you sign the agreement. Both show the court has the right jurisdiction.',
      },
      {
        h: 'Adding children',
        p: 'For each child of your relationship: name, date of birth, and where they will mostly live (with you, with the other parent, or shared). Children from a previous relationship go in a separate place — they have their own support arrangements that the court treats differently.',
      },
    ],
  },

  {
    slug: 'parenting',
    eyebrow: 'Tab 2',
    title: 'Parenting: Decisions, Schedule, Holidays, and Special Clauses',
    description: 'How to set up parenting arrangements in your Ontario separation agreement — decision-making, schedule templates, summer plans, transportation, holidays, and special clauses.',
    keywords: ['parenting plan Ontario', 'joint custody Ontario', 'shared parenting Ontario', 'parenting schedule template', 'right of first refusal', 'relocation clause'],
    intro: 'If you have kids, this is the longest tab. Pace yourself — the decisions here shape your family life for years.',
    body: [
      {
        h: 'Decision-making — joint, sole, or split',
        p: 'Joint decision-making (most common) means both of you decide on big things together. Sole means one parent has final say. Split means you divide by area: one of you leads on education, the other on medical, joint on religion. Joint works when you and the other parent can have civil conversations about the kids. Sole fits when one parent has historically made all the decisions, or when serious issues (substance, mental health, abuse) make giving the other parent decision power risky.',
      },
      {
        h: 'How decisions get made in each domain',
        p: 'For each area (education, health, religion, extracurricular) you pick: joint (you both have to agree), consult (one parent decides but talks to the other first), Party 1 decides, or Party 2 decides. Most people pick joint for big stuff and consult for medium stuff.',
      },
      {
        h: 'How you will communicate',
        p: 'Pick a structure: scheduled written updates with weekly check-ins (good when you can communicate but want structure), email every two weeks (more formal, good for high-conflict situations where you want a paper trail), phone as needed (casual), or combined — messages for logistics, email for formal matters.',
      },
      {
        h: 'The parenting schedule',
        p: 'Pick a template: primary residence with one parent (traditional setup, kids live with one parent most of the time), every other weekend (Friday after school to Sunday dinner plus a midweek visit), week-on/week-off (50/50, swap weekly — fits when you live close and the kids are 8+), 2-2-3 (50/50 with faster rotation, fits young kids and parents who live close), 5-2-2-5 (50/50 with longer stretches), or custom 4-week schedule (draw your own grid when no template fits).',
      },
      {
        h: 'Summer schedule',
        p: 'School-year schedules often fall apart in July and August. Options include equal split with two-week alternating blocks, alternating full weeks, or an extended block with one parent for a vacation followed by the regular schedule.',
      },
      {
        h: 'Pickup, dropoff, and transportation',
        p: 'Who drives, what time, where. The simpler the better. Common patterns: one parent does all driving (usually the parent ending their time), meet in the middle (common when parents live in different cities), or pickup from school (the parent starting their time picks up from school directly). Pick neutral exchange locations — the kid\'s school, a community centre, a coffee shop. Avoid "at my house" in high-conflict situations.',
      },
      {
        h: 'Holiday arrangements',
        p: 'For each statutory, religious, or family holiday you pick: alternating yearly (Party 1 gets Christmas Eve in odd years, Party 2 in even years), always with one parent (Mother\'s Day always with Mother), split in half (Christmas morning with one, afternoon with the other), or no specific arrangement (handled by the regular schedule). If you celebrate a holiday not in the preset list — Diwali, Eid, Lunar New Year, Vaisakhi, Hanukkah — add it as a custom holiday.',
      },
      {
        h: 'Special clauses',
        p: 'Optional add-ons that prevent common arguments. Right of first refusal (if you need a sitter for more than X hours, you offer the other parent first). Relocation restriction (cannot move with the kids more than X km without notice — default 50 km, 60 days). International travel consent (both parents must agree before either takes the kids out of the country). New partners (wait X months before introducing a new partner — most therapists recommend 6 months minimum). Social media (no posting kids\' photos without consent). Other (custom).',
      },
    ],
  },

  {
    slug: 'property',
    eyebrow: 'Tab 3',
    title: 'Property: Assets, Debts, Documents, and Equalization',
    description: 'How property division and equalization work in an Ontario separation agreement — Net Family Property, valuation, supporting documents, and how to divide each asset.',
    keywords: ['property division Ontario', 'equalization payment Ontario', 'Net Family Property', 'NFP calculation', 'matrimonial home Ontario', 'pension division separation'],
    intro: 'This is the second-most-important tab after parenting and often the most tedious. The principle is simpler than it sounds.',
    body: [
      {
        h: 'The principle, in plain English',
        p: 'Ontario uses something called Net Family Property. On the separation date, what is each of you worth (assets minus debts)? What did you bring into the marriage? The difference is what you built up together. Whichever party built up more pays the other half the difference. That is called an equalization payment. So if you walked out with $300K of growth during the marriage and your spouse with $100K, the difference is $200K — you owe them $100K to even it out.',
      },
      {
        h: 'What counts as property',
        p: 'Real estate (the house, a cottage, a rental, vacant land). Vehicles (cars, trucks, motorcycles, boats, RVs). Bank accounts (chequing, savings, joint or sole). Investments (TFSAs, non-registered investments, GICs). RRSPs, RRIFs, and pensions (use the statement value but remember they are pre-tax). Businesses (need a business valuation if you own one). Personal property (furniture, electronics, jewellery, art — list anything valuable enough to argue about, not every fork in the kitchen). Debts: mortgage, line of credit, credit cards, student loans, car loans, tax debt.',
      },
      {
        h: 'For each item, you record',
        p: 'Type and description (e.g. "House at 123 Maple St" or "TD chequing account ending 1234"). Value (the worth on the separation date — be accurate, not optimistic). Owner (Party 1, Party 2, or both). Valuation date (usually the separation date, sometimes the marriage date for "brought-in" items). How you valued it (bank statement, appraisal, Kelley Blue Book, auto.ca, estimate based on a neighbour\'s recent sale).',
      },
      {
        h: 'How property gets divided',
        p: 'Sell and split (common for the house). Buyout (one party keeps it and refinances or pays the other their share). Transfer of title (one party keeps a vehicle, account, or RRSP outright). Equalize at the end (list everything, one big payment levels it). Retain (each party keeps what is in their name, one cash payment balances the rest).',
      },
      {
        h: 'Common scenarios',
        p: 'The house was yours before marriage: the value at the date of marriage stays with you. The growth during the marriage gets shared. Inheritances and gifts from third parties (not from your spouse) can be excluded if you kept them separate. If you put a $50K inheritance into the joint account that paid the mortgage, it is now shared. RRSPs at $200K are pre-tax — the agreement can apply a tax discount and divide on after-tax value.',
      },
    ],
  },

  {
    slug: 'income-disclosure',
    eyebrow: 'Tab 4',
    title: 'Income Disclosure: Tax Returns, Notices of Assessment, and Pay Stubs',
    description: 'Why financial disclosure matters in an Ontario separation agreement, what counts as full disclosure, and what each document proves.',
    keywords: ['financial disclosure separation', 'full income disclosure Ontario', 'separation agreement income documents'],
    intro: 'The agreement contains a binding statement that both of you have exchanged full income information. This tab is where you record that you have done that.',
    body: [
      {
        h: 'What full disclosure means',
        p: 'You give the other party copies of all your tax returns, NOAs, and pay stubs. You actually look at theirs, not just claim to have seen them. Either side can ask follow-up questions and get honest answers. If something looks unusual — a big deposit, a missing year, a business with no apparent income — you ask about it.',
      },
      {
        h: 'Why this matters more than people think',
        p: 'If full disclosure did not happen, the agreement can be challenged later. Years later. Someone can come back in 2030 and say "they did not show me their 2025 tax return, they were hiding $80K in side income, this whole agreement should be set aside." Doing disclosure cleanly now means the agreement is much harder to attack later.',
      },
      {
        h: 'What to share',
        p: 'Last 3 years of T1 tax returns (the full return, not just the front page). Most recent Notice of Assessment (confirms CRA\'s view of your income). Recent pay stubs (proves current monthly income). Business financials if self-employed (last 3 years of statements).',
      },
    ],
  },

  {
    slug: 'child-support',
    eyebrow: 'Tab 5',
    title: 'Child Support: Monthly Support, Section 7 Expenses, and Arrears',
    description: 'How child support is calculated in Ontario using the Federal Child Support Tables, what Section 7 special expenses are, and how to settle retroactive support.',
    keywords: ['child support Ontario', 'Federal Child Support Tables', 'Section 7 expenses', 'child support arrears Ontario', 'retroactive child support'],
    intro: 'Child support belongs to the kids, not to you. Even if both of you agree to skip it, the court can still enforce it later.',
    body: [
      {
        h: 'The basic monthly amount',
        p: 'The Federal Child Support Tables set the monthly amount based on the payor\'s income, the number of children, and the province. Someone in Ontario earning $80K with 2 kids pays a fixed amount per month. Going above the Table is fine. Going below the Table is hard — a judge can refuse to approve an agreement that pays less without a very good reason.',
      },
      {
        h: 'Section 7 expenses (the extras)',
        p: 'The basic amount covers normal stuff: food, clothing, housing share, school supplies, basic activities. Section 7 covers the big extras. Childcare (daycare, before/after-school care, summer camp when needed for work). Medical and dental beyond OHIP (braces, glasses, therapy, prescriptions, mental health counselling). Post-secondary education (tuition, books, residence, sometimes living costs — the biggest Section 7 expense for most families). Major extracurricular activities (competitive sports, music lessons with expensive instruments). Education for special needs.',
      },
      {
        h: 'How Section 7 expenses are split',
        p: 'Usually split proportionally to each parent\'s income. If Party 1 earns 65% of combined household income and Party 2 earns 35%, the daycare bill gets split 65/35. Example: $1,200/month daycare. Combined income $120K (Party 1 makes $78K, Party 2 makes $42K). Party 1 pays $780, Party 2 pays $420. You can also agree to 50/50 — proportional is just the default.',
      },
      {
        h: 'Retroactive support and arrears',
        p: 'If you separated a while ago and one parent owed support but has not been paying, the unpaid amount is called arrears. It is still owed. Three options: calculate and pay (figure out what was owed each month, total it, pay over time), negotiated lump sum (pick a number that feels fair to both), or mutual release (both parties wave the past — usually used when neither party was clean).',
      },
    ],
  },

  {
    slug: 'spousal-support',
    eyebrow: 'Tab 6',
    title: 'Spousal Support: Structure, Amount, Duration, and Reviews',
    description: 'How spousal support works under the SSAG in Ontario — who pays whom, how much, for how long, and what structure to choose (release, time-limited, indefinite, lump sum).',
    keywords: ['spousal support Ontario', 'SSAG spousal support', 'spousal support duration Ontario', 'Rule of 65 spousal support', 'spousal support release Ontario'],
    intro: 'Spousal support is between the two of you, not for the kids — that is Tab 5. The SSAG framework gives a range, not a single answer.',
    body: [
      {
        h: 'Who pays whom',
        p: 'Whichever party earned significantly more during the relationship usually pays. If you both earned about the same, often nobody pays. There is no rule that one gender pays the other — it is purely about the income difference.',
      },
      {
        h: 'How much — low, mid, high',
        p: 'The SSAG gives a range. Most agreements use the mid. Low fits when the payor has high necessary expenses (a big mortgage they took on to keep the family home), the recipient is healthy and employed, or the marriage was short. High fits when the recipient gave up career years for the family, has health issues that limit earning, or there is long economic interdependence.',
      },
      {
        h: 'For how long',
        p: 'SSAG duration is based on relationship length. Rule of thumb: support runs for 50% to 100% of the length of the relationship. A 10-year marriage means 5 to 10 years of support. A 25-year marriage often means 12 years to indefinite. Rule of 65: if your age plus years married is 65 or more at separation, support is often indefinite. A 55-year-old who was married 15 years (55+15=70) usually gets indefinite support.',
      },
      {
        h: 'Structure — pick one',
        p: 'Complete mutual release (neither of you pays the other, ever — fits short marriages with similar incomes, but it is a one-way door). Time-limited (pay $X per month for N years, then it ends — fits medium-length marriages where the recipient needs a bridge to self-sufficiency). Indefinite (pay $X per month with no fixed end — fits long marriages, big income gaps, Rule of 65 cases). Lump sum (one payment, done forever — fits clean breaks where there is enough cash or equity).',
      },
      {
        h: 'Review clauses',
        p: 'Even with a fixed monthly amount, you can build in regular reviews. Annual review (every year, exchange tax returns and adjust support). Every two years. On material change only (job loss, raise, retirement, illness, new baby). For most agreements, annual exchange of tax returns plus recalculation is standard.',
      },
    ],
  },

  {
    slug: 'additional-terms',
    eyebrow: 'Tab 7',
    title: 'Additional Terms: Insurance, Disclosure, Tax, and Dispute Resolution',
    description: 'The short but important clauses at the end of an Ontario separation agreement — life insurance, future disclosure, tax provisions, and dispute resolution.',
    keywords: ['life insurance separation agreement', 'dispute resolution clause separation', 'Canada Child Benefit separation', 'mediation clause separation agreement'],
    intro: 'The short stuff at the end. Worth reading — these clauses prevent expensive disputes later.',
    body: [
      {
        h: 'Life insurance to secure support',
        p: 'If one of you is paying ongoing support, the receiver wants security: what happens if the payor dies? The clause: the payor maintains a life insurance policy with the receiver as beneficiary, for at least $X. Typical amount is enough to cover the remaining years of support — 10 years of $2K/month child support equals a $240K policy. Skip this only if there are no dependents needing protection.',
      },
      {
        h: 'Financial disclosure going forward',
        p: 'Locks in how often you will exchange income updates after the agreement is signed. Annual exchange of tax returns and NOAs is standard. Without this, the recipient has to chase the payor for updates — exactly the dynamic the agreement is supposed to avoid.',
      },
      {
        h: 'Tax provisions',
        p: 'Canada Child Benefit (CCB) — who claims it. In shared parenting both parents can claim a share. In sole parenting the primary parent claims it. Eligible Dependant Credit — a tax credit one of you can claim for a child. In shared parenting, you can split children or alternate years. Spousal support tax treatment — periodic monthly support is tax-deductible for the payor and taxable for the recipient. Lump sums are not.',
      },
      {
        h: 'Dispute resolution',
        p: 'What happens if you disagree later. Step 1: direct conversation. Step 2: mediation (most clauses set a deadline like "we pick a mediator within 30 days"). Step 3: arbitration or court — last resort. You can also nominate a parenting coordinator — a professional who can resolve small parenting disputes without you going to mediation every time.',
      },
    ],
  },

  {
    slug: 'signing',
    eyebrow: 'Tabs 8 and 9',
    title: 'Preview and Sign Your Ontario Separation Agreement',
    description: 'How to review the final rendered agreement, download the PDF, and sign electronically. Why independent legal advice matters before signing.',
    keywords: ['electronic signature separation agreement Ontario', 'independent legal advice Ontario', 'sign separation agreement online'],
    intro: 'You are almost done. The last two tabs are review and signature.',
    body: [
      {
        h: 'Preview — read it end to end',
        p: 'Read the whole document, beginning to end. Do not skim. Check names spelled right, dates correct, kids\' names spelled right, schedule reads how you expect, support numbers match what you negotiated, Section 7 expenses include the right things. If anything looks off, go back to the relevant tab and fix it. The document regenerates automatically. Download the PDF and print it — get fresh eyes on it.',
      },
      {
        h: 'Independent legal advice (ILA)',
        p: 'Before signing, each of you should get ILA — a lawyer who works for you (not the other party) reviews the agreement and tells you what you are agreeing to. Many lawyers do ILA for a flat fee ($300–$800 in Ontario). ILA is not legally required, but it is the single biggest thing that makes the agreement bulletproof. Without it, the other party can later argue "I did not understand what I was signing."',
      },
      {
        h: 'Electronic signatures',
        p: 'Both of you sign electronically inside the app. Both signatures are time-stamped and recorded. Once both signatures are in, the agreement is binding. Electronic signatures are legally valid for separation agreements in Ontario under the Electronic Commerce Act.',
      },
    ],
  },
]

// Glossary — short single-concept pages. Each gets its own URL and ranks
// independently for the specific term.
export const GLOSSARY = [
  {
    slug: 'cohabitation-date',
    term: 'Cohabitation Date',
    title: 'What Is the Cohabitation Date? — Ontario Family Law',
    description: 'The cohabitation date is when you and your partner started living together as a couple. It matters for spousal support duration and common-law property claims.',
    keywords: ['cohabitation date Ontario', 'common-law cohabitation date', 'when does cohabitation start'],
    short: 'Cohabitation date is the day you and your partner started living together as a couple — with the intention to be in a committed relationship, not just as roommates.',
    body: 'In Ontario, the length of your relationship affects how long spousal support runs. For common-law couples, "relationship length" is measured from cohabitation. For married couples, it is measured from cohabitation or marriage, whichever was earlier. Real-life examples: you started dating in 2018, moved in together in 2020, married in 2022 — your cohabitation date is 2020. You shared an apartment with a roommate for two years before you started dating — cohabitation starts when the relationship started, not when you moved in. You and your spouse kept separate homes until 2023 even though you were married in 2022 — your cohabitation date is 2023. Get this right because it affects support duration directly.',
    related: ['date-of-separation', 'rule-of-65', 'ssag'],
  },
  {
    slug: 'date-of-separation',
    term: 'Date of Separation',
    title: 'What Is the Date of Separation? — Ontario Family Law',
    description: 'The date of separation is the day you decided the relationship was over. It is the most important date in any Ontario separation agreement.',
    keywords: ['date of separation Ontario', 'how to determine separation date', 'separation date family law'],
    short: 'The date of separation is the day you and your partner decided the relationship was over. Almost every clause in your separation agreement refers back to it.',
    body: 'Property values are calculated as of the separation date. Support clocks start ticking from it. Tax filings may need to reflect it. If you said the words and one of you moved out, that is your date. If you said the words but kept living together "as roommates" while figuring things out, the date is usually the date of the conversation — as long as you actually stopped functioning as a couple (separate bedrooms, separate finances, no socializing together). Pick the day that feels most accurate. The other party needs to agree to it too.',
    related: ['cohabitation-date', 'equalization-payment', 'net-family-property'],
  },
  {
    slug: 'equalization-payment',
    term: 'Equalization Payment',
    title: 'What Is an Equalization Payment? — Ontario Property Division',
    description: 'An equalization payment is a single cash payment that levels out each spouse\'s Net Family Property after separation. Ontario family law explained in plain English.',
    keywords: ['equalization payment Ontario', 'how is equalization calculated', 'property equalization Ontario'],
    short: 'An equalization payment is one cash payment from one spouse to the other to make sure each of you walks out of the marriage with the same value of property growth.',
    body: 'On the date of separation, calculate each spouse\'s Net Family Property — assets minus debts, minus what they brought into the marriage. Whoever has the higher NFP owes the other half the difference. Example: Party 1 walks out with $300K of growth during the marriage. Party 2 walks out with $100K. Difference is $200K. Party 1 owes Party 2 $100K to make it even. The payment can be made in cash, by transferring property of equivalent value, or over time with interest. It is paid once and ends the property division for good.',
    related: ['net-family-property', 'date-of-separation', 'matrimonial-home'],
  },
  {
    slug: 'net-family-property',
    term: 'Net Family Property',
    title: 'What Is Net Family Property (NFP)? — Ontario Explained',
    description: 'Net Family Property is the calculation Ontario uses to figure out how to divide assets and debts in a separation. It drives the equalization payment.',
    keywords: ['Net Family Property Ontario', 'NFP calculation', 'how to calculate NFP'],
    short: 'Net Family Property is what each of you has — assets minus debts — on the separation date, minus what you brought into the marriage.',
    body: 'NFP measures what you built up together as a couple. The formula: (total assets on the date of separation) minus (total debts on the date of separation) minus (the value of assets minus debts on the date of marriage) equals NFP. Each spouse has their own NFP. The spouse with the higher NFP pays the spouse with the lower NFP half the difference — this is the equalization payment. Common exclusions: inheritances and gifts from third parties (if kept separate), personal injury awards, and life insurance proceeds. The matrimonial home is treated specially — it cannot be excluded even if one spouse owned it before the marriage.',
    related: ['equalization-payment', 'matrimonial-home', 'date-of-separation'],
  },
  {
    slug: 'section-7-expenses',
    term: 'Section 7 Expenses',
    title: 'What Are Section 7 Expenses? — Special and Extraordinary Expenses for Children',
    description: 'Section 7 expenses are the special and extraordinary child expenses on top of the basic Federal Child Support Table amount. They are split between parents proportionally to income.',
    keywords: ['Section 7 expenses', 'special and extraordinary expenses', 'extraordinary child expenses Ontario', 'daycare child support'],
    short: 'Section 7 expenses are the "extras" — daycare, medical, post-secondary, big extracurriculars — that are paid on top of the basic monthly child support amount, usually split based on each parent\'s share of combined income.',
    body: 'Section 7 of the Federal Child Support Guidelines lists six categories: childcare needed for work or education; medical and dental insurance premiums for the child; health expenses over $100/year not covered by insurance (braces, glasses, therapy); extraordinary education expenses; post-secondary education; and extraordinary extracurricular expenses. Each parent pays their share based on income. Example: combined household income is $120K. Party 1 makes $78K (65%), Party 2 makes $42K (35%). A $1,200/month daycare bill is split $780/$420. You can also agree to a 50/50 split or any other ratio — proportional is just the default.',
    related: ['ssag', 'federal-child-support-tables', 'independent-legal-advice'],
  },
  {
    slug: 'rule-of-65',
    term: 'Rule of 65',
    title: 'What Is the Rule of 65? — Indefinite Spousal Support Explained',
    description: 'The Rule of 65 is an SSAG rule that can make spousal support indefinite when the recipient\'s age plus years of marriage equals 65 or more at separation.',
    keywords: ['Rule of 65 spousal support', 'indefinite spousal support SSAG', 'Ontario spousal support age'],
    short: 'The Rule of 65 says spousal support is often indefinite when the recipient\'s age plus the length of the marriage adds up to 65 or more at the date of separation.',
    body: 'The SSAG framework normally caps spousal support duration at the length of the relationship (often half to all of it). The Rule of 65 is an exception: if you are 55 and were married for 15 years (55 + 15 = 70), you usually get indefinite support — meaning no fixed end date. Indefinite does not mean forever. Support still ends on a material change of circumstances: payor retires, recipient remarries or becomes self-sufficient, one party dies, or income changes significantly. The rule recognizes that an older spouse with limited working years left is unlikely to rebuild financial independence after a long marriage.',
    related: ['ssag', 'spousal-support-duration', 'cohabitation-date'],
  },
  {
    slug: 'ssag',
    term: 'SSAG',
    title: 'What Are the Spousal Support Advisory Guidelines (SSAG)?',
    description: 'The SSAG is the framework Ontario family lawyers and judges use to calculate spousal support amounts and duration. It produces a low/mid/high range, not a single number.',
    keywords: ['SSAG explained', 'Spousal Support Advisory Guidelines', 'SSAG Ontario', 'how SSAG works'],
    short: 'The Spousal Support Advisory Guidelines (SSAG) is a non-binding framework that gives a low, mid, and high range for spousal support based on income, relationship length, and whether children are involved.',
    body: 'SSAG is not a law — it is advisory. But Ontario courts and family lawyers use it as the standard reference. Two formulas: "without-children" formula (used when there are no minor children to support) and "with-children" formula (used when child support is also being paid, which reduces the spousal support range to leave room for child support). The framework produces three numbers: low (suitable when the payor has high necessary expenses), mid (the default most agreements use), and high (suitable when the recipient gave up career years for the family). Duration ranges from 50% to 100% of the length of the relationship, with indefinite support kicking in under the Rule of 65.',
    related: ['rule-of-65', 'federal-child-support-tables', 'spousal-support-duration'],
  },
  {
    slug: 'federal-child-support-tables',
    term: 'Federal Child Support Tables',
    title: 'Federal Child Support Tables — How Child Support Is Calculated in Ontario',
    description: 'The Federal Child Support Tables set the monthly child support amount based on the payor\'s income, number of children, and province. They are mandatory unless a judge approves an exception.',
    keywords: ['Federal Child Support Tables', 'child support amount Ontario', 'CSG tables 2025', 'how is child support calculated Ontario'],
    short: 'The Federal Child Support Tables are the official Canadian schedule that sets the basic monthly amount of child support based on the payor\'s annual income, the number of children, and the province.',
    body: 'The Tables are part of the Federal Child Support Guidelines. They are mandatory: a judge can refuse to approve a separation agreement that pays less than the Table amount without a strong reason. Going above the Table is fine. The Tables have been updated several times — 2006, 2011, 2017, and 2025. The version that applies depends on your separation date. Most family law software uses the wrong table if it has not been updated for the 2025 changes. The Tables only cover the basic monthly amount — special and extraordinary expenses (Section 7) are paid on top.',
    related: ['section-7-expenses', 'ssag', 'independent-legal-advice'],
  },
  {
    slug: 'independent-legal-advice',
    term: 'Independent Legal Advice',
    title: 'What Is Independent Legal Advice (ILA)? — And Why You Need It Before Signing',
    description: 'Independent legal advice is when each party to a separation agreement has their own lawyer review the document before signing. It is the single biggest thing that makes the agreement enforceable.',
    keywords: ['independent legal advice separation', 'ILA Ontario family law', 'why do I need a lawyer separation agreement'],
    short: 'Independent legal advice means each of you has your own lawyer (not the same one, not the other party\'s lawyer) review the separation agreement before signing.',
    body: 'ILA is not legally required to sign a separation agreement in Ontario. But it is the single biggest thing that makes the agreement bulletproof. Without ILA, the other party can later argue "I did not understand what I was signing" or "I was pressured into it" — and they might win. With ILA, those arguments are nearly impossible to make. Most Ontario family lawyers will do ILA for a flat fee — typically $300 to $800 per party, depending on the complexity. The lawyer reviews the agreement, explains what each clause means, points out risks, and signs a certificate confirming the review. That certificate gets attached to the agreement.',
    related: ['ssag', 'federal-child-support-tables', 'date-of-separation'],
  },
  {
    slug: 'matrimonial-home',
    term: 'Matrimonial Home',
    title: 'What Is the Matrimonial Home? — Special Treatment in Ontario',
    description: 'The matrimonial home gets special protection under Ontario family law — it cannot be excluded from equalization, even if one spouse owned it before marriage.',
    keywords: ['matrimonial home Ontario', 'matrimonial home rights', 'matrimonial home equalization'],
    short: 'The matrimonial home is the home where you and your spouse ordinarily lived together at the time of separation. Ontario treats it specially — it is fully included in equalization even if one of you owned it before marriage.',
    body: 'A spouse cannot exclude the matrimonial home from Net Family Property even if they brought it into the marriage. This is different from every other asset. So if one spouse owned the family home before the marriage, the entire value at the date of separation goes into the NFP calculation — not just the growth during the marriage. Both spouses also have an equal right to possess the matrimonial home during the marriage, even if only one is on title. A spouse cannot sell, mortgage, or lease the matrimonial home without the other\'s consent during the marriage. After separation, you typically deal with the home by selling and splitting, having one spouse buy out the other, or transferring title as part of overall equalization.',
    related: ['net-family-property', 'equalization-payment', 'date-of-separation'],
  },
  {
    slug: 'spousal-support-duration',
    term: 'Spousal Support Duration',
    title: 'How Long Does Spousal Support Last in Ontario?',
    description: 'Spousal support duration in Ontario is set by the SSAG. The general rule is half to all of the relationship length, with indefinite support under the Rule of 65.',
    keywords: ['spousal support duration Ontario', 'how long is spousal support', 'when does spousal support end'],
    short: 'Spousal support duration under the SSAG runs from half to all of the relationship length, with indefinite support possible under the Rule of 65.',
    body: 'A 10-year marriage usually produces 5 to 10 years of spousal support. A 25-year marriage usually produces 12 years to indefinite. Indefinite does not mean forever — it just means no fixed end date. Support still ends on retirement of the payor, remarriage of the recipient, recipient becoming self-sufficient, or a material change of circumstances. Some couples agree to a lump sum instead, which buys out future support obligations in one payment. Others agree to a complete mutual release — neither party can ever ask for spousal support — common in short marriages with similar incomes. The right structure depends on relationship length, income gap, age, and how clean a break both parties want.',
    related: ['ssag', 'rule-of-65', 'cohabitation-date'],
  },
]

// Resolve a related slug to a full glossary entry (for cross-linking).
export function findGlossary(slug) {
  return GLOSSARY.find((g) => g.slug === slug)
}

export function findSection(slug) {
  return LEARN_SECTIONS.find((s) => s.slug === slug)
}
