import { useMemo } from 'react'
import { toMonthly, toAnnual, formatCurrency } from '../lib/frequency'
import { Card, Pill, SectionTitle, LedgerRow, Logo } from '../components/ui'

export default function ByEntity({ data }) {
  const { entities, lineItems } = data

  const perEntity = useMemo(() => {
    return entities.map((entity) => {
      const items = lineItems.filter((li) => li.entity_id === entity.id && li.is_active !== false)
      const expenses = items.filter((li) => li.flow_type === 'expense')
      const income = items.filter((li) => li.flow_type === 'income')
      const monthlyExpense = expenses.reduce((a, li) => a + toMonthly(li.base_amount, li.base_frequency), 0)
      const monthlyIncome = income.reduce((a, li) => a + toMonthly(li.base_amount, li.base_frequency), 0)
      const annualExpense = expenses.reduce((a, li) => a + toAnnual(li.base_amount, li.base_frequency), 0)
      const fixed = expenses.filter((li) => li.nature === 'fixed')
        .reduce((a, li) => a + toMonthly(li.base_amount, li.base_frequency), 0)
      const flexible = expenses.filter((li) => li.nature === 'flexible')
        .reduce((a, li) => a + toMonthly(li.base_amount, li.base_frequency), 0)
      return { entity, expenses, monthlyExpense, monthlyIncome, annualExpense, fixed, flexible }
    })
  }, [entities, lineItems])

  const unassigned = useMemo(() => {
    const items = lineItems.filter((li) => !li.entity_id && li.flow_type === 'expense' && li.is_active !== false)
    return items.reduce((a, li) => a + toMonthly(li.base_amount, li.base_frequency), 0)
  }, [lineItems])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-(family-name:--font-display) text-3xl mb-1">By entity</h1>
        <p className="text-(--color-ink-soft)">Each property or book, side by side.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {perEntity.map(({ entity, expenses, monthlyExpense, monthlyIncome, annualExpense, fixed, flexible }) => (
          <Card key={entity.id}>
            <SectionTitle>{entity.name}</SectionTitle>
            <div className="space-y-1 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-(--color-ink-soft)">Monthly expenses</span>
                <span className="font-figures">{formatCurrency(monthlyExpense)}</span>
              </div>
              {monthlyIncome > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-(--color-ink-soft)">Monthly income</span>
                  <span className="font-figures">{formatCurrency(monthlyIncome)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-(--color-ink-soft)">Annual expenses</span>
                <span className="font-figures">{formatCurrency(annualExpense)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <Pill tone="fixed">Fixed</Pill>
                <span className="font-figures">{formatCurrency(fixed)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <Pill tone="flexible">Flexible</Pill>
                <span className="font-figures">{formatCurrency(flexible)}</span>
              </div>
            </div>
            <div className="pt-3 border-t" style={{ borderColor: 'var(--color-hairline)' }}>
              {expenses.length === 0 && <p className="text-sm text-(--color-ink-soft)">No expenses assigned.</p>}
              {expenses
                .slice()
                .sort((a, b) => toMonthly(b.base_amount, b.base_frequency) - toMonthly(a.base_amount, a.base_frequency))
                .map((li) => (
                  <LedgerRow
                    key={li.id}
                    label={li.name}
                    value={toMonthly(li.base_amount, li.base_frequency)}
                    icon={<Logo name={li.name} domain={li.domain} logoUrl={li.logo_url} size={16} />}
                  />
                ))}
            </div>
          </Card>
        ))}
      </div>

      {unassigned > 0 && (
        <Card>
          <p className="text-sm text-(--color-ink-soft)">
            {formatCurrency(unassigned)}/mo in expenses aren't assigned to any entity — edit them from Line items to tag one.
          </p>
        </Card>
      )}
    </div>
  )
}
