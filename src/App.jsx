import { NavLink, Route, Routes, Navigate } from 'react-router-dom'
import { useAuth } from './lib/useAuth'
import { useBudgetData } from './lib/useBudgetData'
import { supabase } from './lib/supabaseClient'
import SignIn from './pages/SignIn'
import Dashboard from './pages/Dashboard'
import LineItems from './pages/LineItems'
import ByEntity from './pages/ByEntity'
import Upcoming from './pages/Upcoming'
import Incidentals from './pages/Incidentals'
import ManageEntities from './pages/ManageEntities'
import ManagePaymentMethods from './pages/ManagePaymentMethods'
import ManageCategories from './pages/ManageCategories'

const NAV = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/line-items', label: 'Line items' },
  { to: '/by-entity', label: 'By entity' },
  { to: '/entities', label: 'Manage entities' },
  { to: '/categories', label: 'Manage categories' },
  { to: '/payment-methods', label: 'Payment methods' },
  { to: '/upcoming', label: 'Upcoming' },
  { to: '/incidentals', label: 'Incidentals' },
]

function navClass({ isActive }) {
  return [
    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
    isActive ? 'text-white' : 'text-(--color-ink-soft) hover:text-(--color-ink)',
  ].join(' ')
}

export default function App() {
  const { session, loading: authLoading } = useAuth()

  if (authLoading) {
    return <div className="min-h-screen bg-(--color-paper)" />
  }

  if (!session) {
    return <SignIn />
  }

  return <AuthedApp />
}

function AuthedApp() {
  const data = useBudgetData()

  return (
    <div className="min-h-screen bg-(--color-paper)">
      <header className="border-b" style={{ borderColor: 'var(--color-hairline)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="font-(family-name:--font-display) text-2xl" style={{ color: 'var(--color-ledger)' }}>
              Ledger
            </span>
          </div>
          <nav className="flex items-center gap-1 flex-wrap">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={navClass}
                style={({ isActive }) => (isActive ? { background: 'var(--color-ledger)' } : undefined)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm text-(--color-ink-soft) hover:text-(--color-ink)"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {data.error && (
          <div className="mb-6 rounded-md px-4 py-3 text-sm" style={{ background: 'var(--color-warn-soft)', color: 'var(--color-warn)' }}>
            {data.error}
          </div>
        )}
        {data.loading ? (
          <p className="text-(--color-ink-soft)">Loading your ledger…</p>
        ) : (
          <Routes>
            <Route path="/" element={<Dashboard data={data} />} />
            <Route path="/line-items" element={<LineItems data={data} />} />
            <Route path="/by-entity" element={<ByEntity data={data} />} />
            <Route path="/entities" element={<ManageEntities data={data} />} />
            <Route path="/categories" element={<ManageCategories data={data} />} />
            <Route path="/payment-methods" element={<ManagePaymentMethods data={data} />} />
            <Route path="/upcoming" element={<Upcoming data={data} />} />
            <Route path="/incidentals" element={<Incidentals data={data} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>
    </div>
  )
}
