import { useLocation, Link } from 'react-router-dom'
import { Sun, Moon, Plus, Download } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { format } from 'date-fns'
import api from '../../utils/api'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/expenses':  'Expenses',
  '/analytics': 'Analytics',
  '/settings':  'Settings',
}

export default function TopBar() {
  const { pathname } = useLocation()
  const { theme, toggle } = useTheme()
  const title = pageTitles[pathname] || 'Dashboard'
  const today = format(new Date(), 'EEEE, MMMM d')

  const handleExport = async () => {
    try {
      const res = await api.get('/expenses/export', { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // ignore
    }
  }

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 md:px-6 lg:px-8 flex-shrink-0">
      <div className="pl-10 lg:pl-0">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h1>
        <p className="text-xs text-gray-400 hidden sm:block">{today}</p>
      </div>

      <div className="flex items-center gap-2">
        {pathname === '/expenses' && (
          <button onClick={handleExport} className="btn-secondary hidden sm:flex">
            <Download size={15} /> Export CSV
          </button>
        )}
        <Link to="/expenses" className="btn-primary hidden sm:flex">
          <Plus size={15} /> Add Expense
        </Link>
        <button onClick={toggle} className="btn-ghost p-2 rounded-xl" aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  )
}
