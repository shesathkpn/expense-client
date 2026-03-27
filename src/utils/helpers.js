import { format } from 'date-fns'
import { clsx } from 'clsx'

export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ')
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date) {
  return format(new Date(date), 'MMM dd, yyyy')
}

export function formatDateShort(date) {
  return format(new Date(date), 'MMM dd')
}

export function formatDateInput(date) {
  return format(new Date(date), 'yyyy-MM-dd')
}

export function truncate(str, len = 40) {
  return str?.length > len ? str.slice(0, len) + '...' : str
}

export function downloadCSV(data, filename) {
  const url = URL.createObjectURL(new Blob([data], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
