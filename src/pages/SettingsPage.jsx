import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Save, Loader2, User, Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { formatCurrency } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user, updateProfile, loading } = useAuth()

  const { register: regProfile, handleSubmit: handleProfile, reset: resetProfile, formState: { isSubmitting: savingProfile } } = useForm()
  const { register: regBudget, handleSubmit: handleBudget, reset: resetBudget, formState: { isSubmitting: savingBudget } } = useForm()

  useEffect(() => {
    if (user) {
      resetProfile({ name: user.name })
      resetBudget({ budgetLimit: user.budgetLimit ?? '' })
    }
  }, [user, resetProfile, resetBudget])

  const onSaveProfile = async (data) => {
    try {
      await updateProfile({ name: data.name })
    } catch {
      toast.error('Failed to update profile')
    }
  }

  const onSaveBudget = async (data) => {
    try {
      await updateProfile({ budgetLimit: data.budgetLimit ? Number(data.budgetLimit) : null })
    } catch {
      toast.error('Failed to update budget')
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={24} className="animate-spin text-sky-500" /></div>

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account preferences</p>
      </div>

      {/* Profile */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-sky-50 dark:bg-sky-950/50 rounded-xl"><User size={18} className="text-sky-500" /></div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Profile</h3>
            <p className="text-xs text-gray-400">Update your personal information</p>
          </div>
        </div>
        <form onSubmit={handleProfile(onSaveProfile)} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input {...regProfile('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })} type="text" className="input" />
          </div>
          <div>
            <label className="label">Email address</label>
            <input type="email" value={user?.email || ''} disabled className="input opacity-60 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary">
            {savingProfile ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> Save changes</>}
          </button>
        </form>
      </div>

      {/* Budget */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-amber-50 dark:bg-amber-950/50 rounded-xl"><Bell size={18} className="text-amber-500" /></div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Monthly Budget</h3>
            <p className="text-xs text-gray-400">Set a monthly spending limit for alerts</p>
          </div>
        </div>
        <form onSubmit={handleBudget(onSaveBudget)} className="space-y-4">
          <div>
            <label className="label">Monthly budget limit (₹)</label>
            <input {...regBudget('budgetLimit')} type="number" min="0" step="100" className="input" placeholder="e.g. 50000" />
            {user?.budgetLimit && <p className="text-xs text-gray-400 mt-1">Current: {formatCurrency(user.budgetLimit)} / month</p>}
          </div>
          <button type="submit" disabled={savingBudget} className="btn-primary">
            {savingBudget ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> Update budget</>}
          </button>
        </form>
      </div>

      {/* Account info */}
      <div className="card p-6 bg-gray-50/70 dark:bg-gray-900/50">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Account Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Member since</span>
            <span className="text-gray-700 dark:text-gray-300">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
