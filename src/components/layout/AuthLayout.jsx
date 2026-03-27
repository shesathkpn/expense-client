import { Outlet } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-blue-50/20 dark:from-gray-950 dark:via-sky-950/20 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-sky-500 rounded-2xl mb-4 shadow-lg shadow-sky-500/30">
            <TrendingUp size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Xpensio</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Smart Expense Tracking</p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
