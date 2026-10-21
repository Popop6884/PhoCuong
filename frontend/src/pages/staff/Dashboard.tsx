import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Calendar, ShoppingBag, Clock, ChefHat } from 'lucide-react'
import { reservationApi, orderApi } from '../../api/client'
import { useAuth } from '../../contexts/AuthContext'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-900/30 text-yellow-400',
  confirmed: 'bg-blue-900/30 text-blue-400',
  preparing: 'bg-orange-900/30 text-orange-400',
  ready: 'bg-cyan-900/30 text-cyan-400',
  delivered: 'bg-green-900/30 text-green-400',
  cancelled: 'bg-red-900/30 text-red-400',
  seated: 'bg-purple-900/30 text-purple-400',
  completed: 'bg-green-900/30 text-green-400',
}

export default function StaffDashboard() {
  const { user } = useAuth()

  const { data: orders } = useQuery({
    queryKey: ['all-orders'],
    queryFn: () => orderApi.getAll().then(r => r.data),
    refetchInterval: 30000,
  })

  const { data: reservations } = useQuery({
    queryKey: ['all-reservations'],
    queryFn: () => reservationApi.getAll().then(r => r.data),
    refetchInterval: 30000,
  })

  const pendingOrders = (orders || []).filter((o: any) => o.status === 'pending').length
  const preparingOrders = (orders || []).filter((o: any) => o.status === 'preparing').length
  const pendingReservations = (reservations || []).filter((r: any) => r.status === 'pending').length

  const recentOrders = (orders || []).slice(0, 5)
  const todayReservations = (reservations || []).filter((r: any) => {
    const today = new Date().toDateString()
    return new Date(r.date).toDateString() === today
  })

  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
      <div className="flex items-center gap-3 mb-8">
        <ChefHat className="text-brand-gold" size={28} />
        <div>
          <h1 className="font-serif text-brand-gold text-3xl font-bold">Trang Nhân Viên</h1>
          <p className="text-brand-cream/50 text-sm">Xin chào, {user?.name}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Đơn chờ xử lý', value: pendingOrders, color: 'text-yellow-400', icon: ShoppingBag },
          { label: 'Đang chuẩn bị', value: preparingOrders, color: 'text-orange-400', icon: Clock },
          { label: 'Đặt bàn chờ duyệt', value: pendingReservations, color: 'text-blue-400', icon: Calendar },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="card p-5 text-center">
            <Icon size={24} className={`${color} mx-auto mb-2`} />
            <div className={`text-3xl font-bold font-serif ${color} mb-1`}>{value}</div>
            <div className="text-brand-cream/50 text-sm">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="card">
          <div className="p-4 border-b border-brand-gold/10 flex items-center justify-between">
            <h2 className="font-serif text-brand-gold font-semibold flex items-center gap-2">
              <ShoppingBag size={16} /> Đơn hàng gần đây
            </h2>
            <Link to="/staff/orders" className="text-brand-gold/60 hover:text-brand-gold text-xs">Xem tất cả →</Link>
          </div>
          <div className="divide-y divide-brand-gold/10">
            {recentOrders.length === 0 ? (
              <div className="p-6 text-center text-brand-cream/40 text-sm">Chưa có đơn hàng</div>
            ) : recentOrders.map((o: any) => (
              <div key={o.ID} className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-brand-cream/80 text-sm font-medium">Đơn #{o.ID} · {o.customer?.name}</div>
                  <div className="text-brand-cream/50 text-xs">{o.items?.length} món · {o.total_amount?.toLocaleString('vi-VN')}đ</div>
                </div>
                <span className={`badge ${statusColors[o.status]}`}>
                  {o.status === 'pending' ? 'Chờ' : o.status === 'preparing' ? 'Đang làm' : o.status === 'ready' ? 'Sẵn sàng' : o.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Today Reservations */}
        <div className="card">
          <div className="p-4 border-b border-brand-gold/10 flex items-center justify-between">
            <h2 className="font-serif text-brand-gold font-semibold flex items-center gap-2">
              <Calendar size={16} /> Đặt bàn hôm nay ({todayReservations.length})
            </h2>
            <Link to="/staff/reservations" className="text-brand-gold/60 hover:text-brand-gold text-xs">Xem tất cả →</Link>
          </div>
          <div className="divide-y divide-brand-gold/10">
            {todayReservations.length === 0 ? (
              <div className="p-6 text-center text-brand-cream/40 text-sm">Không có đặt bàn hôm nay</div>
            ) : todayReservations.map((r: any) => (
              <div key={r.ID} className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-brand-cream/80 text-sm font-medium">{r.time_slot} · {r.customer?.name}</div>
                  <div className="text-brand-cream/50 text-xs">{r.guests} khách</div>
                </div>
                <span className={`badge ${statusColors[r.status]}`}>
                  {r.status === 'pending' ? 'Chờ' : r.status === 'confirmed' ? 'Xác nhận' : r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <Link to="/staff/orders" className="card p-4 text-center hover:border-brand-gold/40 transition-all">
          <ShoppingBag className="text-brand-gold mx-auto mb-2" size={24} />
          <div className="text-brand-cream/70 text-sm">Quản lý đơn hàng</div>
        </Link>
        <Link to="/staff/reservations" className="card p-4 text-center hover:border-brand-gold/40 transition-all">
          <Calendar className="text-brand-gold mx-auto mb-2" size={24} />
          <div className="text-brand-cream/70 text-sm">Quản lý đặt bàn</div>
        </Link>
      </div>
    </div>
  )
}
