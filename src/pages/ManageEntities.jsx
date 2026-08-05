import { useMemo, useState } from 'react'
import { toMonthly, formatCurrency } from '../lib/frequency'
import { Card, SectionTitle } from '../components/ui'

const BLANK = { name: '', sort_order: 0 }

export default function ManageEntities({ data }) {
  const { entities, lineItems, upsertEntity, deleteEntity } = data
  const [editing, setEditing] = useState(null) // null | 'new' | entity id
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const usageByEntity = useMemo(() => {
    const map = {}
    for (const li of lineItems) {
      if (!li.entity_id) continue
      map[li.entity_id] = (map[li.entity_id] || 0) + 1
    }
    return map
  }, [lineItems])

  const monthlyByEntity = useMemo(() => {
    const map = {}
    for (const li of lineItems) {
      if (!li.entity_id || li.flow_type !== 'expense' || li.is_active === false) continue
      map[li.entity_id] = (map[li.entity_id] || 0) + toMonthly(li.base_amount, li.base_frequency)
    }
    return map
  }, [lineItems])

  function startNew() {
    setEditing('new')
    setError(null)
    setForm({ name: '', sort_order: entities.length })
  }

  function startEdit(entity) {
    setEditing(entity.id)
    setError(null)
    setForm({ name: entity.name, sort_order: entity.sort_order })
  }

  function cancel() {
    setEditing(null)
    setForm(BLANK)
    setError(null)
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = { name: form.name.trim(), sort_order: Number(form.sort_order) || 0 }
      if (editing !== 'new') payload.id = editing
      await upsertEntity(payload)
      cancel()
    } catch (err) {
      setError(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function remove(entity) {
    const count = usageByEntity[entity.id] || 0
    const message =
      count > 0
        ? `"${entity.name}" is used by ${count} line item${count === 1 ? '' : 's'}. Deleting it will leave those items unassigned, not delete them. Continue?`
        : `Delete "${entity.name}"?`
    if (!confirm(message)) return
    await deleteEntity(entity.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-(family-name:--font-display) text-3xl mb-1">Manage entities</h1>
          <p className="text-(--color-ink-soft)">The books you track expenses and income against.</p>
        </div>
        {editing === null && (
          <button
            onClick={startNew}
            className="rounded-md px-4 py-2 text-sm font-medium text-white"
            style={{ background: 'var(--color-ledger)' }}
          >
            + Add entity
          </button>
        )}
      </div>

      {editing && (
        <Card>
          <SectionTitle>{editing === 'new' ? 'New entity' : 'Edit entity'}</SectionTitle>
          <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="block mb-1 text-(--color-ink-soft)">Name</span>
              <input
                required
                autoFocus
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="block text-sm">
              <span className="block mb-1 text-(--color-ink-soft)">Sort order</span>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              />
            </label>
            {error && (
              <p className="sm:col-span-2 text-sm rounded-md px-3 py-2" style={{ background: 'var(--color-warn-soft)', color: 'var(--color-warn)' }}>
                {error}
              </p>
            )}
            <div className="sm:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                style={{ background: 'var(--color-ledger)' }}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={cancel} className="rounded-md px-4 py-2 text-sm text-(--color-ink-soft)">
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
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium text-right">Line items</th>
              <th className="px-4 py-3 font-medium text-right">Monthly expenses</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {entities.map((entity) => (
              <tr key={entity.id} className="border-b last:border-0" style={{ borderColor: 'var(--color-hairline)' }}>
                <td className="px-4 py-2.5">{entity.name}</td>
                <td className="px-4 py-2.5 text-right text-(--color-ink-soft)">{usageByEntity[entity.id] || 0}</td>
                <td className="px-4 py-2.5 text-right font-figures">
                  {formatCurrency(monthlyByEntity[entity.id] || 0)}
                </td>
                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                  <button onClick={() => startEdit(entity)} className="text-(--color-ledger) mr-3">Edit</button>
                  <button onClick={() => remove(entity)} className="text-(--color-warn)">Delete</button>
                </td>
              </tr>
            ))}
            {entities.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-(--color-ink-soft)">No entities yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
