import { useState } from 'react'
import { formatCurrency } from '../lib/frequency'
import { Card, SectionTitle } from '../components/ui'

const BLANK = { name: '', entity_id: '', category_id: '', amount: '', occurred_on: new Date().toISOString().slice(0, 10), notes: '' }

export default function Incidentals({ data }) {
  const { entities, categories, incidentals, upsertIncidental, deleteIncidental } = data
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)

  const entityName = (id) => entities.find((e) => e.id === id)?.name || '—'
  const categoryName = (id) => categories.find((c) => c.id === id)?.name || '—'
  const ytdTotal = incidentals
    .filter((i) => new Date(i.occurred_on).getFullYear() === new Date().getFullYear())
    .reduce((a, i) => a + Number(i.amount || 0), 0)

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await upsertIncidental({
        ...form,
        amount: Number(form.amount) || 0,
        entity_id: form.entity_id || null,
        category_id: form.category_id || null,
      })
      setForm(BLANK)
      setAdding(false)
    } finally {
      setSaving(false)
    }
  }

  async function remove(id) {
    if (!confirm('Delete this incidental?')) return
    await deleteIncidental(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-(family-name:--font-display) text-3xl mb-1">Incidentals</h1>
          <p className="text-(--color-ink-soft)">
            One-off, non-recurring spend — repairs, gifts, one-time travel. Year-to-date: {formatCurrency(ytdTotal)}
          </p>
        </div>
        <button
          onClick={() => setAdding((a) => !a)}
          className="rounded-md px-4 py-2 text-sm font-medium text-white"
          style={{ background: 'var(--color-ledger)' }}
        >
          + Add incidental
        </button>
      </div>

      {adding && (
        <Card>
          <SectionTitle>New incidental</SectionTitle>
          <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="block text-sm">
              <span className="block mb-1 text-(--color-ink-soft)">Name</span>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="block mb-1 text-(--color-ink-soft)">Amount</span>
              <input required type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="block mb-1 text-(--color-ink-soft)">Date</span>
              <input required type="date" value={form.occurred_on} onChange={(e) => setForm({ ...form, occurred_on: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="block mb-1 text-(--color-ink-soft)">Entity</span>
              <select value={form.entity_id} onChange={(e) => setForm({ ...form, entity_id: e.target.value })}
                className="w-full rounded-md border px-3 py-2 bg-(--color-paper-raised)" style={{ borderColor: 'var(--color-hairline)' }}>
                <option value="">—</option>
                {entities.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </label>
            <label className="block text-sm">
              <span className="block mb-1 text-(--color-ink-soft)">Category</span>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full rounded-md border px-3 py-2 bg-(--color-paper-raised)" style={{ borderColor: 'var(--color-hairline)' }}>
                <option value="">—</option>
                {categories.filter((c) => c.flow_type === 'expense').map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="block text-sm sm:col-span-2 lg:col-span-3">
              <span className="block mb-1 text-(--color-ink-soft)">Notes</span>
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </label>
            <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
              <button type="submit" disabled={saving} className="rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                style={{ background: 'var(--color-ledger)' }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={() => setAdding(false)} className="rounded-md px-4 py-2 text-sm text-(--color-ink-soft)">
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-(--color-ink-soft) border-b" style={{ borderColor: 'var(--color-hairline)' }}>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Entity</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium text-right">Amount</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {incidentals.map((i) => (
              <tr key={i.id} className="border-b last:border-0" style={{ borderColor: 'var(--color-hairline)' }}>
                <td className="px-4 py-2.5 text-(--color-ink-soft)">{i.occurred_on}</td>
                <td className="px-4 py-2.5">{i.name}</td>
                <td className="px-4 py-2.5 text-(--color-ink-soft)">{entityName(i.entity_id)}</td>
                <td className="px-4 py-2.5 text-(--color-ink-soft)">{categoryName(i.category_id)}</td>
                <td className="px-4 py-2.5 text-right font-figures">{formatCurrency(i.amount)}</td>
                <td className="px-4 py-2.5 text-right">
                  <button onClick={() => remove(i.id)} className="text-(--color-warn)">Delete</button>
                </td>
              </tr>
            ))}
            {incidentals.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-(--color-ink-soft)">No incidentals logged yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
