import { useState, useEffect, useCallback } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

/* ─── useExpenses ─── */
export function useExpenses(filters = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
      const { data: res } = await api.get(`/expenses?${params}`)
      setData(res)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load expenses')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)])

  useEffect(() => { fetch() }, [fetch])

  const create = async (payload) => {
    try {
      const { data: res } = await api.post('/expenses', payload)
      toast.success('Expense added!')
      fetch()
      return { success: true, expense: res.expense }
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to create'
      toast.error(msg)
      return { success: false, errors: e.response?.data?.errors }
    }
  }

  const update = async (id, payload) => {
    try {
      const { data: res } = await api.put(`/expenses/${id}`, payload)
      toast.success('Expense updated!')
      fetch()
      return { success: true, expense: res.expense }
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to update'
      toast.error(msg)
      return { success: false, errors: e.response?.data?.errors }
    }
  }

  const remove = async (id) => {
    try {
      await api.delete(`/expenses/${id}`)
      toast.success('Expense deleted')
      fetch()
      return { success: true }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete')
      return { success: false }
    }
  }

  return {
    expenses: data?.expenses || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
    hasMore: data?.hasMore || false,
    loading, error,
    refetch: fetch,
    create, update, remove,
  }
}

/* ─── useDashboard ─── */
export function useDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/dashboard')
      setStats(data)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { stats, loading, error, refetch: fetch }
}

/* ─── useAnalytics ─── */
export function useAnalytics(period = 'month') {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data: res } = await api.get(`/analytics?period=${period}`)
      setData(res)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}
