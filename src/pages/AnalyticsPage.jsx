import { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useAnalytics } from '../hooks'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../types'
import { formatCurrency, formatDate } from '../utils/helpers'
import { BarChart3, TrendingUp, TrendingDown, PieChart as PieIcon, AlertTriangle } from 'lucide-react'
import Spinner from '../components/ui/Spinner'

const PERIODS = [
  { value: 'day', label: 'Daily (30d)' },
  { value: 'week', label: 'Weekly (12w)' },
  { value: 'month', label: 'Monthly (6m)' },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-3 py-2 shadow-lg">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('month')
  const { data, loading, error } = useAnalytics(period)

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size={28} /></div>
  if (error || !data) return (
    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl text-red-600 dark:text-red-400">
      <AlertTriangle size={18} /><p className="text-sm">{error || 'Failed to load analytics'}</p>
    </div>
  )

  const totalSpend = data.chartData.reduce((s, d) => s + d.amount, 0)
  const nonZero = data.chartData.filter(d => d.amount > 0)
  const avg = nonZero.length ? totalSpend / nonZero.length : 0
  const maxPt = data.chartData.reduce((m, d) => d.amount > m.amount ? d : m, data.chartData[0] || { amount: 0 })
  const trend = data.chartData.length >= 2
    ? data.chartData[data.chartData.length - 1].amount - data.chartData[data.chartData.length - 2].amount
    : 0

  const pieData = data.categoryData.map(c => ({ name: c.category, value: c.total, color: CATEGORY_COLORS[c.category] }))

  const summaryCards = [
    { label: 'Total spent', value: formatCurrency(totalSpend), icon: <BarChart3 size={16} className="text-sky-500" />, bg: 'bg-sky-50 dark:bg-sky-950/40' },
    { label: 'Avg per period', value: formatCurrency(avg), icon: <BarChart3 size={16} className="text-violet-500" />, bg: 'bg-violet-50 dark:bg-violet-950/40' },
    {
      label: 'Trend vs last',
      value: (trend >= 0 ? '+' : '') + formatCurrency(trend),
      icon: trend >= 0 ? <TrendingUp size={16} className="text-red-500" /> : <TrendingDown size={16} className="text-emerald-500" />,
      bg: trend >= 0 ? 'bg-red-50 dark:bg-red-950/40' : 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    { label: 'Highest period', value: formatCurrency(maxPt?.amount || 0), icon: <TrendingUp size={16} className="text-amber-500" />, bg: 'bg-amber-50 dark:bg-amber-950/40' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Analytics</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Spending trends and insights</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${period === p.value ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(c => (
          <div key={c.label} className="card p-4">
            <div className={`p-2 rounded-lg w-fit mb-2 ${c.bg}`}>{c.icon}</div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{c.value}</p>
            <p className="text-xs text-gray-400">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Area Chart */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-5">Spending Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-gray-800" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} width={50} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="amount" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#grad)" dot={false} activeDot={{ r: 5, fill: '#0ea5e9', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-5">Distribution</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <PieIcon size={16} className="text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Category Distribution</h3>
          </div>
          {!pieData.length ? (
            <div className="flex items-center justify-center h-52 text-gray-400 text-sm">No data for this period</div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="h-48 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} strokeWidth={0} />)}
                    </Pie>
                    <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                {pieData.slice(0, 6).map(item => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1">{CATEGORY_ICONS[item.name]} {item.name}</span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Expenses */}
      {data.topExpenses?.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">Top Expenses This Period</h3>
          <div className="space-y-2">
            {data.topExpenses.map((exp, i) => (
              <div key={exp._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <span className="text-lg font-bold text-gray-200 dark:text-gray-700 w-6 text-center flex-shrink-0">#{i + 1}</span>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[exp.category] + '20' }}>
                  {CATEGORY_ICONS[exp.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{exp.title}</p>
                  <p className="text-xs text-gray-400">{formatDate(exp.date)}</p>
                </div>
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100 flex-shrink-0">{formatCurrency(exp.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
