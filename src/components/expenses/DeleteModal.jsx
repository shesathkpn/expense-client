import { AlertTriangle, X, Loader2, Trash2 } from 'lucide-react'
import { formatCurrency } from '../../utils/helpers'

export default function DeleteModal({ open, onClose, onConfirm, isLoading, title, amount }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isLoading && onClose()} />
      <div className="relative w-full sm:max-w-sm bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 animate-slide-up sm:animate-scale-in overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Delete Expense</h2>
          <button onClick={onClose} disabled={isLoading} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-40">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          {/* Warning Icon */}
          <div className="flex justify-center">
            <div className="p-3 bg-red-100 dark:bg-red-950/30 rounded-full">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
          </div>

          {/* Message */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this expense?
            </p>
            {title && (
              <div className="pt-2 space-y-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {title}
                </p>
                {amount && (
                  <p className="text-sm font-bold text-red-500">
                    {formatCurrency(amount)}
                  </p>
                )}
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
