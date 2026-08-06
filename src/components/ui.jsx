import { formatCurrency } from '../lib/frequency'
import { faviconUrl } from '../lib/logo'
import { useState } from 'react'

// Shows an uploaded logo image if present, otherwise a brand favicon
// (when a domain is set), otherwise a plain initial-letter circle so the
// table never looks broken for items without either.
export function Logo({ name, domain, logoUrl, size = 20 }) {
  const [failed, setFailed] = useState(false)
  const url = logoUrl || (domain ? faviconUrl(domain, size * 2) : null)

  if (url && !failed) {
    return (
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        className="rounded-sm inline-block align-middle"
        style={{ objectFit: 'contain' }}
        onError={() => setFailed(true)}
      />
    )
  }

  const initial = (name || '?').trim().charAt(0).toUpperCase()
  return (
    <span
      className="inline-flex items-center justify-center rounded-sm align-middle text-[10px] font-medium"
      style={{
        width: size,
        height: size,
        background: 'var(--color-hairline)',
        color: 'var(--color-ink-soft)',
      }}
    >
      {initial}
    </span>
  )
}

export function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-lg border bg-(--color-paper-raised) p-5 ${className}`}
      style={{ borderColor: 'var(--color-hairline)' }}
    >
      {children}
    </div>
  )
}

export function StatCard({ label, value, tone = 'ink', sub }) {
  const toneColor = {
    ink: 'var(--color-ink)',
    ledger: 'var(--color-ledger)',
    fixed: 'var(--color-fixed)',
    flexible: 'var(--color-flexible)',
    incidental: 'var(--color-incidental)',
    warn: 'var(--color-warn)',
  }[tone]

  return (
    <Card>
      <p className="text-sm text-(--color-ink-soft) mb-1">{label}</p>
      <p className="font-figures text-3xl font-semibold" style={{ color: toneColor }}>
        {formatCurrency(value)}
      </p>
      {sub && <p className="text-xs text-(--color-ink-soft) mt-1">{sub}</p>}
    </Card>
  )
}

export function Pill({ children, tone = 'ink' }) {
  const styles = {
    fixed: { background: 'var(--color-fixed-soft)', color: 'var(--color-fixed)' },
    flexible: { background: 'var(--color-flexible-soft)', color: 'var(--color-flexible)' },
    incidental: { background: 'var(--color-incidental-soft)', color: 'var(--color-incidental)' },
    ledger: { background: 'var(--color-ledger-soft)', color: 'var(--color-ledger)' },
  }[tone] || {}

  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium" style={styles}>
      {children}
    </span>
  )
}

export function LedgerRow({ label, value, tone = 'ink', icon }) {
  const toneColor = {
    ink: 'var(--color-ink)',
    ledger: 'var(--color-ledger)',
    warn: 'var(--color-warn)',
  }[tone]
  return (
    <div className="ledger-row py-1.5">
      <span className="text-sm inline-flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className="ledger-leader" />
      <span className="font-figures text-sm" style={{ color: toneColor }}>
        {formatCurrency(value)}
      </span>
    </div>
  )
}

export function SectionTitle({ children, right }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-(family-name:--font-display) text-xl">{children}</h2>
      {right}
    </div>
  )
}
