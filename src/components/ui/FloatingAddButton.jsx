import { Plus } from 'lucide-react'

export default function FloatingAddButton({ onClick, label = 'Add' }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 group"
      title={label}
      aria-label={label}
    >
      <div className="relative flex items-center gap-3">
        {/* Background circle with shadow */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-sky-400 to-sky-500 opacity-0 group-hover:opacity-100 blur transition-all duration-300 group-hover:scale-100" />
        
        {/* Main button */}
        <div className="relative flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-sky-400 to-sky-500 dark:from-sky-600 dark:to-sky-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-110 text-white font-semibold text-sm">
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="hidden sm:inline">{label}</span>
        </div>
      </div>
    </button>
  )
}
