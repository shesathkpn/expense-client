import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../utils/api'

const schema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export default function ConfirmResetPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const email = searchParams.get('email')
  const resetToken = searchParams.get('token')

  useEffect(() => {
    if (!email || !resetToken) {
      toast.error('Invalid password reset link')
      navigate('/forgot-password')
    }
  }, [email, resetToken, navigate])

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    if (!email || !resetToken) {
      setError('root', { message: 'Invalid reset link' })
      return
    }

    try {
      await api.post('/auth/reset-password', {
        email,
        resetToken,
        newPassword: data.newPassword,
      })
      
      toast.success('Password reset successfully!')
      setTimeout(() => navigate('/login'), 1500)
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to reset password'
      setError('root', { message: msg })
      toast.error(msg)
    }
  }

  if (!email || !resetToken) {
    return (
      <div className="card p-8 animate-scale-in text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Validating reset link...</p>
        <Link to="/forgot-password" className="text-sm text-sky-500 hover:text-sky-600">
          Request a new reset link
        </Link>
      </div>
    )
  }

  return (
    <div className="card p-8 animate-scale-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Set new password</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create a new password for your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errors.root && (
          <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl">
            <p className="text-sm text-red-600 dark:text-red-400">{errors.root.message}</p>
          </div>
        )}

        <div>
          <label className="label">New password</label>
          <div className="relative">
            <input
              {...register('newPassword')}
              type={showPassword ? 'text' : 'password'}
              className={`input pr-10 ${errors.newPassword ? 'input-error' : ''}`}
              placeholder="Enter your new password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.newPassword && <p className="error-text">{errors.newPassword.message}</p>}
        </div>

        <div>
          <label className="label">Confirm password</label>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              type={showConfirm ? 'text' : 'password'}
              className={`input pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
              placeholder="Confirm your new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="error-text">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
          {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Resetting...</> : <>Reset password</>}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-2">
        <Link to="/forgot-password" className="flex items-center gap-1 text-sm text-sky-500 hover:text-sky-600 font-medium transition-colors">
          <ArrowLeft size={14} />
          Back to request reset
        </Link>
      </div>
    </div>
  )
}
