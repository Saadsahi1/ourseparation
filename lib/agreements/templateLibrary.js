// Pre-written legal text template library for the 9-tab agreement editor.
// Users select from dropdowns; only variables (numbers, dates) are typed.
// Party names are NEVER typed twice — always come from agreements table.

// =============================================================================
// DECISION-MAKING TEMPLATES
// =============================================================================

export const LEGAL_CUSTODY_TYPES = {
  joint: { label: 'Joint Decision-Making (Recommended)' },
  sole_party1: { label: 'Sole Decision-Making — Party 1' },
  sole_party2: { label: 'Sole Decision-Making — Party 2' },
}

export const DECISION_DOMAIN_OPTIONS = {
  joint: 'Joint — both parties decide together',
  consult: 'Consult — primary parent decides after consulting other',
  party1: 'Party 1 decides',
  party2: 'Party 2 decides',
}

export const COMMUNICATION_TEMPLATES = {
  app_weekly: {
    label: 'Dedicated parenting app, weekly check-ins',
    variables: ['appName', 'urgentResponseTime'],
    template: ({ appName, urgentResponseTime, party1, party2 }) =>
      `${party1} and ${party2} shall communicate about the children through the ${appName} parenting communication application, with weekly check-ins regarding the children's well-being, schooling, and activities. Urgent matters shall be addressed within ${urgentResponseTime}.`,
  },
  email_biweekly: {
    label: 'Email communication, bi-weekly updates',
    variables: ['emailAddress', 'urgentResponseTime'],
    template: ({ emailAddress, urgentResponseTime, party1, party2 }) =>
      `${party1} and ${party2} shall communicate about the children primarily by email at ${emailAddress}, with bi-weekly updates on the children's well-being and activities. Urgent matters shall be addressed within ${urgentResponseTime}.`,
  },
  phone_asneeded: {
    label: 'Phone calls as needed',
    variables: ['urgentResponseTime'],
    template: ({ urgentResponseTime, party1, party2 }) =>
      `${party1} and ${party2} shall communicate about the children by telephone as needed. Both parties agree to be reasonably available and to respond to urgent matters within ${urgentResponseTime}.`,
  },
  combined: {
    label: 'Combined — app for logistics, email for formal matters',
    variables: ['appName', 'emailAddress', 'urgentResponseTime'],
    template: ({ appName, emailAddress, urgentResponseTime, party1, party2 }) =>
      `${party1} and ${party2} shall use the ${appName} parenting app for day-to-day logistics regarding the children, and email at ${emailAddress} for formal matters requiring documentation. Urgent matters shall be addressed within ${urgentResponseTime}.`,
  },
}

// =============================================================================
// PARENTING SCHEDULE TEMPLATES
// =============================================================================

export const PARENTING_SCHEDULE_TEMPLATES = {
  primary_residence_only: {
    label: 'Primary Residence Only',
    variables: ['primaryParent'],
    template: ({ primaryParentName, otherParentName }) =>
      `The children shall reside primarily with ${primaryParentName}. ${otherParentName} shall have parenting time as agreed between the parties from time to time, with reasonable notice.`,
    party1TimePercent: ({ primaryParent }) => primaryParent === 'party1' ? 80 : 20,
  },
  every_other_weekend: {
    label: 'Every Other Weekend',
    variables: ['primaryParent', 'pickupTime', 'returnTime', 'weeknight', 'weeknightReturnTime'],
    defaults: { pickupTime: '6:00 PM', returnTime: '6:00 PM', weeknightReturnTime: '7:00 PM', weeknight: 'Wednesday' },
    template: ({ primaryParentName, otherParentName, pickupTime, returnTime, weeknight, weeknightReturnTime }) =>
      `The children shall reside primarily with ${primaryParentName}. ${otherParentName} shall have parenting time every other weekend from Friday at ${pickupTime} until Sunday at ${returnTime}, and every ${weeknight} evening from after school until ${weeknightReturnTime}.`,
    party1TimePercent: ({ primaryParent }) => primaryParent === 'party1' ? 75 : 25,
  },
  week_on_week_off: {
    label: 'Week On / Week Off (50/50)',
    variables: ['exchangeDay', 'exchangeTime', 'exchangeLocation'],
    defaults: { exchangeDay: 'Sunday', exchangeTime: '6:00 PM' },
    template: ({ exchangeDay, exchangeTime, exchangeLocation, party1, party2 }) =>
      `${party1} and ${party2} shall share equal parenting time on a week-on / week-off basis. Exchanges shall occur every ${exchangeDay} at ${exchangeTime} at ${exchangeLocation}.`,
    party1TimePercent: () => 50,
  },
  '2-2-3': {
    label: '2-2-3 Rotating Schedule (50/50)',
    variables: ['exchangeTime', 'exchangeLocation'],
    defaults: { exchangeTime: '6:00 PM' },
    template: ({ exchangeTime, exchangeLocation, party1, party2 }) =>
      `${party1} and ${party2} shall share equal parenting time on a 2-2-3 rotating schedule: Party 1 has Monday and Tuesday, Party 2 has Wednesday and Thursday, and the parties alternate Friday-Sunday weekends. Exchanges shall occur at ${exchangeTime} at ${exchangeLocation}.`,
    party1TimePercent: () => 50,
  },
  '5-2-2-5': {
    label: '5-2-2-5 Rotating Schedule (50/50)',
    variables: ['exchangeTime', 'exchangeLocation'],
    defaults: { exchangeTime: '6:00 PM' },
    template: ({ exchangeTime, exchangeLocation, party1, party2 }) =>
      `${party1} and ${party2} shall share equal parenting time on a 5-2-2-5 rotating schedule. Exchanges shall occur at ${exchangeTime} at ${exchangeLocation}.`,
    party1TimePercent: () => 50,
  },
  custom_weekly: {
    label: 'Custom 4-Week Schedule',
    variables: ['weeks'],
    template: ({ party1, party2 }) =>
      `${party1} and ${party2} shall follow the custom four-week parenting schedule set out in Schedule B to this Agreement. Transitions and exchange details are specified per day.`,
  },
}

// =============================================================================
// SUMMER SCHEDULE TEMPLATES
// =============================================================================

export const SUMMER_SCHEDULE_TEMPLATES = {
  equal_split: {
    label: 'Equal Split (2 weeks alternating)',
    template: ({ party1, party2 }) =>
      `During the summer school break, ${party1} and ${party2} shall share parenting time in two-week alternating blocks. Each party shall provide notice of their intended vacation dates by May 1st of each year.`,
  },
  alternating_weeks: {
    label: 'Alternating Weeks',
    template: ({ party1, party2 }) =>
      `During the summer school break, ${party1} and ${party2} shall alternate weeks with the children, commencing the first full week of July.`,
  },
  extended_party1: {
    label: 'Extended time with Party 1',
    variables: ['durationWeeks'],
    template: ({ party1, party2, durationWeeks }) =>
      `${party1} shall have an extended block of ${durationWeeks} consecutive weeks with the children during the summer school break. The remaining summer schedule shall follow the regular parenting arrangement.`,
  },
  extended_party2: {
    label: 'Extended time with Party 2',
    variables: ['durationWeeks'],
    template: ({ party1, party2, durationWeeks }) =>
      `${party2} shall have an extended block of ${durationWeeks} consecutive weeks with the children during the summer school break. The remaining summer schedule shall follow the regular parenting arrangement.`,
  },
}

// =============================================================================
// TRANSPORTATION TEMPLATES
// =============================================================================

export const TRANSPORTATION_TEMPLATES = {
  party1_responsible: {
    label: 'Party 1 is responsible for all transportation',
    template: ({ party1 }) =>
      `${party1} shall be responsible for all transportation of the children between the parties' residences.`,
  },
  party2_responsible: {
    label: 'Party 2 is responsible for all transportation',
    template: ({ party2 }) =>
      `${party2} shall be responsible for all transportation of the children between the parties' residences.`,
  },
  picker_upper: {
    label: 'The parent picking up is responsible for transportation',
    template: () =>
      `The parent receiving the children shall be responsible for picking them up at the other parent's residence (or other agreed exchange location).`,
  },
  meet_halfway: {
    label: 'Parties meet halfway',
    variables: ['halfwayLocation'],
    template: ({ halfwayLocation }) =>
      `The parties shall meet at ${halfwayLocation} for all exchanges of the children.`,
  },
}

// =============================================================================
// HOLIDAY ARRANGEMENT TEMPLATES
// =============================================================================

export const HOLIDAY_ARRANGEMENT_TEMPLATES = {
  mother_odd_years: ({ holidayName, motherName, fatherName }) =>
    `${holidayName} shall be spent with ${motherName} in odd-numbered years and with ${fatherName} in even-numbered years.`,
  father_odd_years: ({ holidayName, motherName, fatherName }) =>
    `${holidayName} shall be spent with ${fatherName} in odd-numbered years and with ${motherName} in even-numbered years.`,
  mother_all_years: ({ holidayName, motherName }) =>
    `${holidayName} shall be spent with ${motherName} every year.`,
  father_all_years: ({ holidayName, fatherName }) =>
    `${holidayName} shall be spent with ${fatherName} every year.`,
  alternate_years: ({ holidayName, party1, party2 }) =>
    `${holidayName} shall alternate annually between ${party1} (odd-numbered years) and ${party2} (even-numbered years).`,
  alternate_years_reverse: ({ holidayName, party1, party2 }) =>
    `${holidayName} shall alternate annually between ${party2} (odd-numbered years) and ${party1} (even-numbered years).`,
  mother_always: ({ holidayName, motherName }) =>
    `${holidayName} shall be spent with ${motherName} every year (entire day).`,
  father_always: ({ holidayName, fatherName }) =>
    `${holidayName} shall be spent with ${fatherName} every year (entire day).`,
  follow_regular_schedule: ({ holidayName }) =>
    `${holidayName} shall follow the regular parenting schedule.`,
  both_parents: ({ holidayName }) =>
    `${holidayName} shall be celebrated jointly with both parents present where possible.`,
  share_equally: ({ holidayName }) =>
    `${holidayName} shall be shared equally, with the children spending a portion of the day with each parent.`,
  parent_of_the_day: ({ holidayName }) =>
    `${holidayName} shall be spent with whichever parent has the children that day under the regular schedule.`,
  equal_split: ({ holidayName, party1, party2 }) =>
    `${holidayName} shall be divided into equal blocks alternating between ${party1} and ${party2}.`,
  alternate_weeks: ({ holidayName, party1, party2 }) =>
    `${holidayName} shall alternate weekly between ${party1} and ${party2}.`,
  extended_party1: ({ holidayName, party1 }) =>
    `${holidayName} shall be primarily with ${party1} for an extended period.`,
  extended_party2: ({ holidayName, party2 }) =>
    `${holidayName} shall be primarily with ${party2} for an extended period.`,
}

// =============================================================================
// SPECIAL CLAUSE TEMPLATES
// =============================================================================

export const SPECIAL_CLAUSE_TEMPLATES = {
  right_first_refusal: {
    label: 'Right of First Refusal',
    variables: ['hours'],
    defaults: { hours: 4 },
    template: ({ hours }) =>
      `If either party requires childcare for more than ${hours} consecutive hours during their parenting time, they shall first offer the other parent the opportunity to care for the children before engaging a third party caregiver.`,
  },
  relocation: {
    label: 'Relocation Restriction',
    variables: ['distance', 'city', 'notice_days'],
    defaults: { distance: 50, notice_days: 60 },
    template: ({ distance, city, notice_days }) =>
      `Neither party shall relocate with the children more than ${distance} kilometres from ${city} without first providing the other party with no less than ${notice_days} days written notice, and either the written consent of the other party or an Order of the Court.`,
  },
  travel: {
    label: 'International Travel Consent',
    variables: [],
    template: () =>
      `Neither party shall travel internationally with the children without the prior written consent of the other party. Both parties agree to execute any necessary documentation, including Travel Consent Letters, to facilitate international travel.`,
  },
  new_partners: {
    label: 'Introduction of New Partners',
    variables: ['months'],
    defaults: { months: 6 },
    template: ({ months }) =>
      `Neither party shall introduce a new romantic partner to the children until they have been in an established relationship with that person for a minimum of ${months} months.`,
  },
  social_media: {
    label: 'Social Media',
    variables: [],
    template: () =>
      `Neither party shall post photographs or identifying information about the children on public social media platforms without the prior written consent of the other party.`,
  },
  other: {
    label: 'Other (Custom Clause)',
    variables: ['customText'],
    template: ({ customText }) => customText || '',
  },
}

// =============================================================================
// SPOUSAL SUPPORT TERM TEMPLATES
// =============================================================================

export const SPOUSAL_SUPPORT_TEMPLATES = {
  complete_release: {
    label: 'Complete Mutual Release',
    variables: [],
    enforcesZeroAmount: true,
    template: ({ party1, party2 }) =>
      `${party1} and ${party2} each release and forever discharge the other from any claim for spousal support, whether under the Divorce Act, the Family Law Act, or any other applicable legislation. Each party acknowledges they are aware of their rights under the Spousal Support Advisory Guidelines and the Family Law Act, and waives those rights with full knowledge of the consequences.`,
  },
  time_limited: {
    label: 'Time-Limited Support',
    variables: ['amount', 'start_date', 'end_date', 'review_date'],
    template: ({ payorName, recipientName, amount, start_date, end_date, review_date }) =>
      `${payorName} shall pay ${recipientName} spousal support of $${amount} per month commencing on ${start_date} and continuing until ${end_date}. The parties may review the quantum and duration of support on ${review_date}. Support terminates on ${end_date} with no right to further support, save and except in cases of material change in circumstances.`,
  },
  fixed_term: {
    label: 'Fixed Term Support',
    variables: ['amount', 'term_months', 'start_date'],
    template: ({ payorName, recipientName, amount, term_months, start_date }) =>
      `${payorName} shall pay ${recipientName} spousal support of $${amount} per month for a fixed term of ${term_months} months commencing ${start_date}. Support terminates automatically at the end of the ${term_months}-month period without further notice or Order.`,
  },
  indefinite_reviewable: {
    label: 'Indefinite Reviewable Support',
    variables: ['amount', 'review_frequency'],
    defaults: { review_frequency: 'annually' },
    template: ({ payorName, recipientName, amount, review_frequency }) =>
      `${payorName} shall pay ${recipientName} spousal support of $${amount} per month, payable on the first day of each month. Either party may apply to vary or terminate this support upon a material change of circumstances. The parties agree to review the quantum and duration of support ${review_frequency}.`,
  },
  support_with_security: {
    label: 'Support with Life Insurance Security',
    variables: ['amount', 'insurance_amount', 'policy_type'],
    template: ({ payorName, recipientName, amount, insurance_amount, policy_type }) =>
      `${payorName} shall pay ${recipientName} spousal support of $${amount} per month, payable on the first day of each month. ${payorName} shall maintain life insurance in the amount of $${insurance_amount} (${policy_type}), naming ${recipientName} as irrevocable beneficiary, for so long as spousal support is payable under this Agreement.`,
  },
}

export const SPOUSAL_TERMINATION_TRIGGERS = {
  cohabitation_90_days: 'Recipient cohabits in a conjugal relationship for 90 continuous days or more',
  remarriage: 'Recipient remarries',
  death: 'Death of either party',
  material_change: 'Material change in circumstances justifying termination',
  retirement: 'Payor reaches age 65 or normal retirement',
}

// =============================================================================
// MATRIMONIAL HOME DISPOSITION TEMPLATES
// =============================================================================

export const MATRIMONIAL_HOME_TEMPLATES = {
  sell: {
    label: 'List for sale — proceeds split equally',
    variables: ['listing_deadline', 'split_ratio'],
    defaults: { split_ratio: 'equally' },
    template: ({ listing_deadline, split_ratio, party1, party2 }) =>
      `The matrimonial home shall be listed for sale on or before ${listing_deadline} with a real estate agent mutually agreed by the parties. The net proceeds of sale (after realtor commissions, legal fees, and discharge of the mortgage) shall be divided ${split_ratio} between ${party1} and ${party2}.`,
  },
  buyout_party1: {
    label: 'Party 1 buys out Party 2',
    variables: ['buyout_amount', 'buyout_deadline'],
    template: ({ buyout_amount, buyout_deadline, party1, party2 }) =>
      `${party1} shall purchase ${party2}'s interest in the matrimonial home for $${buyout_amount}, to be paid in full on or before ${buyout_deadline}. Upon receipt of the buyout amount, ${party2} shall execute a transfer of title in favour of ${party1}.`,
  },
  buyout_party2: {
    label: 'Party 2 buys out Party 1',
    variables: ['buyout_amount', 'buyout_deadline'],
    template: ({ buyout_amount, buyout_deadline, party1, party2 }) =>
      `${party2} shall purchase ${party1}'s interest in the matrimonial home for $${buyout_amount}, to be paid in full on or before ${buyout_deadline}. Upon receipt of the buyout amount, ${party1} shall execute a transfer of title in favour of ${party2}.`,
  },
  exclusive_party1: {
    label: 'Party 1 has exclusive possession',
    variables: ['possession_until'],
    template: ({ possession_until, party1, party2 }) =>
      `${party1} shall have exclusive possession of the matrimonial home until ${possession_until}. ${party2} shall vacate the matrimonial home and shall not enter the property without the prior written consent of ${party1}.`,
  },
  exclusive_party2: {
    label: 'Party 2 has exclusive possession',
    variables: ['possession_until'],
    template: ({ possession_until, party1, party2 }) =>
      `${party2} shall have exclusive possession of the matrimonial home until ${possession_until}. ${party1} shall vacate the matrimonial home and shall not enter the property without the prior written consent of ${party2}.`,
  },
}

// =============================================================================
// PENSION DIVISION TEMPLATES
// =============================================================================

export const PENSION_DIVISION_TEMPLATES = {
  immediate: {
    label: 'Immediate division (Family Law Value transfer)',
    variables: ['pension_description'],
    template: ({ pension_description, party1, party2 }) =>
      `The pension(s) described as: ${pension_description}, shall be divided by way of an immediate Family Law Value transfer in accordance with the Pension Benefits Act. The administrator shall transfer the agreed share to the non-member spouse's locked-in retirement account.`,
  },
  deferred: {
    label: 'Deferred — upon retirement',
    variables: ['pension_description'],
    template: ({ pension_description, party1, party2 }) =>
      `The pension(s) described as: ${pension_description}, shall be divided on a deferred basis. The non-member spouse shall receive their agreed share of pension benefits commencing upon the member spouse's retirement, payable directly by the pension administrator if-and-when paid.`,
  },
  offset: {
    label: 'Offset — equivalent value paid from other assets',
    variables: ['offset_amount'],
    template: ({ offset_amount, party1, party2 }) =>
      `In lieu of dividing the pension(s), the pension-holding spouse shall retain their full pension entitlement, and pay the other spouse $${offset_amount} from other matrimonial assets as offsetting equalization. No further interest in the pension is conveyed.`,
  },
  separate: {
    label: 'Each party retains their own pension',
    variables: [],
    template: () =>
      `Each party shall retain their own pension plan(s) without division or claim by the other party. This treatment is reflected in the equalization calculation in Schedule A.`,
  },
}

// =============================================================================
// EQUALIZATION PAYMENT TEMPLATES
// =============================================================================

export const EQUALIZATION_PAYMENT_TEMPLATES = {
  lump_sum: {
    label: 'Single lump-sum payment',
    variables: ['due_date'],
    template: ({ payorName, recipientName, amount, due_date }) =>
      `${payorName} shall pay ${recipientName} the equalization payment of $${amount} in a single lump-sum payment on or before ${due_date}. Payment shall be by certified cheque, bank draft, or electronic funds transfer.`,
  },
  installments: {
    label: 'Equal monthly installments',
    variables: ['monthly_amount', 'num_months', 'start_date'],
    template: ({ payorName, recipientName, monthly_amount, num_months, start_date }) =>
      `${payorName} shall pay ${recipientName} the equalization payment of $${(monthly_amount * num_months).toFixed(2)} in ${num_months} equal monthly installments of $${monthly_amount}, commencing on ${start_date} and continuing on the same day of each month thereafter until paid in full.`,
  },
  structured: {
    label: 'Custom structured payments',
    variables: ['payments'],
    template: ({ payorName, recipientName, amount }) =>
      `${payorName} shall pay ${recipientName} the equalization payment of $${amount} on the structured payment schedule set out in this section.`,
  },
}

// =============================================================================
// LIFE INSURANCE TEMPLATES (Tab 7)
// =============================================================================

export const LIFE_INSURANCE_TEMPLATES = {
  basic_life_insurance: {
    label: 'Basic Life Insurance',
    variables: ['insured_party', 'coverage_amount', 'beneficiary'],
    template: ({ insuredName, coverage_amount, beneficiary }) =>
      `${insuredName} shall obtain and maintain life insurance in the amount of no less than $${coverage_amount}, naming ${beneficiary} as beneficiary, for so long as ${insuredName} has any support or financial obligation under this Agreement.`,
  },
  declining_insurance: {
    label: 'Declining Balance Insurance',
    variables: ['insured_party', 'initial_amount', 'decline_schedule'],
    template: ({ insuredName, initial_amount, decline_schedule }) =>
      `${insuredName} shall obtain and maintain life insurance with a declining benefit commencing at $${initial_amount}, declining in accordance with the following schedule: ${decline_schedule}.`,
  },
  support_tied_insurance: {
    label: 'Support-Tied Insurance',
    variables: ['insured_party', 'coverage_amount', 'beneficiary'],
    template: ({ insuredName, coverage_amount, beneficiary }) =>
      `${insuredName} shall obtain and maintain life insurance in the amount of no less than $${coverage_amount} naming ${beneficiary} as irrevocable beneficiary. This obligation shall terminate when all support obligations under this Agreement terminate.`,
  },
}

// =============================================================================
// FINANCIAL DISCLOSURE TEMPLATES (Tab 7)
// =============================================================================

export const DISCLOSURE_TEMPLATES = {
  annual_disclosure: {
    label: 'Annual Disclosure',
    variables: ['disclosure_date'],
    defaults: { disclosure_date: 'June 1st' },
    template: ({ disclosure_date }) =>
      `Each party shall provide to the other, on or before ${disclosure_date} of each year, their complete financial information including their most recent Notice of Assessment, T1 General Income Tax Return, and any other relevant financial statements. Either party may request a copy of the other's financial information at any time.`,
  },
  on_request_disclosure: {
    label: 'On-Request Disclosure',
    variables: ['response_days'],
    defaults: { response_days: 30 },
    template: ({ response_days }) =>
      `Either party may request financial disclosure from the other party at any time. The requested party shall provide their most recent Notice of Assessment and T1 General Income Tax Return within ${response_days} days of receiving such a request.`,
  },
  event_triggered_disclosure: {
    label: 'Event-Triggered Disclosure',
    variables: ['threshold_percentage'],
    defaults: { threshold_percentage: 10 },
    template: ({ threshold_percentage }) =>
      `Each party shall provide financial disclosure upon the occurrence of any of the following events: a change in employment, a change in income greater than ${threshold_percentage}%, the commencement of a new business or self-employment, or the receipt of a significant inheritance or gift.`,
  },
}

// =============================================================================
// TAX PROVISION TEMPLATES (Tab 7)
// =============================================================================

export const TAX_PROVISION_TEMPLATES = {
  standard_tax_allocation: {
    label: 'Standard Tax Allocation',
    variables: ['ccb_party'],
    template: ({ ccbPartyName }) =>
      `${ccbPartyName} shall be entitled to apply for and receive the Canada Child Benefit for the children of the relationship. The parties shall cooperate to file any necessary elections with the Canada Revenue Agency. Spousal support payments (if any) made pursuant to this Agreement shall be deductible by the payor and included in the income of the recipient pursuant to the Income Tax Act (Canada).`,
  },
  alternating_tax_credits: {
    label: 'Alternating Tax Credits',
    variables: ['first_year_party'],
    template: ({ firstYearPartyName, party1, party2 }) =>
      `The parties shall alternate claiming the children as eligible dependants for income tax purposes, with ${firstYearPartyName} claiming the children in the first year following separation, and the parties alternating in subsequent years. The Canada Child Benefit shall be paid to whichever party is entitled in each given year.`,
  },
  shared_tax_benefits: {
    label: 'Shared Tax Benefits',
    variables: ['children_count'],
    template: ({ children_count, party1, party2 }) =>
      `Where the parties share parenting time equally, they shall each claim ${children_count} child(ren) for tax purposes and shall cooperate in filing any required elections. The Canada Child Benefit shall be split equally between the parties.`,
  },
}

// =============================================================================
// DISPUTE RESOLUTION TEMPLATES (Tab 7)
// =============================================================================

export const DISPUTE_RESOLUTION_TEMPLATES = {
  mandatory_mediation: {
    label: 'Mandatory Mediation',
    variables: ['selection_days'],
    defaults: { selection_days: 30 },
    template: ({ selection_days }) =>
      `Any dispute arising from or relating to this Agreement shall first be submitted to mediation before either party may commence court proceedings. The parties shall jointly select a mediator within ${selection_days} days of a dispute arising. If the parties cannot agree, each party shall nominate a mediator and the two nominees shall appoint a third mediator who shall conduct the mediation. Mediation costs shall be shared equally between the parties.`,
  },
  mediation_arbitration: {
    label: 'Mediation-Arbitration',
    variables: [],
    template: () =>
      `Any dispute arising from or relating to this Agreement shall be resolved by mediation-arbitration before a certified family mediator-arbitrator. The mediation-arbitration process shall be conducted in accordance with the Arbitration Act, 1991 (Ontario). The mediator-arbitrator's decision shall be final and binding on the parties.`,
  },
  parenting_coordinator: {
    label: 'Parenting Coordinator',
    variables: [],
    template: () =>
      `The parties agree to appoint a Parenting Coordinator to assist in resolving day-to-day parenting disputes without court intervention. The Parenting Coordinator shall have authority to make binding decisions on minor parenting issues as defined by their engagement terms. The Parenting Coordinator's fees shall be shared equally between the parties.`,
  },
}

// =============================================================================
// SECTION 7 EXPENSE CATEGORIES
// =============================================================================

export const SECTION7_CATEGORIES = {
  childcare: {
    label: 'Childcare',
    suggestions: [
      'Regular daycare', 'After-school care', 'March Break camp', 'Summer camp',
      'PA Day care', 'Babysitting (recurring)',
    ],
  },
  medical: {
    label: 'Medical',
    suggestions: [
      'Prescription medications', 'Physiotherapy', 'Occupational therapy', 'Speech therapy',
      'Psychological therapy', 'Eye exams', 'Eyeglasses/contacts', 'Hearing aids',
      'Allergy treatments', 'Specialist visits',
    ],
  },
  dental: {
    label: 'Dental',
    suggestions: ['Routine dental cleanings', 'Dental X-rays', 'Tooth fillings', 'Dental extractions'],
  },
  orthodontic: {
    label: 'Orthodontic',
    suggestions: ['Braces', 'Retainers', 'Orthodontic consultations', 'Orthopedic appliances', 'Invisalign'],
  },
  extracurricular: {
    label: 'Extracurricular',
    suggestions: [
      'Hockey registration', 'Soccer registration', 'Swimming lessons', 'Dance classes',
      'Gymnastics', 'Music lessons', 'Art classes', 'Martial arts', 'Baseball',
      'Basketball', 'Volleyball', 'Tennis lessons', 'Skiing/snowboarding',
      'Skating lessons', 'Theater/drama', 'Coding classes', 'Chess club', 'Debate club',
      'Science club', 'Photography club', 'Language classes',
    ],
  },
  post_secondary: {
    label: 'Post-Secondary',
    suggestions: [
      'Tuition', 'Textbooks', 'Residence/housing', 'Meal plan',
      'Student fees', 'Transportation to school', 'Laptop/technology', 'Application fees',
    ],
  },
  other: {
    label: 'Other',
    suggestions: [
      'Tutoring', 'Educational testing', 'School trips', 'Uniforms',
      'Special dietary needs', 'Religious education',
    ],
  },
}

// =============================================================================
// PICKUP / DROPOFF TIME OPTIONS
// =============================================================================

export const PICKUP_TIMES = [
  { value: 'friday_after_school', label: 'Friday after school' },
  { value: 'friday_5pm', label: 'Friday at 5:00 PM' },
  { value: 'friday_6pm', label: 'Friday at 6:00 PM' },
  { value: 'saturday_9am', label: 'Saturday at 9:00 AM' },
  { value: 'saturday_12pm', label: 'Saturday at 12:00 PM' },
  { value: 'saturday_5pm', label: 'Saturday at 5:00 PM' },
  { value: 'sunday_9am', label: 'Sunday at 9:00 AM' },
  { value: 'day_before_9am', label: 'Day before at 9:00 AM' },
  { value: 'day_before_5pm', label: 'Day before at 5:00 PM' },
  { value: 'day_of_9am', label: 'Day of at 9:00 AM' },
  { value: 'day_of_12pm', label: 'Day of at 12:00 PM' },
  { value: 'day_of_5pm', label: 'Day of at 5:00 PM' },
  { value: 'evening_before_6pm', label: 'Evening before at 6:00 PM' },
  { value: 'morning_of_9am', label: 'Morning of at 9:00 AM' },
]

export const DROPOFF_TIMES = [
  { value: 'sunday_6pm', label: 'Sunday at 6:00 PM' },
  { value: 'monday_before_school', label: 'Monday before school' },
  { value: 'monday_9am', label: 'Monday at 9:00 AM' },
  { value: 'monday_6pm', label: 'Monday at 6:00 PM' },
  { value: 'tuesday_before_school', label: 'Tuesday before school' },
  { value: 'tuesday_9am', label: 'Tuesday at 9:00 AM' },
  { value: 'day_after_9am', label: 'Day after at 9:00 AM' },
  { value: 'day_after_6pm', label: 'Day after at 6:00 PM' },
  { value: 'day_of_6pm', label: 'Day of at 6:00 PM' },
  { value: 'day_of_9pm', label: 'Day of at 9:00 PM' },
  { value: 'evening_of_6pm', label: 'Evening of at 6:00 PM' },
  { value: 'next_morning_9am', label: 'Next morning at 9:00 AM' },
]

// =============================================================================
// AGREEMENT TYPE LABELS
// =============================================================================

export const AGREEMENT_TYPE_LABELS = {
  separation: 'SEPARATION AGREEMENT',
  cohabitation: 'COHABITATION AGREEMENT',
  prenup: 'PRENUPTIAL AGREEMENT (MARRIAGE CONTRACT)',
  postnup: 'POSTNUPTIAL AGREEMENT',
  amendment: 'AMENDMENT AGREEMENT',
}
