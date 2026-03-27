import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar, CalendarDays, Wallet,
  ArrowRight, TrendingUp, TrendingDown, AlertTriangle,
} from 'lucide-react'
import { useDashboard } from '../hooks'
import { useAuth } from '../context/AuthContext'
import { formatCurrency, formatDate } from '../utils/helpers'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../types'
import Spinner from '../components/ui/Spinner'
import FloatingAddButton from '../components/ui/FloatingAddButton'
import ExpenseModal from '../components/expenses/ExpenseModal'
import { useExpenses } from '../hooks'

function StatCard({ label, value, icon, color }) {
  return (
    <div className="card p-5 hover:shadow-md transition-shadow duration-200">
      <div className={`p-2.5 rounded-xl w-fit mb-3 ${color}`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  )
}

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const { user } = useAuth()
  const { stats, loading, error, refetch } = useDashboard()
  const { create } = useExpenses({ page: 1, limit: 10 })

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size={28} /></div>

  if (error) return (
    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl text-red-600 dark:text-red-400">
      <AlertTriangle size={18} /><p className="text-sm">{error}</p>
    </div>
  )

  const budgetPercent = stats?.budgetLimit
    ? Math.min(100, ((stats.budgetUsed || 0) / stats.budgetLimit) * 100)
    : null

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Hey, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Here's your spending overview</p>

      </div>

      {/* Budget Alert */}
      {budgetPercent !== null && budgetPercent >= 80 && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border text-sm font-medium ${
          budgetPercent >= 100
            ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300'
            : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300'
        }`}>
          <AlertTriangle size={18} className="flex-shrink-0" />
          {budgetPercent >= 100
            ? `You've exceeded your monthly budget of ${formatCurrency(stats.budgetLimit)}`
            : `You've used ${budgetPercent.toFixed(0)}% of your monthly budget`}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard label="Spent today" value={formatCurrency(stats?.totalToday || 0)} icon={<Calendar size={18} className="text-sky-500" />} color="bg-sky-50 dark:bg-sky-950/50" />
        <StatCard label="Spent this week" value={formatCurrency(stats?.totalThisWeek || 0)} icon={<CalendarDays size={18} className="text-violet-500" />} color="bg-violet-50 dark:bg-violet-950/50" />
        <StatCard label="Spent this month" value={formatCurrency(stats?.totalThisMonth || 0)} icon={<Wallet size={18} className="text-emerald-500" />} color="bg-emerald-50 dark:bg-emerald-950/50" />
      </div>

      {/* Budget Progress */}
      {stats?.budgetLimit && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Monthly Budget</h3>
              <p className="text-xs text-gray-400 mt-0.5">{formatCurrency(stats.budgetUsed || 0)} of {formatCurrency(stats.budgetLimit)} used</p>
            </div>
            <span className={`text-sm font-bold ${budgetPercent >= 100 ? 'text-red-500' : budgetPercent >= 80 ? 'text-amber-500' : 'text-emerald-500'}`}>
              {budgetPercent?.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${budgetPercent >= 100 ? 'bg-red-500' : budgetPercent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Recent Transactions</h3>
            <Link to="/expenses" className="text-xs text-sky-500 hover:text-sky-600 flex items-center gap-1 font-medium">View all <ArrowRight size={12} /></Link>
          </div>
          {!stats?.recentExpenses?.length ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">💸</div>
              <p className="text-sm text-gray-400">No transactions yet</p>
              <Link to="/expenses" className="text-xs text-sky-500 hover:underline mt-1 inline-block">Add your first expense</Link>
            </div>
          ) : (
            <div className="space-y-1">
              {stats.recentExpenses.map(exp => (
                <div key={exp._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[exp.category] + '20' }}>
                    {CATEGORY_ICONS[exp.category]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{exp.title}</p>
                    <p className="text-xs text-gray-400">{formatDate(exp.date)}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <TrendingDown size={12} className="text-red-400" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(exp.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Category Breakdown</h3>
            <Link to="/analytics" className="text-xs text-sky-500 hover:text-sky-600 flex items-center gap-1 font-medium">Full analysis <ArrowRight size={12} /></Link>
          </div>
          {!stats?.categoryBreakdown?.length ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-sm text-gray-400">No data this month</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.categoryBreakdown.slice(0, 5).map(item => {
                const total = stats.categoryBreakdown.reduce((s, i) => s + i.total, 0)
                const pct = total > 0 ? (item.total / total) * 100 : 0
                return (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{CATEGORY_ICONS[item.category]}</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{pct.toFixed(0)}%</span>
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(item.total)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[item.category] }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Analytics CTA */}
      <div className="card p-5 bg-gradient-to-br from-sky-500 to-blue-600 border-0 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">Deep dive into analytics</h3>
            <p className="text-sm text-sky-100 mt-0.5">Charts, trends and spending patterns</p>
             <Link to="/analytics" className="flex items-center justify-center gap-2 mt-2 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-xl text-sm font-medium text-white backdrop-blur-sm">
            View <TrendingUp size={15} />
          </Link>
          </div>
         
        </div>
      </div>

      {/* Floating Add Button */}
      <FloatingAddButton onClick={() => setModalOpen(true)} label="Add Expense" />

      {/* Expense Modal */}
      <ExpenseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={async (data) => {
          const result = await create(data)
          if (result.success) {
            // Refetch dashboard stats to update immediately
            await refetch()
          }
          return result
        }}
        expense={null}
      />
    </div>
  )
}
