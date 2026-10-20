import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Users, ShoppingBag, Calendar, DollarSign, UtensilsCrossed, ImageIcon, Star, Settings, TrendingUp } from 'lucide-react'
import { adminApi } from '../../api/client'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-900/30 text-yellow-400',
  confirmed: 'bg-blue-900/30 text-blue-400',
  preparing: 'bg-orange-900/30 text-orange-400',
  ready: 'bg-cyan-900/30 text-cyan-400',
  delivered: 'bg-green-900/30 text-green-400',
  cancelled: 'bg-red-900/30 text-red-400',
  completed: 'bg-green-900/30 text-green-400',
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboard().then(r => r.data),
    refetchInterval: 60000,
  })

  const statCards = [
    { label: 'Khách hàng', value: stats?.total_users || 0, icon: Users, color: 'text-blue-400', to: '/admin/users' },
    { label: 'Tổng đơn hàng', value: stats?.total_orders || 0, icon: ShoppingBag, color: 'text-orange-400', to: '/staff/orders' },
    { label: 'Tổng đặt bàn', value: stats?.total_reservations || 0, icon: Calendar, color: 'text-purple-400', to: '/staff/reservations' },
    { label: 'Doanh thu', value: (stats?.total_revenue || 0).toLocaleString('vi-VN') + ' VND', icon: DollarSign, color: 'text-green-400', to: '/admin' },
    { label: 'Đơn chờ', value: stats?.pending_orders || 0, icon: TrendingUp, color: 'text-yellow-400', to: '/staff/orders' },
    { label: 'Đặt bàn chờ', value: stats?.pending_reservations || 0, icon: Calendar, color: 'text-red-400', to: '/staff/reservations' },
  ]

  const adminLinks = [
    { to: '/admin/menu', icon: UtensilsCrossed, label: 'Quản lý thực đơn', desc: 'Thêm/sửa/xóa các món ăn' },
    { to: '/admin/gallery', icon: ImageIcon, label: 'Quản lý hình ảnh', desc: 'Bộ sưu tập ảnh nhà hàng' },
    { to: '/admin/users', icon: Users, label: 'Quản lý người dùng', desc: 'Phân quyền và quản lý tài khoản' },
    { to: '/admin/reviews', icon: Star, label: 'Duyệt đánh giá', desc: 'Kiểm duyệt nhận xét từ khách' },
    { to: '/admin/settings', icon: Settings, label: 'Cài đặt', desc: 'Thông tin và cài đặt nhà hàng' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
      <div className="mb-8">
        <h1 className="font-serif text-brand-gold text-3xl font-bold">Trang Quản Trị</h1>
        <p className="text-brand-cream/50 text-sm mt-1">Phở Cường — Quản lý toàn bộ hoạt động nhà hàng</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <div key={i} className="card h-24 animate-pulse" />)
        ) : statCards.map(({ label, value, icon: Icon, color, to }) => (
          <Link key={label} to={to} className="card p-5 hover:border-brand-gold/40 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-brand-cream/50 text-xs font-medium uppercase tracking-wide">{label}</span>
              <Icon size={16} className={`${color} group-hover:scale-110 transition-transform`} />
            </div>
            <div className={`font-sans font-bold text-2xl ${color}`}>{value}</div>
          </Link>
        ))}
      </div>

      {/* Management Links */}
      <h2 className="font-serif text-brand-gold text-xl font-semibold mb-4">Quản lý</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {adminLinks.map(({ to, icon: Icon, label, desc }) => (
          <Link key={to} to={to} className="card p-5 hover:border-brand-gold/40 transition-all group flex items-start gap-3">
            <div className="w-10 h-10 bg-brand-red/20 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-brand-red/30 transition-colors">
              <Icon size={18} className="text-brand-gold" />
            </div>
            <div>
              <div className="text-brand-cream/90 font-medium text-sm">{label}</div>
              <div className="text-brand-cream/40 text-xs mt-0.5">{desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent data */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="card">
          <div className="p-4 border-b border-brand-gold/10">
            <h3 className="font-serif text-brand-gold font-semibold">Đơn hàng gần đây</h3>
          </div>
          <div className="divide-y divide-brand-gold/10">
            {(stats?.recent_orders || []).length === 0 ? (
              <div className="p-4 text-center text-brand-cream/40 text-sm">Chưa có đơn hàng</div>
            ) : (stats?.recent_orders || []).map((o: any) => (
              <div key={o.ID} className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-brand-cream/80 text-sm">Đơn #{o.ID} · {o.customer?.name}</div>
                  <div className="text-brand-cream/40 text-xs">{o.total_amount?.toLocaleString('vi-VN')}đ</div>
                </div>
                <span className={`badge ${statusColors[o.status]}`}>{o.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="p-4 border-b border-brand-gold/10">
            <h3 className="font-serif text-brand-gold font-semibold">Đặt bàn gần đây</h3>
          </div>
          <div className="divide-y divide-brand-gold/10">
            {(stats?.recent_reservations || []).length === 0 ? (
              <div className="p-4 text-center text-brand-cream/40 text-sm">Chưa có đặt bàn</div>
            ) : (stats?.recent_reservations || []).map((r: any) => (
              <div key={r.ID} className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-brand-cream/80 text-sm">{r.customer?.name}</div>
                  <div className="text-brand-cream/40 text-xs">{new Date(r.date).toLocaleDateString('vi-VN')} · {r.time_slot} · {r.guests} khách</div>
                </div>
                <span className={`badge ${statusColors[r.status]}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
