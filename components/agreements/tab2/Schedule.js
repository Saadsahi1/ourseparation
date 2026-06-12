'use client'
import TemplateSelector from '../shared/TemplateSelector'
import ParentingTimeMeter from './ParentingTimeMeter'
import ScheduleCustomWeekly from './ScheduleCustomWeekly'
import {
  PARENTING_SCHEDULE_TEMPLATES,
  SUMMER_SCHEDULE_TEMPLATES,
  TRANSPORTATION_TEMPLATES,
} from '@/lib/agreements/templateLibrary'
import FormField from '../shared/FormField'
import useDirtyBuffer, { useRegisterBuffer } from '../shared/useDirtyBuffer'

const cardStyle = {
  background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)',
  padding: '24px', marginBottom: '20px', boxShadow: 'var(--sh-xs)',
}

// Schedule — buffered for the non-grid templates (regular, summer,
// transportation) which all PUT to the same /parenting-schedules endpoint.
// The custom-weekly 4-week grid keeps its own local-state + debounced save
// path (managed inside ScheduleCustomWeekly itself); when the user is in
// custom_weekly mode, that component takes over and bypasses the buffer
// because grid clicks shouldn't accumulate as "unsaved changes" — they
// commit automatically.
export default function Schedule({ bundle, save, party1Name, party2Name, registry }) {
  const s = bundle.parentingSchedule || {}

  // Buffer the singleton parenting-schedule fields. The custom-weekly grid
  // calls `sched(patch)` directly (bypassing the buffer) since it manages
  // its own commit cycle.
  const buf = useDirtyBuffer({
    serverValues: s,
    onFlush: (patch) => save('parenting-schedules', { child_id: null, ...patch }),
    label: 'parenting-schedules',
  })
  useRegisterBuffer(registry, buf)

  // Immediate-save path for the custom-weekly grid only.
  const schedImmediate = (patch) => save('parenting-schedules', { child_id: null, ...patch })

  const v = (k, fallback) => {
    const val = buf.getValue(k)
    return val ?? fallback
  }

  const tplKey = v('regular_schedule_template')
  const tpl = PARENTING_SCHEDULE_TEMPLATES[tplKey]
  let p1Percent = 50, p2Percent = 50
  if (tpl?.party1TimePercent) {
    p1Percent = tpl.party1TimePercent(v('regular_schedule_variables', {}))
    p2Percent = 100 - p1Percent
  }

  const primaryParentOptions = [
    { value: 'party1', label: party1Name },
    { value: 'party2', label: party2Name },
  ]

  const regularVars = v('regular_schedule_variables', {})
  const subContext = {
    party1: party1Name,
    party2: party2Name,
    primaryParentName: regularVars?.primaryParent === 'party2' ? party2Name : party1Name,
    otherParentName: regularVars?.primaryParent === 'party2' ? party1Name : party2Name,
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
          value={{ template: tplKey, variables: tplKey === 'custom_weekly' ? {} : regularVars }}
          onChange={({ template, variables }) => {
            buf.setValue('regular_schedule_template', template)
            buf.setValue(
              'regular_schedule_variables',
              template === 'custom_weekly'
                ? (s.regular_schedule_template === 'custom_weekly' ? s.regular_schedule_variables : {})
                : variables
            )
          }}
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
        {tplKey === 'custom_weekly' ? (
          <ScheduleCustomWeekly
            schedule={s}
            onChange={schedImmediate}
            party1Name={party1Name}
            party2Name={party2Name}
          />
        ) : tplKey ? (
          <ParentingTimeMeter
            party1Percent={p1Percent}
            party2Percent={p2Percent}
            party1Name={party1Name}
            party2Name={party2Name}
          />
        ) : null}
      </div>

      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Summer Schedule</h3>
        <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
          How will summer school break be divided?
        </p>
        <TemplateSelector
          templates={SUMMER_SCHEDULE_TEMPLATES}
          value={{ template: v('summer_schedule_template'), variables: v('summer_schedule_variables', {}) }}
          onChange={({ template, variables }) => {
            buf.setValue('summer_schedule_template', template)
            buf.setValue('summer_schedule_variables', variables)
          }}
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
          value={{ template: v('transportation_template'), variables: v('transportation_variables', {}) }}
          onChange={({ template, variables }) => {
            buf.setValue('transportation_template', template)
            buf.setValue('transportation_variables', variables)
          }}
          substitutionContext={subContext}
          variableLabels={{ halfwayLocation: 'Halfway Meeting Location' }}
        />
        <FormField
          label="Default Pickup/Dropoff Location"
          value={v('pickup_dropoff_location', '')}
          onSave={(val) => buf.setValue('pickup_dropoff_location', val)}
          placeholder="e.g. children's school, party 1's home"
        />
      </div>
    </div>
  )
}
