import { useMemo } from 'react'
import { toMonthly, toAnnual, formatCurrency } from '../lib/frequency'
import { Card, StatCard, Pill, LedgerRow, SectionTitle } from '../components/ui'

export default function Dashboard({ data }) {
  const { lineItems, categories, incidentals } = data

  const summary = useMemo(() => {
    const active = lineItems.filter((li) => li.is_active !== false)
    const income = active.filter((li) => li.flow_type === 'income')
    const expenses = active.filter((li) => li.flow_type === 'expense')

    const sum = (arr, fn) => arr.reduce((acc, li) => acc + fn(li.base_amount, li.base_frequency), 0)

    const monthlyIncome = sum(income, toMonthly)
    const monthlyExpense = sum(expenses, toMonthly)
    const annualExpense = sum(expenses, toAnnual)
    const annualIncome = sum(income, toAnnual)

    const fixed = expenses.filter((li) => li.nature === 'fixed')
    const flexible = expenses.filter((li) => li.nature === 'flexible')
    const monthlyFixed = sum(fixed, toMonthly)
    const monthlyFlexible = sum(flexible, toMonthly)

    const incidentalYtd = incidentals
      .filter((i) => new Date(i.occurred_on).getFullYear() === new Date().getFullYear())
      .reduce((acc, i) => acc + Number(i.amount || 0), 0)

    // Category rollup (monthly), expenses only
    const byCategory = {}
    for (const li of expenses) {
      const cat = categories.find((c) => c.id === li.category_id)
      const name = cat ? cat.name : 'Uncategorized'
      byCategory[name] = (byCategory[name] || 0) + toMonthly(li.base_amount, li.base_frequency)
    }
    const categoryRows = Object.entries(byCategory).sort((a, b) => b[1] - a[1])

    return {
      monthlyIncome,
      monthlyExpense,
      annualExpense,
      annualIncome,
      monthlyFixed,
      monthlyFlexible,
      monthlyNet: monthlyIncome - monthlyExpense,
      fixedShare: monthlyFixed + monthlyFlexible > 0 ? monthlyFixed / (monthlyFixed + monthlyFlexible) : 0,
      incidentalYtd,
      categoryRows,
    }
  }, [lineItems, categories, incidentals])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-(family-name:--font-display) text-3xl mb-1">Dashboard</h1>
        <p className="text-(--color-ink-soft)">Your whole year, normalized to one view.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Monthly income" value={summary.monthlyIncome} tone="ledger" />
        <StatCard label="Monthly expenses" value={summary.monthlyExpense} tone="warn" />
        <StatCard
          label="Net monthly cash flow"
          value={summary.monthlyNet}
          tone={summary.monthlyNet >= 0 ? 'ledger' : 'warn'}
        />
        <StatCard label="Annual expenses" value={summary.annualExpense} sub={`vs. ${formatCurrency(summary.annualIncome)} income`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionTitle>Fixed vs. flexible</SectionTitle>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <Pill tone="fixed">Fixed</Pill>
              <span className="font-figures">{formatCurrency(summary.monthlyFixed)}/mo</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <Pill tone="flexible">Flexible</Pill>
              <span className="font-figures">{formatCurrency(summary.monthlyFlexible)}/mo</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden flex" style={{ background: 'var(--color-hairline)' }}>
              <div
                style={{
                  width: `${Math.round(summary.fixedShare * 100)}%`,
                  background: 'var(--color-fixed)',
                }}
              />
              <div
                style={{
                  width: `${Math.round((1 - summary.fixedShare) * 100)}%`,
                  background: 'var(--color-flexible)',
                }}
              />
            </div>
            <p className="text-xs text-(--color-ink-soft)">
              {Math.round(summary.fixedShare * 100)}% of your recurring monthly spend is locked in;{' '}
              {Math.round((1 - summary.fixedShare) * 100)}% is within your control month to month.
            </p>
            <div className="flex items-center justify-between text-sm pt-2 border-t" style={{ borderColor: 'var(--color-hairline)' }}>
              <Pill tone="incidental">Incidental (YTD)</Pill>
              <span className="font-figures">{formatCurrency(summary.incidentalYtd)}</span>
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle>Monthly run-rate by category</SectionTitle>
          <div>
            {summary.categoryRows.length === 0 && (
              <p className="text-sm text-(--color-ink-soft)">No expense line items yet.</p>
            )}
            {summary.categoryRows.map(([name, amount]) => (
              <LedgerRow key={name} label={name} value={amount} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
