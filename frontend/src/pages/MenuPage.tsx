import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { menuApi, orderApi } from '../api/client'
import { useAuth } from '../contexts/AuthContext'

const categories = [
  { value: '', label: 'Tất cả' },
  { value: 'pho', label: 'Phở' },
  { value: 'com_tam', label: 'Cơm tấm' },
  { value: 'drink', label: 'Đồ uống' },
  { value: 'topping', label: 'Thêm vào' },
]

type CartItem = {
  menu_item_id: number
  name: string
  price: number
  quantity: number
  note?: string
}

function formatPrice(p: number) {
  return p.toLocaleString('vi-VN') + 'đ'
}

export default function MenuPage() {
  const { user } = useAuth()
  const isCustomer = user?.role === 'customer'

  const [cat, setCat] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [orderNote, setOrderNote] = useState('')
  const [placing, setPlacing] = useState(false)

  const { data: items, isLoading } = useQuery({
    queryKey: ['menu', cat],
    queryFn: () => menuApi.getAll({ category: cat || undefined, available: true }).then(r => r.data),
  })

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((x) => x.menu_item_id === item.ID)
      if (existing) {
        return prev.map((x) =>
          x.menu_item_id === item.ID ? { ...x, quantity: x.quantity + 1 } : x
        )
      }

      return [
        ...prev,
        {
          menu_item_id: item.ID,
          name: item.name,
          price: item.price,
          quantity: 1,
          note: '',
        },
      ]
    })
  }

  const updateQty = (menuItemId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.menu_item_id === menuItemId
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const updateNote = (menuItemId: number, note: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.menu_item_id === menuItemId ? { ...item, note } : item
      )
    )
  }

  const removeItem = (menuItemId: number) => {
    setCart((prev) => prev.filter((item) => item.menu_item_id !== menuItemId))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Vui lòng chọn ít nhất 1 món')
      return
    }

    setPlacing(true)
    try {
      await orderApi.create({
        items: cart.map((item) => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          note: item.note || '',
        })),
        note: orderNote,
        table_number: '',
      })

      alert('Đặt hàng thành công! Đơn của bạn đang chờ xử lý.')
      setCart([])
      setOrderNote('')
    } catch (error: any) {
      alert(error?.response?.data?.error || 'Đặt hàng thất bại')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="section-subtitle">Nhà hàng Phở Cường</div>
          <h1 className="section-title">Thực Đơn</h1>
          <div className="gold-divider max-w-xs mx-auto mt-4 mb-6">✦</div>
          <p className="text-brand-cream/60 max-w-xl mx-auto text-sm">
            Tất cả món ăn được chế biến từ nguyên liệu tươi ngon, chọn lọc mỗi ngày
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => setCat(c.value)}
              className={`px-5 py-2 rounded-full text-sm font-medium border transition-all ${
                cat === c.value
                  ? 'bg-brand-gold text-brand-brown border-brand-gold'
                  : 'border-brand-gold/30 text-brand-cream/60 hover:border-brand-gold hover:text-brand-gold'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {isCustomer ? (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
            <div>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="card animate-pulse h-64" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(items || []).map((item: any) => (
                    <div key={item.ID} className="card group hover:border-brand-gold/40 transition-all duration-300 flex flex-col">
                      {item.image && (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-serif text-brand-gold font-semibold text-lg">{item.name}</h3>
                          <span className="text-brand-cream font-bold text-lg ml-2 shrink-0">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-brand-cream/50 text-sm flex-1">{item.description}</p>
                        )}
                        {!item.available && (
                          <div className="mt-3 text-xs text-brand-red-light font-medium">Tạm hết</div>
                        )}

                        <button
                          type="button"
                          onClick={() => addToCart(item)}
                          disabled={!item.available}
                          className="mt-4 w-full btn-gold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          + Thêm vào giỏ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {items?.length === 0 && (
                <div className="text-center text-brand-cream/50 py-20">Không có món nào trong danh mục này</div>
              )}
            </div>

            <aside className="card p-5 h-fit sticky top-24">
              <h3 className="font-serif text-brand-gold text-2xl mb-4">Giỏ hàng</h3>

              {cart.length === 0 ? (
                <div className="text-brand-cream/50 text-sm">Chưa có món nào trong giỏ</div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.menu_item_id} className="border border-brand-gold/20 rounded-lg p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-brand-cream font-medium">{item.name}</div>
                          <div className="text-brand-gold text-xs">
                            {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.menu_item_id)}
                          className="text-red-400 hover:text-red-300"
                          aria-label="Xóa món khỏi giỏ"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQty(item.menu_item_id, -1)}
                            className="w-7 h-7 rounded-full border border-brand-gold/30 flex items-center justify-center text-brand-cream"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center text-brand-cream">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.menu_item_id, 1)}
                            className="w-7 h-7 rounded-full border border-brand-gold/30 flex items-center justify-center text-brand-cream"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      <textarea
                        value={item.note || ''}
                        onChange={(e) => updateNote(item.menu_item_id, e.target.value)}
                        placeholder="Ghi chú cho món này..."
                        className="w-full mt-3 bg-transparent border border-brand-gold/20 rounded px-3 py-2 text-sm text-brand-cream placeholder:text-brand-cream/30"
                        rows={2}
                      />
                    </div>
                  ))}

                  <div className="pt-3 border-t border-brand-gold/20">
                    <label className="text-xs text-brand-cream/50 block mb-2">Ghi chú chung</label>
                    <textarea
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      placeholder="Ghi chú cho đơn hàng..."
                      className="w-full bg-transparent border border-brand-gold/20 rounded px-3 py-2 text-sm text-brand-cream placeholder:text-brand-cream/30"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center justify-between font-bold text-brand-gold mt-4">
                    <span>Tổng tiền</span>
                    <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={placing || cart.length === 0}
                    className="w-full btn-gold mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {placing ? 'Đang đặt...' : 'Đặt hàng'}
                  </button>
                </div>
              )}
            </aside>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="card animate-pulse h-64" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(items || []).map((item: any) => (
                  <div key={item.ID} className="card group hover:border-brand-gold/40 transition-all duration-300 flex flex-col">
                    {item.image && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-serif text-brand-gold font-semibold text-lg">{item.name}</h3>
                        <span className="text-brand-cream font-bold text-lg ml-2 shrink-0">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-brand-cream/50 text-sm flex-1">{item.description}</p>
                      )}
                      {!item.available && (
                        <div className="mt-3 text-xs text-brand-red-light font-medium">Tạm hết</div>
                      )}

                    </div>
                  </div>
                ))}
              </div>
            )}

            {items?.length === 0 && (
              <div className="text-center text-brand-cream/50 py-20">Không có món nào trong danh mục này</div>
            )}
          </div>
        )}

        <div className="mt-16 text-center p-8 card border-brand-gold/30">
          <ShoppingBag className="text-brand-gold mx-auto mb-4" size={32} />
          <h3 className="font-serif text-brand-gold text-2xl mb-2">Đặt bàn hoặc gọi món</h3>
          <p className="text-brand-cream/60 mb-6">Đặt bàn trước để được phục vụ tốt nhất, hoặc đến trực tiếp nhà hàng</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/booking" className="btn-gold">Đặt bàn ngay</Link>
            <a href="tel:02438268866" className="btn-outline">Gọi 024 3826 8866</a>
          </div>
        </div>
      </div>
    </div>
  )
}
