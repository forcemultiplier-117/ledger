import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setBusy(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-paper) px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-(family-name:--font-display) text-3xl mb-1" style={{ color: 'var(--color-ledger)' }}>
          Ledger
        </h1>
        <p className="text-(--color-ink-soft) mb-8 text-sm">Sign in to your budget.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border px-3 py-2.5 bg-(--color-paper-raised)"
              style={{ borderColor: 'var(--color-hairline)' }}
            />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border px-3 py-2.5 bg-(--color-paper-raised)"
              style={{ borderColor: 'var(--color-hairline)' }}
            />
          </div>
          {error && (
            <p className="text-sm rounded-md px-3 py-2" style={{ background: 'var(--color-warn-soft)', color: 'var(--color-warn)' }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md py-2.5 font-medium text-white disabled:opacity-60"
            style={{ background: 'var(--color-ledger)' }}
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="text-xs text-(--color-ink-soft) mt-6">
          Create your account in the Supabase dashboard under Authentication → Users — see README.md.
        </p>
      </div>
    </div>
  )
}
