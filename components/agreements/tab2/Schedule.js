'use client'
import TemplateSelector from '../shared/TemplateSelector'
import ParentingTimeMeter from './ParentingTimeMeter'
import {
  PARENTING_SCHEDULE_TEMPLATES,
  SUMMER_SCHEDULE_TEMPLATES,
  TRANSPORTATION_TEMPLATES,
} from '@/lib/agreements/templateLibrary'
import FormField from '../shared/FormField'

const cardStyle = {
  background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)',
  padding: '24px', marginBottom: '20px', boxShadow: 'var(--sh-xs)',
}

export default function Schedule({ bundle, save, party1Name, party2Name }) {
  const s = bundle.parentingSchedule || {}

  const sched = (patch) => save('parenting-schedules', { child_id: null, ...patch })

  // Determine parenting time percentage from current template
  const tplKey = s.regular_schedule_template
  const tpl = PARENTING_SCHEDULE_TEMPLATES[tplKey]
  let p1Percent = 50, p2Percent = 50
  if (tpl?.party1TimePercent) {
    p1Percent = tpl.party1TimePercent(s.regular_schedule_variables || {})
    p2Percent = 100 - p1Percent
  }

  // For schedule selectors, we need a "primaryParent" select that resolves to party1Name/party2Name
  const primaryParentOptions = [
    { value: 'party1', label: party1Name },
    { value: 'party2', label: party2Name },
  ]

  // Resolve party names for live preview substitution
  const subContext = {
    party1: party1Name,
    party2: party2Name,
    primaryParentName: s.regular_schedule_variables?.primaryParent === 'party2' ? party2Name : party1Name,
    otherParentName: s.regular_schedule_variables?.primaryParent === 'party2' ? party1Name : party2Name,
  }

  return (
    <div>
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Regular Parenting Schedule</h3>
        <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
          Choose the day-to-day parenting time arrangement.
        </p>
        <TemplateSelector
          templates={PARENTING_SCHEDULE_TEMPLATES}
          value={{ template: s.regular_schedule_template, variables: s.regular_schedule_variables || {} }}
          onChange={({ template, variables }) => sched({
            regular_schedule_template: template,
            regular_schedule_variables: variables,
          })}
          substitutionContext={subContext}
          variableLabels={{
            primaryParent: 'Primary Parent',
            pickupTime: 'Friday Pickup Time',
            returnTime: 'Sunday Return Time',
            weeknight: 'Weeknight',
            weeknightReturnTime: 'Weeknight Return Time',
            exchangeDay: 'Exchange Day',
            exchangeTime: 'Exchange Time',
            exchangeLocation: 'Exchange Location',
          }}
          variableOptions={{
            primaryParent: primaryParentOptions,
            weeknight: [
              { value: 'Monday', label: 'Monday' }, { value: 'Tuesday', label: 'Tuesday' },
              { value: 'Wednesday', label: 'Wednesday' }, { value: 'Thursday', label: 'Thursday' },
            ],
            exchangeDay: [
              { value: 'Sunday', label: 'Sunday' }, { value: 'Monday', label: 'Monday' },
              { value: 'Friday', label: 'Friday' },
            ],
          }}
        />
        {tplKey && (
          <ParentingTimeMeter
            party1Percent={p1Percent}
            party2Percent={p2Percent}
            party1Name={party1Name}
            party2Name={party2Name}
          />
        )}
      </div>

      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Summer Schedule</h3>
        <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
          How will summer school break be divided?
        </p>
        <TemplateSelector
          templates={SUMMER_SCHEDULE_TEMPLATES}
          value={{ template: s.summer_schedule_template, variables: s.summer_schedule_variables || {} }}
          onChange={({ template, variables }) => sched({
            summer_schedule_template: template,
            summer_schedule_variables: variables,
          })}
          substitutionContext={subContext}
          variableLabels={{ durationWeeks: 'Duration (weeks)' }}
        />
      </div>

      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Transportation</h3>
        <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
          Who is responsible for getting the children to and from each parent?
        </p>
        <TemplateSelector
          templates={TRANSPORTATION_TEMPLATES}
          value={{ template: s.transportation_template, variables: s.transportation_variables || {} }}
          onChange={({ template, variables }) => sched({
            transportation_template: template,
            transportation_variables: variables,
          })}
          substitutionContext={subContext}
          variableLabels={{ halfwayLocation: 'Halfway Meeting Location' }}
        />
        <FormField
          label="Default Pickup/Dropoff Location"
          value={s.pickup_dropoff_location || ''}
          onSave={(v) => sched({ pickup_dropoff_location: v })}
          placeholder="e.g. children's school, party 1's home"
        />
      </div>
    </div>
  )
}
