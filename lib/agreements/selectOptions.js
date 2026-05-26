// Centralized dropdown option lists used across the agreement editor.
// Reduces free-text typing in favour of selection.

export const ONTARIO_CITIES = [
  'Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton', 'London',
  'Markham', 'Vaughan', 'Kitchener', 'Windsor', 'Richmond Hill', 'Oakville',
  'Burlington', 'Greater Sudbury', 'Oshawa', 'Barrie', 'St. Catharines',
  'Cambridge', 'Kingston', 'Whitby', 'Guelph', 'Ajax', 'Thunder Bay',
  'Waterloo', 'Brantford', 'Pickering', 'Niagara Falls', 'Peterborough',
  'Sault Ste. Marie', 'Sarnia', 'Welland', 'Halton Hills', 'Aurora',
  'Newmarket', 'Belleville', 'Cornwall', 'Stratford', 'Orangeville',
  'Caledon', 'Innisfil', 'Milton', 'North Bay', 'Timmins', 'Quinte West',
].map((c) => ({ value: c, label: c }))

export const OCCUPATION_OPTIONS = [
  // Professional
  { value: 'Software Engineer', label: 'Software Engineer / Developer' },
  { value: 'Engineer', label: 'Engineer (other)' },
  { value: 'Doctor', label: 'Doctor / Physician' },
  { value: 'Nurse', label: 'Nurse' },
  { value: 'Dentist', label: 'Dentist' },
  { value: 'Lawyer', label: 'Lawyer' },
  { value: 'Accountant', label: 'Accountant / CPA' },
  { value: 'Financial Analyst', label: 'Financial Analyst' },
  { value: 'Banker', label: 'Banker / Financial Advisor' },
  { value: 'Pharmacist', label: 'Pharmacist' },
  // Trades / Skilled labour
  { value: 'Electrician', label: 'Electrician' },
  { value: 'Plumber', label: 'Plumber' },
  { value: 'Carpenter', label: 'Carpenter' },
  { value: 'Mechanic', label: 'Mechanic' },
  { value: 'Construction Worker', label: 'Construction Worker' },
  { value: 'Welder', label: 'Welder' },
  // Education
  { value: 'Teacher', label: 'Teacher' },
  { value: 'Professor', label: 'Professor' },
  { value: 'Educational Assistant', label: 'Educational Assistant' },
  // Service
  { value: 'Police Officer', label: 'Police Officer' },
  { value: 'Firefighter', label: 'Firefighter' },
  { value: 'Paramedic', label: 'Paramedic' },
  { value: 'Truck Driver', label: 'Truck Driver' },
  { value: 'Retail Manager', label: 'Retail / Store Manager' },
  { value: 'Server', label: 'Server / Bartender' },
  { value: 'Customer Service Representative', label: 'Customer Service Rep' },
  // Office / Business
  { value: 'Manager', label: 'Manager' },
  { value: 'Sales Representative', label: 'Sales Representative' },
  { value: 'Marketing Specialist', label: 'Marketing Specialist' },
  { value: 'Administrative Assistant', label: 'Administrative Assistant' },
  { value: 'Project Manager', label: 'Project Manager' },
  { value: 'Consultant', label: 'Consultant' },
  { value: 'Business Owner', label: 'Business Owner / Self-Employed' },
  // Government
  { value: 'Civil Servant', label: 'Civil Servant / Government Employee' },
  // Status
  { value: 'Stay-at-Home Parent', label: 'Stay-at-Home Parent' },
  { value: 'Unemployed', label: 'Unemployed' },
  { value: 'Retired', label: 'Retired' },
  { value: 'Student', label: 'Student' },
  { value: 'Other', label: 'Other' },
]

export const PARENTAL_TITLE_OPTIONS = [
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'parent', label: 'Parent (gender-neutral)' },
]

export const DOC_TYPE_OPTIONS = [
  { value: 'tax_return', label: 'Tax Return (T1 General)' },
  { value: 'notice_of_assessment', label: 'Notice of Assessment' },
]

// Common section-7 expense descriptions, grouped by category, with a "Custom" fallback.
export const SECTION7_DESCRIPTION_OPTIONS = {
  childcare: [
    'Regular daycare', 'After-school care', 'March Break camp', 'Summer camp',
    'PA Day care', 'Recurring babysitting',
  ],
  medical: [
    'Prescription medications', 'Physiotherapy', 'Occupational therapy',
    'Speech therapy', 'Psychological therapy', 'Eye exams', 'Eyeglasses/contacts',
    'Hearing aids', 'Allergy treatments', 'Specialist visits',
  ],
  dental: ['Routine cleanings', 'X-rays', 'Fillings', 'Extractions'],
  orthodontic: ['Braces', 'Retainers', 'Orthodontic consultations', 'Invisalign'],
  extracurricular: [
    'Hockey registration', 'Soccer registration', 'Swimming lessons', 'Dance classes',
    'Gymnastics', 'Music lessons', 'Art classes', 'Martial arts', 'Baseball',
    'Basketball', 'Tennis lessons', 'Skiing/snowboarding', 'Skating lessons',
    'Theatre / drama', 'Coding classes', 'Language classes',
  ],
  post_secondary: [
    'Tuition', 'Textbooks', 'Residence / housing', 'Meal plan',
    'Student fees', 'Transportation to school', 'Laptop / technology',
  ],
  other: [
    'Tutoring', 'Educational testing', 'School trips', 'Uniforms',
    'Special dietary needs', 'Religious education',
  ],
}
