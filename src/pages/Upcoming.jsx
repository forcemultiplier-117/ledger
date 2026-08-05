import { useMemo, useState } from 'react'
import { nextDueDate, daysUntil, formatCurrency, FREQUENCIES } from '../lib/frequency'
import { Card, Pill } from '../components/ui'

const WINDOWS = [30, 60, 90]

export default function Upcoming({ data }) {
  const { lineItems, entities } = data
  const [window, setWindow] = useState(60)

  const entityName = (id) => entities.find((e) => e.id === id)?.name

  const upcoming = useMemo(() => {
    return lineItems
      .filter((li) => li.is_active !== false && li.last_paid_date)
      .map((li) => {
        const due = nextDueDate(li.last_paid_date, li.base_frequency)
        return { ...li, due, days: daysUntil(due) }
      })
      .filter((li) => li.due && li.days <= window)
      .sort((a, b) => a.days - b.days)
  }, [lineItems, window])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-(family-name:--font-display) text-3xl mb-1">Upcoming</h1>
          <p className="text-(--color-ink-soft)">
            Projected from each item's last-paid date and frequency — nothing here unless a line item has a last-paid date set.
          </p>
        </div>
        <div className="flex gap-1">
          {WINDOWS.map((w) => (
            <button
              key={w}
              onClick={() => setWindow(w)}
              className="px-3 py-1.5 rounded-md text-sm font-medium"
              style={
                window === w
                  ? { background: 'var(--color-ledger)', color: 'white' }
                  : { color: 'var(--color-ink-soft)' }
              }
            >
              {w} days
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-(--color-ink-soft) border-b" style={{ borderColor: 'var(--color-hairline)' }}>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Entity</th>
              <th className="px-4 py-3 font-medium">Frequency</th>
              <th className="px-4 py-3 font-medium">Next due</th>
              <th className="px-4 py-3 font-medium text-right">In</th>
              <th className="px-4 py-3 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {upcoming.map((li) => (
              <tr key={li.id} className="border-b last:border-0" style={{ borderColor: 'var(--color-hairline)' }}>
                <td className="px-4 py-2.5">{li.name}</td>
                <td className="px-4 py-2.5 text-(--color-ink-soft)">{entityName(li.entity_id) || '—'}</td>
                <td className="px-4 py-2.5 text-(--color-ink-soft)">
                  {FREQUENCIES.find((f) => f.value === li.base_frequency)?.label}
                </td>
                <td className="px-4 py-2.5">{li.due}</td>
                <td className="px-4 py-2.5 text-right">
                  <Pill tone={li.days <= 7 ? 'incidental' : 'ledger'}>{li.days} day{li.days === 1 ? '' : 's'}</Pill>
                </td>
                <td className="px-4 py-2.5 text-right font-figures">{formatCurrency(li.base_amount)}</td>
              </tr>
            ))}
            {upcoming.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-(--color-ink-soft)">
                  Nothing due in the next {window} days.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
