import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Calendar, ShoppingBag, Star, ChevronRight, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { reservationApi, orderApi } from '../../api/client'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-900/30 text-yellow-400',
  confirmed: 'bg-blue-900/30 text-blue-400',
  seated: 'bg-purple-900/30 text-purple-400',
  completed: 'bg-green-900/30 text-green-400',
  cancelled: 'bg-red-900/30 text-red-400',
  preparing: 'bg-orange-900/30 text-orange-400',
  ready: 'bg-cyan-900/30 text-cyan-400',
  delivered: 'bg-green-900/30 text-green-400',
}

const statusLabels: Record<string, string> = {
  pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', seated: 'Đã ngồi',
  completed: 'Hoàn thành', cancelled: 'Đã hủy', preparing: 'Đang làm',
  ready: 'Sẵn sàng', delivered: 'Đã giao',
}

export default function CustomerDashboard() {
  const { user } = useAuth()

  const { data: reservations } = useQuery({
    queryKey: ['my-reservations'],
    queryFn: () => reservationApi.getMy().then(r => r.data),
  })

  const { data: orders } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderApi.getMy().then(r => r.data),
  })

  const recentReservations = (reservations || []).slice(0, 3)
  const recentOrders = (orders || []).slice(0, 3)

  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-12">
      {/* Welcome */}
      <div className="card p-6 mb-8 flex items-center gap-4">
        <div className="w-14 h-14 bg-brand-red rounded-full flex items-center justify-center text-2xl font-bold text-white font-serif">
          {user?.name[0].toUpperCase()}
        </div>
        <div>
          <h1 className="font-serif text-brand-gold text-2xl font-bold">Xin chào, {user?.name}!</h1>
          <p className="text-brand-cream/50 text-sm">Thành viên Phở Cường · {user?.email}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { to: '/booking', icon: Calendar, label: 'Đặt bàn', color: 'text-brand-gold' },
          { to: '/menu', icon: ShoppingBag, label: 'Thực đơn', color: 'text-blue-400' },
          { to: '/customer/reservations', icon: Calendar, label: 'Lịch đặt bàn', color: 'text-green-400' },
          { to: '/customer/orders', icon: ShoppingBag, label: 'Đơn hàng', color: 'text-purple-400' },
        ].map(({ to, icon: Icon, label, color }) => (
          <Link key={to} to={to} className="card p-4 text-center hover:border-brand-gold/40 transition-all group">
            <Icon size={24} className={`${color} mx-auto mb-2 group-hover:scale-110 transition-transform`} />
            <div className="text-brand-cream/70 text-sm">{label}</div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Reservations */}
        <div className="card">
          <div className="p-4 border-b border-brand-gold/10 flex items-center justify-between">
            <h2 className="font-serif text-brand-gold font-semibold flex items-center gap-2">
              <Calendar size={16} /> Đặt bàn gần đây
            </h2>
            <Link to="/customer/reservations" className="text-brand-gold/60 hover:text-brand-gold text-xs flex items-center gap-1">
              Xem tất cả <ChevronRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-brand-gold/10">
            {recentReservations.length === 0 ? (
              <div className="p-6 text-center text-brand-cream/40 text-sm">
                Chưa có đặt bàn nào
                <br />
                <Link to="/booking" className="text-brand-gold hover:underline mt-1 inline-block">Đặt bàn ngay</Link>
              </div>
            ) : recentReservations.map((r: any) => (
              <div key={r.ID} className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-brand-cream/80 text-sm font-medium">
                    {new Date(r.date).toLocaleDateString('vi-VN')} · {r.time_slot}
                  </span>
                  <span className={`badge ${statusColors[r.status]}`}>{statusLabels[r.status]}</span>
                </div>
                <div className="text-brand-cream/50 text-xs">{r.guests} khách · {r.note || 'Không có ghi chú'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="p-4 border-b border-brand-gold/10 flex items-center justify-between">
            <h2 className="font-serif text-brand-gold font-semibold flex items-center gap-2">
              <ShoppingBag size={16} /> Đơn hàng gần đây
            </h2>
            <Link to="/customer/orders" className="text-brand-gold/60 hover:text-brand-gold text-xs flex items-center gap-1">
              Xem tất cả <ChevronRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-brand-gold/10">
            {recentOrders.length === 0 ? (
              <div className="p-6 text-center text-brand-cream/40 text-sm">Chưa có đơn hàng nào</div>
            ) : recentOrders.map((o: any) => (
              <div key={o.ID} className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-brand-cream/80 text-sm font-medium">Đơn #{o.ID}</span>
                  <span className={`badge ${statusColors[o.status]}`}>{statusLabels[o.status]}</span>
                </div>
                <div className="text-brand-cream/50 text-xs">
                  {o.items?.length} món · {o.total_amount?.toLocaleString('vi-VN')}đ
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Profile info */}
      <div className="card mt-8 p-6">
        <h2 className="font-serif text-brand-gold font-semibold flex items-center gap-2 mb-4">
          <User size={16} /> Thông tin cá nhân
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-brand-cream/40 text-xs mb-1">Họ tên</div>
            <div className="text-brand-cream/80">{user?.name}</div>
          </div>
          <div>
            <div className="text-brand-cream/40 text-xs mb-1">Email</div>
            <div className="text-brand-cream/80">{user?.email}</div>
          </div>
          <div>
            <div className="text-brand-cream/40 text-xs mb-1">Điện thoại</div>
            <div className="text-brand-cream/80">{user?.phone || '—'}</div>
          </div>
          <div>
            <div className="text-brand-cream/40 text-xs mb-1">Thành viên từ</div>
            <div className="text-brand-cream/80">Khách hàng thân thiết</div>
          </div>
        </div>
      </div>
    </div>
  )
}
