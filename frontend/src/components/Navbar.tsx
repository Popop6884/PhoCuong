import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Phone, User, LogOut, ChefHat, ShieldCheck } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const { user, logout, isAdmin, isStaff } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const navLinks = [
    { href: '/', label: 'Trang chủ' },
    { href: '/menu', label: 'Thực đơn' },
    { href: '/gallery', label: 'Hình ảnh' },
    ...(user?.role === 'staff' ? [] : [{ href: '/booking', label: 'Đặt bàn' }]),
  ]

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)

  const dashboardLink = () => {
    if (isAdmin) return '/admin'
    if (isStaff) return '/staff'
    return '/customer'
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-brand-brown/95 backdrop-blur-sm border-b border-brand-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-red rounded-full flex items-center justify-center text-brand-gold font-serif font-bold text-sm">P</div>
            <div>
              <div className="font-serif text-brand-gold font-bold text-lg leading-tight">Phở Cường</div>
              <div className="text-brand-cream/40 text-[9px] tracking-widest uppercase leading-tight">Since 1985</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`nav-link text-sm font-medium transition-colors ${isActive(link.href) ? 'text-brand-gold' : 'text-brand-cream/70 hover:text-brand-cream'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            <a href="tel:02438268866" className="text-brand-cream/60 hover:text-brand-gold text-sm flex items-center gap-1">
              <Phone size={14} />
              024 3826 8866
            </a>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 text-brand-cream/80 hover:text-brand-gold transition-colors text-sm"
                >
                  <div className="w-8 h-8 bg-brand-red rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name}</span>
                </button>
                {dropOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-brand-brown-light border border-brand-gold/20 rounded-lg shadow-xl overflow-hidden">
                    <div className="px-4 py-2 border-b border-brand-gold/10">
                      <div className="text-brand-gold text-xs font-medium">{user.role === 'admin' ? 'Quản trị viên' : user.role === 'staff' ? 'Nhân viên' : 'Khách hàng'}</div>
                      <div className="text-brand-cream/60 text-xs truncate">{user.email}</div>
                    </div>
                    <button onClick={() => { navigate(dashboardLink()); setDropOpen(false) }} className="w-full px-4 py-2 text-left text-sm text-brand-cream/80 hover:bg-brand-gold/10 hover:text-brand-gold flex items-center gap-2">
                      {isAdmin ? <ShieldCheck size={14} /> : isStaff ? <ChefHat size={14} /> : <User size={14} />}
                      Trang của tôi
                    </button>
                    <button onClick={() => { logout(); setDropOpen(false) }} className="w-full px-4 py-2 text-left text-sm text-brand-cream/80 hover:bg-brand-red/20 hover:text-brand-red-light flex items-center gap-2">
                      <LogOut size={14} />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-gold text-sm py-2 px-4">Đăng nhập</Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setOpen(!open)} className="md:hidden text-brand-cream/70 hover:text-brand-gold">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-brand-brown-light border-t border-brand-gold/20 px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setOpen(false)}
              className={`block text-sm py-2 ${isActive(link.href) ? 'text-brand-gold' : 'text-brand-cream/70'}`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-brand-gold/10">
            {user ? (
              <>
                <button onClick={() => { navigate(dashboardLink()); setOpen(false) }} className="block w-full text-left text-sm py-2 text-brand-cream/70">Trang của tôi</button>
                <button onClick={() => { logout(); setOpen(false) }} className="block w-full text-left text-sm py-2 text-brand-red-light">Đăng xuất</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="btn-gold text-sm w-full justify-center">Đăng nhập</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
