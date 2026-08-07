import { useMemo, useState } from 'react'
import { Card, Pill, SectionTitle } from '../components/ui'

const BLANK = { name: '', flow_type: 'expense' }

export default function ManageCategories({ data }) {
  const { categories, lineItems, upsertCategory, deleteCategory } = data
  const [filterFlow, setFilterFlow] = useState('expense')
  const [editing, setEditing] = useState(null) // null | 'new' | id
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const usageCount = useMemo(() => {
    const map = {}
    for (const li of lineItems) {
      if (!li.category_id) continue
      map[li.category_id] = (map[li.category_id] || 0) + 1
    }
    return map
  }, [lineItems])

  const visible = useMemo(
    () => categories.filter((c) => c.flow_type === filterFlow).sort((a, b) => a.name.localeCompare(b.name)),
    [categories, filterFlow]
  )

  function startNew() {
    setEditing('new')
    setError(null)
    setForm({ name: '', flow_type: filterFlow })
  }

  function startEdit(cat) {
    setEditing(cat.id)
    setError(null)
    setForm({ name: cat.name, flow_type: cat.flow_type })
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
      const payload = { name: form.name.trim(), flow_type: form.flow_type }
      if (editing !== 'new') payload.id = editing
      await upsertCategory(payload)
      cancel()
    } catch (err) {
      setError(err.message || 'Failed to save — this name may already exist for this flow type')
    } finally {
      setSaving(false)
    }
  }

  async function remove(cat) {
    const count = usageCount[cat.id] || 0
    const message =
      count > 0
        ? `"${cat.name}" is used by ${count} line item${count === 1 ? '' : 's'}. Deleting it will leave those items uncategorized rather than delete them. Continue?`
        : `Delete "${cat.name}"?`
    if (!confirm(message)) return
    await deleteCategory(cat.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-(family-name:--font-display) text-3xl mb-1">Manage categories</h1>
          <p className="text-(--color-ink-soft)">
            Add, rename, or remove the categories line items get grouped under.
          </p>
        </div>
        {editing === null && (
          <button
            onClick={startNew}
            className="rounded-md px-4 py-2 text-sm font-medium text-white"
            style={{ background: 'var(--color-ledger)' }}
          >
            + Add category
          </button>
        )}
      </div>

      <div className="flex gap-1">
        <button
          onClick={() => setFilterFlow('expense')}
          className="px-3 py-1.5 rounded-md text-sm font-medium"
          style={filterFlow === 'expense' ? { background: 'var(--color-ledger)', color: 'white' } : { color: 'var(--color-ink-soft)' }}
        >
          Expense categories
        </button>
        <button
          onClick={() => setFilterFlow('income')}
          className="px-3 py-1.5 rounded-md text-sm font-medium"
          style={filterFlow === 'income' ? { background: 'var(--color-ledger)', color: 'white' } : { color: 'var(--color-ink-soft)' }}
        >
          Income categories
        </button>
      </div>

      {editing && (
        <Card>
          <SectionTitle>{editing === 'new' ? 'New category' : 'Edit category'}</SectionTitle>
          <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="block mb-1 text-(--color-ink-soft)">Name</span>
              <input
                required
                autoFocus
                placeholder="e.g. Taxes"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="block text-sm">
              <span className="block mb-1 text-(--color-ink-soft)">Flow type</span>
              <select
                value={form.flow_type}
                onChange={(e) => setForm({ ...form, flow_type: e.target.value })}
                className="w-full rounded-md border px-3 py-2 bg-(--color-paper-raised)"
                style={{ borderColor: 'var(--color-hairline)' }}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
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
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((cat) => (
              <tr key={cat.id} className="border-b last:border-0" style={{ borderColor: 'var(--color-hairline)' }}>
                <td className="px-4 py-2.5">{cat.name}</td>
                <td className="px-4 py-2.5 text-right text-(--color-ink-soft)">{usageCount[cat.id] || 0}</td>
                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                  <button onClick={() => startEdit(cat)} className="text-(--color-ledger) mr-3">Edit</button>
                  <button onClick={() => remove(cat)} className="text-(--color-warn)">Delete</button>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-(--color-ink-soft)">
                  No {filterFlow} categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
