import { useMemo, useState } from 'react'
import { FREQUENCIES, toMonthly, toAnnual, formatCurrency } from '../lib/frequency'
import { Card, Pill, SectionTitle, Logo } from '../components/ui'
import { guessDomain, uploadLogo } from '../lib/logo'
import { supabase } from '../lib/supabaseClient'

const BLANK = {
  name: '',
  entity_id: '',
  category_id: '',
  flow_type: 'expense',
  nature: 'fixed',
  base_amount: '',
  base_frequency: 'monthly',
  payment_method_id: '',
  domain: '',
  logo_url: '',
  last_paid_date: '',
  notes: '',
}

export default function LineItems({ data }) {
  const { entities, categories, lineItems, paymentMethods, upsertLineItem, deleteLineItem } = data
  const [filterEntity, setFilterEntity] = useState('all')
  const [filterNature, setFilterNature] = useState('all')
  const [editing, setEditing] = useState(null) // null | 'new' | item
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  const entityName = (id) => entities.find((e) => e.id === id)?.name || '—'
  const categoryName = (id) => categories.find((c) => c.id === id)?.name || '—'

  const filtered = useMemo(() => {
    return lineItems.filter((li) => {
      if (filterEntity !== 'all' && li.entity_id !== filterEntity) return false
      if (filterNature !== 'all' && li.nature !== filterNature) return false
      return true
    })
  }, [lineItems, filterEntity, filterNature])

  function startEdit(item) {
    setEditing(item.id)
    setForm({
      name: item.name,
      entity_id: item.entity_id || '',
      category_id: item.category_id || '',
      flow_type: item.flow_type,
      nature: item.nature,
      base_amount: item.base_amount,
      base_frequency: item.base_frequency,
      payment_method_id: item.payment_method_id || '',
      domain: item.domain || '',
      logo_url: item.logo_url || '',
      last_paid_date: item.last_paid_date || '',
      notes: item.notes || '',
    })
  }

  function startNew() {
    setEditing('new')
    setForm(BLANK)
  }

  function cancel() {
    setEditing(null)
    setForm(BLANK)
    setUploadError(null)
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      const url = await uploadLogo(supabase, file)
      setForm((f) => ({ ...f, logo_url: url }))
    } catch (err) {
      setUploadError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        base_amount: Number(form.base_amount) || 0,
        entity_id: form.entity_id || null,
        category_id: form.category_id || null,
        payment_method_id: form.payment_method_id || null,
        domain: form.domain.trim() || null,
        logo_url: form.logo_url || null,
        last_paid_date: form.last_paid_date || null,
      }
      if (editing !== 'new') payload.id = editing
      await upsertLineItem(payload)
      cancel()
    } finally {
      setSaving(false)
    }
  }

  async function remove(id) {
    if (!confirm('Delete this line item?')) return
    await deleteLineItem(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-(family-name:--font-display) text-3xl mb-1">Line items</h1>
          <p className="text-(--color-ink-soft)">Every recurring income and expense, one row each.</p>
        </div>
        <button
          onClick={startNew}
          className="rounded-md px-4 py-2 text-sm font-medium text-white"
          style={{ background: 'var(--color-ledger)' }}
        >
          + Add line item
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <select
          value={filterEntity}
          onChange={(e) => setFilterEntity(e.target.value)}
          className="rounded-md border px-3 py-1.5 text-sm bg-(--color-paper-raised)"
          style={{ borderColor: 'var(--color-hairline)' }}
        >
          <option value="all">All entities</option>
          {entities.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
        <select
          value={filterNature}
          onChange={(e) => setFilterNature(e.target.value)}
          className="rounded-md border px-3 py-1.5 text-sm bg-(--color-paper-raised)"
          style={{ borderColor: 'var(--color-hairline)' }}
        >
          <option value="all">Fixed + flexible</option>
          <option value="fixed">Fixed only</option>
          <option value="flexible">Flexible only</option>
        </select>
      </div>

      {editing && (
        <Card>
          <SectionTitle>{editing === 'new' ? 'New line item' : 'Edit line item'}</SectionTitle>
          <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Name">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Logo domain (optional)">
              <div className="flex gap-2">
                <input
                  placeholder="netflix.com"
                  value={form.domain}
                  onChange={(e) => setForm({ ...form, domain: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, domain: guessDomain(form.name) })}
                  className="shrink-0 rounded-md px-3 text-sm text-(--color-ink-soft) border"
                  style={{ borderColor: 'var(--color-hairline)' }}
                  title="Guess from name"
                >
                  Guess
                </button>
              </div>
            </Field>
            <Field label="Or upload an image (PNG/JPG, no logo online)">
              <div className="flex items-center gap-3">
                <Logo name={form.name} domain={form.domain} logoUrl={form.logo_url} size={28} />
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} className="text-sm" />
                {form.logo_url && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, logo_url: '' })}
                    className="text-sm text-(--color-warn)"
                  >
                    Remove
                  </button>
                )}
              </div>
              {uploading && <p className="text-xs text-(--color-ink-soft) mt-1">Uploading…</p>}
              {uploadError && <p className="text-xs mt-1" style={{ color: 'var(--color-warn)' }}>{uploadError}</p>}
            </Field>
            <Field label="Flow">
              <Select value={form.flow_type} onChange={(v) => setForm({ ...form, flow_type: v })}
                options={[['expense', 'Expense'], ['income', 'Income']]} />
            </Field>
            <Field label="Nature">
              <Select value={form.nature} onChange={(v) => setForm({ ...form, nature: v })}
                options={[['fixed', 'Fixed'], ['flexible', 'Flexible']]} />
            </Field>
            <Field label="Entity">
              <Select value={form.entity_id} onChange={(v) => setForm({ ...form, entity_id: v })}
                options={[['', '—'], ...entities.map((e) => [e.id, e.name])]} />
            </Field>
            <Field label="Category">
              <Select value={form.category_id} onChange={(v) => setForm({ ...form, category_id: v })}
                options={[['', '—'], ...categories.filter((c) => c.flow_type === form.flow_type).map((c) => [c.id, c.name])]} />
            </Field>
            <Field label="Amount">
              <input required type="number" step="0.01" value={form.base_amount}
                onChange={(e) => setForm({ ...form, base_amount: e.target.value })} />
            </Field>
            <Field label="Frequency">
              <Select value={form.base_frequency} onChange={(v) => setForm({ ...form, base_frequency: v })}
                options={FREQUENCIES.map((f) => [f.value, f.label])} />
            </Field>
            <Field label="Payment method">
              <Select value={form.payment_method_id} onChange={(v) => setForm({ ...form, payment_method_id: v })}
                options={[['', '—'], ...paymentMethods.filter((p) => p.is_active || p.id === form.payment_method_id)
                  .map((p) => [p.id, p.last4 ? `${p.name} ••${p.last4}` : p.name])]} />
            </Field>
            <Field label="Last paid">
              <input type="date" value={form.last_paid_date || ''} onChange={(e) => setForm({ ...form, last_paid_date: e.target.value })} />
            </Field>
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Notes">
                <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </Field>
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
              <button type="submit" disabled={saving}
                className="rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                style={{ background: 'var(--color-ledger)' }}>
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
              <th className="px-4 py-3 font-medium">Entity</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Nature</th>
              <th className="px-4 py-3 font-medium text-right">Monthly</th>
              <th className="px-4 py-3 font-medium text-right">Annual</th>
              <th className="px-4 py-3 font-medium">Frequency</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((li) => (
              <tr key={li.id} className="border-b last:border-0" style={{ borderColor: 'var(--color-hairline)' }}>
                <td className="px-4 py-2.5">
                  <span className="inline-flex items-center gap-2">
                    <Logo name={li.name} domain={li.domain} logoUrl={li.logo_url} />
                    {li.name}
                    {li.flow_type === 'income' && <Pill tone="ledger"> income</Pill>}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-(--color-ink-soft)">{entityName(li.entity_id)}</td>
                <td className="px-4 py-2.5 text-(--color-ink-soft)">{categoryName(li.category_id)}</td>
                <td className="px-4 py-2.5"><Pill tone={li.nature}>{li.nature}</Pill></td>
                <td className="px-4 py-2.5 text-right font-figures">
                  {formatCurrency(toMonthly(li.base_amount, li.base_frequency))}
                </td>
                <td className="px-4 py-2.5 text-right font-figures text-(--color-ink-soft)">
                  {formatCurrency(toAnnual(li.base_amount, li.base_frequency))}
                </td>
                <td className="px-4 py-2.5 text-(--color-ink-soft)">
                  {FREQUENCIES.find((f) => f.value === li.base_frequency)?.label}
                </td>
                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                  <button onClick={() => startEdit(li)} className="text-(--color-ledger) mr-3">Edit</button>
                  <button onClick={() => remove(li.id)} className="text-(--color-warn)">Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-(--color-ink-soft)">
                  No line items match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="block mb-1 text-(--color-ink-soft)">{label}</span>
      {children}
    </label>
  )
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border px-3 py-2 bg-(--color-paper-raised)"
      style={{ borderColor: 'var(--color-hairline)' }}
    >
      {options.map(([v, label]) => (
        <option key={v} value={v}>{label}</option>
      ))}
    </select>
  )
}
