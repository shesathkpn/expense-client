import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useAccounts } from '../hooks'

export default function AccountsPage() {
  const { accounts, loading, error, refetch, create, remove } = useAccounts()
  const [showForm, setShowForm] = useState(false)
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
    const createPayload = { name: form.name, bank: form.bank, accountNumber: form.accountNumber, accountType: form.accountType, initialBalance: form.initialBalance ? parseFloat(form.initialBalance) : 0 }
    const res = await create(createPayload)
    if (res.success) {
      setForm({ name: '', bank: '', accountNumber: '', accountType: 'checking', initialBalance: '' })
      setShowForm(false)
      refetch()
    }
  }

  const handleDelete = async (acc) => {
    const ok = window.confirm(`Delete account "${acc.name}"? This is irreversible.`)
    if (!ok) return
    const res = await remove(acc._id)
    if (res.success) refetch()
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
        <form onSubmit={handleSubmit} className="card p-4 space-y-3">
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
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null) }} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingId ? 'Save' : 'Create'}</button>
          </div>
        </form>
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
    </div>
  )
}
