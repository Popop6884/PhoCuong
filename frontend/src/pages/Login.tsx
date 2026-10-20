import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ email: string; password: string }>()

  if (user) {
    const dest = user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : '/customer'
    navigate(dest, { replace: true })
    return null
  }

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      await login(data.email, data.password)
      toast.success('Đăng nhập thành công!')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Đăng nhập thất bại')
    }
  }

  return (
    <div className="pt-24 pb-20 min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="font-serif text-brand-gold text-4xl font-bold mb-2">Phở Cường</div>
          <div className="section-subtitle">Đăng nhập tài khoản</div>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                placeholder="email@example.com"
                className="input-field"
                {...register('email', { required: 'Nhập email', pattern: { value: /\S+@\S+\.\S+/, message: 'Email không hợp lệ' } })}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pr-10"
                  {...register('password', { required: 'Nhập mật khẩu', minLength: { value: 6, message: 'Tối thiểu 6 ký tự' } })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-cream/50 hover:text-brand-gold transition-colors focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gold w-full justify-center py-3 text-base disabled:opacity-50"
            >
              {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-brand-gold/10 space-y-3">
            <p className="text-brand-cream/50 text-sm text-center">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-brand-gold hover:underline">Đăng ký ngay</Link>
            </p>
            <div className="bg-brand-brown/50 rounded p-3 text-xs text-brand-cream/40 space-y-1">
              <div className="text-brand-gold/60 font-medium mb-1">Tài khoản demo:</div>
              <div>Admin: admin@phocuong.vn / admin123</div>
              <div>Nhân viên: staff@phocuong.vn / staff123</div>
              <div>Khách hàng: customer@phocuong.vn / customer123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
