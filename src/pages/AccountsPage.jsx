import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useAccounts } from '../hooks'
import DeleteModal from '../components/expenses/DeleteModal'

export default function AccountsPage() {
  const { accounts, loading, error, refetch, create, remove } = useAccounts()
  const [showForm, setShowForm] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [form, setForm] = useState({ name: '', bank: '', accountNumber: '', accountType: 'checking', initialBalance: '' })

  const handleChange = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const openCreate = () => {
    setForm({ name: '', bank: '', accountNumber: '', accountType: 'checking', initialBalance: '' })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return alert('Name is required')
    if (!form.accountNumber.trim()) return alert('Account number is required')
    const payload = {
      name: form.name,
      bank: form.bank,
      accountNumber: form.accountNumber,
      accountType: form.accountType,
      initialBalance: form.initialBalance ? parseFloat(form.initialBalance) : 0,
    }

    const res = await create(payload)
    if (res.success) {
      setForm({ name: '', bank: '', accountNumber: '', accountType: 'checking', initialBalance: '' })
      setShowForm(false)
      refetch()
    }
  }

  const handleDelete = (acc) => {
    setAccountToDelete(acc)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return
    setIsDeleting(true)
    const res = await remove(accountToDelete._id)
    setIsDeleting(false)
    if (res.success) {
      refetch()
      setDeleteModalOpen(false)
      setAccountToDelete(null)
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Accounts</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your bank accounts and balances</p>
        </div>
        <div>
          <button onClick={openCreate} className="btn-primary"><Plus size={14} /> Add Account</button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full sm:max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl z-10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Account</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Create a new account to track balances.</p>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Name</label>
                  <input value={form.name} onChange={handleChange('name')} className="input" required />
                </div>
                <div>
                  <label className="label">Bank</label>
                  <input value={form.bank} onChange={handleChange('bank')} className="input" />
                </div>
                <div>
                  <label className="label">Account Number</label>
                  <input value={form.accountNumber} onChange={handleChange('accountNumber')} className="input" required />
                </div>
                <div>
                  <label className="label">Initial Balance</label>
                  <input value={form.initialBalance} onChange={handleChange('initialBalance')} className="input" placeholder="0.00" />
                </div>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : accounts.length === 0 ? (
          <div className="p-6 text-center">No accounts yet. Click Add Account to create one.</div>
        ) : (
          <div className="p-4 space-y-2">
            {accounts.map(a => (
              <div key={a._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">{a.name} {a.bank ? <span className="text-sm text-gray-400">— {a.bank}</span> : null}</div>
                  <div className="text-xs text-gray-400">****{a.accountNumber?.slice(-4)} • {a.currency}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-bold">{(a.balance ?? 0).toFixed(2)}</div>
                  <button onClick={() => handleDelete(a)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <DeleteModal
        open={deleteModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setDeleteModalOpen(false)
            setAccountToDelete(null)
          }
        }}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title={accountToDelete?.name}
        amount={accountToDelete?.balance}
      />
    </div>
  )
}
