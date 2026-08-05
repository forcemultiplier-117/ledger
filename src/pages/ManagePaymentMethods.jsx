import { useMemo, useState } from 'react'
import { Card, Pill, SectionTitle } from '../components/ui'

const KIND_LABELS = {
  credit_card: 'Credit card',
  debit_card: 'Debit card',
  bank_account: 'Bank account',
  other: 'Other',
}

const BLANK = { name: '', last4: '', kind: 'credit_card', is_active: true }

export default function ManagePaymentMethods({ data }) {
  const { paymentMethods, lineItems, upsertPaymentMethod, deletePaymentMethod } = data
  const [editing, setEditing] = useState(null) // null | 'new' | id
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const usageCount = useMemo(() => {
    const map = {}
    for (const li of lineItems) {
      if (!li.payment_method_id) continue
      map[li.payment_method_id] = (map[li.payment_method_id] || 0) + 1
    }
    return map
  }, [lineItems])

  function startNew() {
    setEditing('new')
    setError(null)
    setForm(BLANK)
  }

  function startEdit(pm) {
    setEditing(pm.id)
    setError(null)
    setForm({ name: pm.name, last4: pm.last4 || '', kind: pm.kind, is_active: pm.is_active })
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
      const payload = {
        name: form.name.trim(),
        last4: form.last4.trim() || null,
        kind: form.kind,
        is_active: form.is_active,
      }
      if (editing !== 'new') payload.id = editing
      await upsertPaymentMethod(payload)
      cancel()
    } catch (err) {
      setError(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(pm) {
    await upsertPaymentMethod({ id: pm.id, is_active: !pm.is_active })
  }

  async function remove(pm) {
    const count = usageCount[pm.id] || 0
    const message =
      count > 0
        ? `"${pm.name}" is used by ${count} line item${count === 1 ? '' : 's'}. Deleting it will clear that reference on those items rather than delete them. Consider marking it inactive instead — continue with delete?`
        : `Delete "${pm.name}"?`
    if (!confirm(message)) return
    await deletePaymentMethod(pm.id)
  }

  const sorted = [...paymentMethods].sort((a, b) => (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-(family-name:--font-display) text-3xl mb-1">Manage payment methods</h1>
          <p className="text-(--color-ink-soft)">
            Cards and accounts you pay from. When a card is lost or reissued, mark the old one inactive
            rather than deleting it — past line items keep their history.
          </p>
        </div>
        {editing === null && (
          <button
            onClick={startNew}
            className="rounded-md px-4 py-2 text-sm font-medium text-white"
            style={{ background: 'var(--color-ledger)' }}
          >
            + Add payment method
          </button>
        )}
      </div>

      {editing && (
        <Card>
          <SectionTitle>{editing === 'new' ? 'New payment method' : 'Edit payment method'}</SectionTitle>
          <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <label className="block text-sm sm:col-span-2">
              <span className="block mb-1 text-(--color-ink-soft)">Name</span>
              <input
                required
                autoFocus
                placeholder="e.g. Chase Sapphire Reserve"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="block text-sm">
              <span className="block mb-1 text-(--color-ink-soft)">Last 4</span>
              <input
                placeholder="1234"
                maxLength={4}
                value={form.last4}
                onChange={(e) => setForm({ ...form, last4: e.target.value })}
              />
            </label>
            <label className="block text-sm">
              <span className="block mb-1 text-(--color-ink-soft)">Kind</span>
              <select
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value })}
                className="w-full rounded-md border px-3 py-2 bg-(--color-paper-raised)"
                style={{ borderColor: 'var(--color-hairline)' }}
              >
                {Object.entries(KIND_LABELS).map(([v, label]) => (
                  <option key={v} value={v}>{label}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm sm:col-span-2 lg:col-span-4">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-auto"
              />
              <span>Active</span>
            </label>
            {error && (
              <p className="sm:col-span-2 lg:col-span-4 text-sm rounded-md px-3 py-2" style={{ background: 'var(--color-warn-soft)', color: 'var(--color-warn)' }}>
                {error}
              </p>
            )}
            <div className="sm:col-span-2 lg:col-span-4 flex gap-3">
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
              <th className="px-4 py-3 font-medium">Kind</th>
              <th className="px-4 py-3 font-medium">Last 4</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Line items</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((pm) => (
              <tr key={pm.id} className="border-b last:border-0" style={{ borderColor: 'var(--color-hairline)', opacity: pm.is_active ? 1 : 0.55 }}>
                <td className="px-4 py-2.5">{pm.name}</td>
                <td className="px-4 py-2.5 text-(--color-ink-soft)">{KIND_LABELS[pm.kind]}</td>
                <td className="px-4 py-2.5 text-(--color-ink-soft) font-figures">{pm.last4 ? `••${pm.last4}` : '—'}</td>
                <td className="px-4 py-2.5">
                  <Pill tone={pm.is_active ? 'ledger' : 'incidental'}>{pm.is_active ? 'Active' : 'Inactive'}</Pill>
                </td>
                <td className="px-4 py-2.5 text-right text-(--color-ink-soft)">{usageCount[pm.id] || 0}</td>
                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                  <button onClick={() => toggleActive(pm)} className="text-(--color-ledger) mr-3">
                    {pm.is_active ? 'Deactivate' : 'Reactivate'}
                  </button>
                  <button onClick={() => startEdit(pm)} className="text-(--color-ledger) mr-3">Edit</button>
                  <button onClick={() => remove(pm)} className="text-(--color-warn)">Delete</button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-(--color-ink-soft)">No payment methods yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
