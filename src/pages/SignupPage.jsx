import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, UserPlus, Loader2, Check, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
})

function PasswordStrength({ password }) {
  const checks = [
    { label: 'At least 8 characters', pass: password?.length >= 8 },
    { label: 'One uppercase letter', pass: /[A-Z]/.test(password || '') },
    { label: 'One number', pass: /[0-9]/.test(password || '') },
  ]
  if (!password) return null
  return (
    <div className="mt-2 space-y-1">
      {checks.map(c => (
        <div key={c.label} className="flex items-center gap-1.5 text-xs">
          {c.pass ? <Check size={12} className="text-emerald-500 flex-shrink-0" /> : <X size={12} className="text-red-400 flex-shrink-0" />}
          <span className={c.pass ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}>{c.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, watch, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const password = watch('password', '')

  const onSubmit = async (data) => {
    try {
      await signup(data.name, data.email, data.password)
      navigate('/dashboard')
    } catch (e) {
      const msg = e.response?.data?.message || 'Signup failed'
      setError('root', { message: msg })
      toast.error(msg)
    }
  }

  return (
    <div className="card p-8 animate-scale-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create account</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start tracking your expenses</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errors.root && (
          <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl">
            <p className="text-sm text-red-600 dark:text-red-400">{errors.root.message}</p>
          </div>
        )}

        <div>
          <label className="label">Full name</label>
          <input {...register('name')} type="text" className={`input ${errors.name ? 'input-error' : ''}`} placeholder="John Doe" autoComplete="name" />
          {errors.name && <p className="error-text">{errors.name.message}</p>}
        </div>

        <div>
          <label className="label">Email address</label>
          <input {...register('email')} type="email" className={`input ${errors.email ? 'input-error' : ''}`} placeholder="you@example.com" autoComplete="email" />
          {errors.email && <p className="error-text">{errors.email.message}</p>}
        </div>

        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input {...register('password')} type={showPassword ? 'text' : 'password'} className={`input pr-10 ${errors.password ? 'input-error' : ''}`} placeholder="Create a strong password" autoComplete="new-password" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="error-text">{errors.password.message}</p>}
          <PasswordStrength password={password} />
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
          {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : <><UserPlus size={16} /> Create account</>}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-sky-500 hover:text-sky-600 font-medium transition-colors">Sign in</Link>
      </p>
    </div>
  )
}
