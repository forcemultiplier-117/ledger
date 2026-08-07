import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

// Central data hook: loads entities, categories, line items, and incidentals,
// and exposes CRUD helpers. Kept in one place so every page reads the same
// shape of data and stays in sync after edits.
export function useBudgetData() {
  const [entities, setEntities] = useState([])
  const [categories, setCategories] = useState([])
  const [lineItems, setLineItems] = useState([])
  const [incidentals, setIncidentals] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [e, c, li, inc, pm] = await Promise.all([
        supabase.from('entities').select('*').order('sort_order'),
        supabase.from('categories').select('*').order('name'),
        supabase.from('line_items').select('*').order('name'),
        supabase.from('incidentals').select('*').order('occurred_on', { ascending: false }),
        supabase.from('payment_methods').select('*').order('name'),
      ])
      if (e.error) throw e.error
      if (c.error) throw c.error
      if (li.error) throw li.error
      if (inc.error) throw inc.error
      if (pm.error) throw pm.error
      setEntities(e.data || [])
      setCategories(c.data || [])
      setLineItems(li.data || [])
      setIncidentals(inc.data || [])
      setPaymentMethods(pm.data || [])
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const upsertLineItem = useCallback(async (item) => {
    const { error } = await supabase.from('line_items').upsert(item)
    if (error) throw error
    await loadAll()
  }, [loadAll])

  const deleteLineItem = useCallback(async (id) => {
    const { error } = await supabase.from('line_items').delete().eq('id', id)
    if (error) throw error
    await loadAll()
  }, [loadAll])

  const upsertEntity = useCallback(async (entity) => {
    const { error } = await supabase.from('entities').upsert(entity)
    if (error) throw error
    await loadAll()
  }, [loadAll])

  const deleteEntity = useCallback(async (id) => {
    const { error } = await supabase.from('entities').delete().eq('id', id)
    if (error) throw error
    await loadAll()
  }, [loadAll])

  const upsertPaymentMethod = useCallback(async (pm) => {
    const { error } = await supabase.from('payment_methods').upsert(pm)
    if (error) throw error
    await loadAll()
  }, [loadAll])

  const deletePaymentMethod = useCallback(async (id) => {
    const { error } = await supabase.from('payment_methods').delete().eq('id', id)
    if (error) throw error
    await loadAll()
  }, [loadAll])

  const upsertCategory = useCallback(async (category) => {
    const { error } = await supabase.from('categories').upsert(category)
    if (error) throw error
    await loadAll()
  }, [loadAll])

  const deleteCategory = useCallback(async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
    await loadAll()
  }, [loadAll])

  const upsertIncidental = useCallback(async (item) => {
    const { error } = await supabase.from('incidentals').upsert(item)
    if (error) throw error
    await loadAll()
  }, [loadAll])

  const deleteIncidental = useCallback(async (id) => {
    const { error } = await supabase.from('incidentals').delete().eq('id', id)
    if (error) throw error
    await loadAll()
  }, [loadAll])

  return {
    entities,
    categories,
    lineItems,
    incidentals,
    paymentMethods,
    loading,
    error,
    reload: loadAll,
    upsertLineItem,
    deleteLineItem,
    upsertEntity,
    deleteEntity,
    upsertIncidental,
    deleteIncidental,
    upsertPaymentMethod,
    deletePaymentMethod,
    upsertCategory,
    deleteCategory,
  }
}
