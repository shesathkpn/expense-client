import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../utils/api'

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
})

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/forgot-password', { email: data.email })
      setSubmittedEmail(data.email)
      setSubmitted(true)
      toast.success('Check your email for reset instructions')
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to process request'
      setError('root', { message: msg })
      toast.error(msg)
    }
  }

  return (
    <div className="card p-8 animate-scale-in">
      {!submitted ? (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reset password</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter your email and we'll send reset instructions</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errors.root && (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.root.message}</p>
              </div>
            )}

            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  className={`input pl-9 ${errors.email ? 'input-error' : ''}`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : <>Send reset link</>}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-2">
            <Link to="/login" className="flex items-center gap-1 text-sm text-sky-500 hover:text-sky-600 font-medium transition-colors">
              <ArrowLeft size={14} />
              Back to login
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle size={48} className="text-emerald-500" />
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We've sent a password reset link to <span className="font-medium">{submittedEmail}</span>
            </p>
          </div>

          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 py-4">
            <p>• Check your inbox and spam folder</p>
            <p>• Click the link in the email</p>
            <p>• The link expires in 1 hour</p>
          </div>

          <Link
            to="/login"
            className="btn-primary w-full mt-6"
          >
            Back to login
          </Link>
        </div>
      )}
    </div>
  )
}
