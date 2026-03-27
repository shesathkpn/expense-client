import { useState, useCallback } from 'react'
import {
  Plus, Search, Filter, Trash2, Pencil,
  ChevronLeft, ChevronRight, RefreshCw, Download, Loader2,
} from 'lucide-react'
import { useExpenses } from '../hooks'
import ExpenseModal from '../components/expenses/ExpenseModal'
import DeleteModal from '../components/expenses/DeleteModal'
import FloatingAddButton from '../components/ui/FloatingAddButton'
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS } from '../types'
import { formatCurrency, formatDate } from '../utils/helpers'
import { format } from 'date-fns'
import api from '../utils/api'

export default function ExpensesPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filters = {
    page, limit: 15,
    search: debouncedSearch,
    category: category !== 'all' ? category : '',
    startDate, endDate,
  }

  const { expenses, total, totalPages, loading, create, update, remove } = useExpenses(filters)

  const handleSearch = useCallback((val) => {
    setSearch(val)
    clearTimeout(window.__searchTimer)
    window.__searchTimer = setTimeout(() => {
      setDebouncedSearch(val)
      setPage(1)
    }, 400)
  }, [])

  const handleCreate = async (data) => create(data)
  const handleUpdate = async (data) => {
    if (!editingExpense) return { success: false }
    const result = await update(editingExpense._id, data)
    if (result.success) setEditingExpense(null)
    return result
  }

  const handleDelete = async (id) => {
    const expense = expenses.find(e => e._id === id)
    if (expense) {
      setExpenseToDelete(expense)
      setDeleteModalOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return
    setIsDeleting(true)
    await remove(expenseToDelete._id)
    setIsDeleting(false)
    setDeleteModalOpen(false)
    setExpenseToDelete(null)
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)
      const res = await api.get(`/expenses/export?${params}`, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch { /* ignore */ }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Expenses</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{total} total records</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="btn-secondary"><Download size={15} /> Export</button>
          <button onClick={() => { setEditingExpense(null); setModalOpen(true) }} className="btn-primary"><Plus size={15} /> Add Expense</button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search expenses..." className="input pl-9" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`btn-secondary ${showFilters ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400' : ''}`}>
            <Filter size={15} /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800 animate-slide-down">
            <div>
              <label className="label text-xs">Category</label>
              <select value={category} onChange={e => { setCategory(e.target.value); setPage(1) }} className="input text-sm">
                <option value="all">All categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
              </select>
            </div>
            <div>
              <label className="label text-xs">From date</label>
              <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1) }} className="input text-sm" />
            </div>
            <div>
              <label className="label text-xs">To date</label>
              <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1) }} className="input text-sm" />
            </div>
          </div>
        )}
      </div>

      {/* Expense List */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-sky-500" /></div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No expenses found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting filters or add a new expense</p>
            <button onClick={() => { setEditingExpense(null); setModalOpen(true) }} className="btn-primary mt-4"><Plus size={15} /> Add First Expense</button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {['Expense', 'Category', 'Date', 'Amount', ''].map(h => (
                      <th key={h} className={`px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider ${h === 'Amount' ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {expenses.map(exp => (
                    <tr key={exp._id} className="group hover:bg-gray-50/70 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[exp.category] + '20' }}>
                            {CATEGORY_ICONS[exp.category]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{exp.title}</p>
                            {exp.notes && <p className="text-xs text-gray-400 truncate max-w-[200px]">{exp.notes}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="badge text-xs font-medium" style={{ backgroundColor: CATEGORY_COLORS[exp.category] + '20', color: CATEGORY_COLORS[exp.category] }}>
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(exp.date)}</span>
                        {exp.isRecurring && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <RefreshCw size={10} className="text-sky-400" />
                            <span className="text-[10px] text-sky-500">{exp.recurringInterval}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{formatCurrency(exp.amount)}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingExpense(exp); setModalOpen(true) }} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(exp._id)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {expenses.map(exp => (
                <div key={exp._id} className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[exp.category] + '20' }}>
                    {CATEGORY_ICONS[exp.category]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{exp.title}</p>
                    <p className="text-xs text-gray-400">{formatDate(exp.date)} · {exp.category}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{formatCurrency(exp.amount)}</span>
                    <button onClick={() => { setEditingExpense(exp); setModalOpen(true) }} className="p-1.5 text-gray-400 hover:text-sky-500 transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(exp._id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-400">Page {page} of {totalPages}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-1.5 px-3 disabled:opacity-40"><ChevronLeft size={16} /></button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary py-1.5 px-3 disabled:opacity-40"><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ExpenseModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingExpense(null) }}
        onSubmit={editingExpense ? handleUpdate : handleCreate}
        expense={editingExpense}
      />

      <DeleteModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setExpenseToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title={expenseToDelete?.title}
        amount={expenseToDelete?.amount}
      />

      <FloatingAddButton onClick={() => { setEditingExpense(null); setModalOpen(true) }} label="Add Expense" />
    </div>
  )
}
