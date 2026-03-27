import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2, Save, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { CATEGORIES, CATEGORY_ICONS } from '../../types'

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  amount: z.number({ invalid_type_error: 'Amount must be a number' }).positive('Must be > 0'),
  category: z.enum(CATEGORIES),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().max(500).optional(),
  isRecurring: z.boolean().optional(),
  recurringInterval: z.enum(['daily', 'weekly', 'monthly']).optional().nullable(),
})

export default function ExpenseModal({ open, onClose, onSubmit, expense }) {
  const isEditing = !!expense

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      category: 'Food',
      isRecurring: false,
    },
  })

  const isRecurring = watch('isRecurring')

  useEffect(() => {
    if (open) {
      if (expense) {
        reset({
          title: expense.title,
          amount: expense.amount,
          category: expense.category,
          date: format(new Date(expense.date), 'yyyy-MM-dd'),
          notes: expense.notes || '',
          isRecurring: expense.isRecurring || false,
          recurringInterval: expense.recurringInterval || undefined,
        })
      } else {
        reset({ date: format(new Date(), 'yyyy-MM-dd'), category: 'Food', isRecurring: false })
      }
    }
  }, [expense, open, reset])

  const onFormSubmit = async (data) => {
    const result = await onSubmit(data)
    if (result?.success) {
      onClose()
      reset()
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 animate-slide-up sm:animate-scale-in overflow-hidden max-h-[95vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">{isEditing ? 'Edit Expense' : 'New Expense'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <form id="expense-form" onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">

            <div>
              <label className="label">Title</label>
              <input {...register('title')} type="text" className={`input ${errors.title ? 'input-error' : ''}`} placeholder="What did you spend on?" autoFocus />
              {errors.title && <p className="error-text">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Amount (₹)</label>
                <input {...register('amount', { valueAsNumber: true })} type="number" min="0.01" step="0.01" className={`input ${errors.amount ? 'input-error' : ''}`} placeholder="0.00" />
                {errors.amount && <p className="error-text">{errors.amount.message}</p>}
              </div>
              <div>
                <label className="label">Date</label>
                <input {...register('date')} type="date" className={`input ${errors.date ? 'input-error' : ''}`} max={format(new Date(), 'yyyy-MM-dd')} />
                {errors.date && <p className="error-text">{errors.date.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Category</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {CATEGORIES.map(cat => {
                  const selected = watch('category') === cat
                  return (
                    <label key={cat} className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 cursor-pointer transition-all ${selected ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'}`}>
                      <input type="radio" {...register('category')} value={cat} className="sr-only" />
                      <span className="text-lg">{CATEGORY_ICONS[cat]}</span>
                      <span className={`text-[10px] font-medium leading-none ${selected ? 'text-sky-600 dark:text-sky-400' : 'text-gray-500 dark:text-gray-400'}`}>{cat}</span>
                    </label>
                  )
                })}
              </div>
              {errors.category && <p className="error-text">{errors.category.message}</p>}
            </div>

            <div>
              <label className="label">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea {...register('notes')} rows={2} className="input resize-none" placeholder="Any additional details..." />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" {...register('isRecurring')} className="sr-only peer" />
                  <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer-checked:bg-sky-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-4" />
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw size={14} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Recurring expense</span>
                </div>
              </label>
              {isRecurring && (
                <div className="animate-slide-down">
                  <label className="label">Repeat every</label>
                  <select {...register('recurringInterval')} className="input">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 bg-gray-50/50 dark:bg-gray-900/50">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" form="expense-form" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? <><Loader2 size={15} className="animate-spin" /> {isEditing ? 'Updating...' : 'Adding...'}</> : <><Save size={15} /> {isEditing ? 'Update' : 'Add Expense'}</>}
          </button>
        </div>
      </div>
    </div>
  )
}
