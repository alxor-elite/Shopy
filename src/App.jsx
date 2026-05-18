import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './hooks/useCart'
import { AuthProvider } from './hooks/useAuth'
import { WishlistProvider } from './hooks/useWishlist'
import { ToastProvider } from './components/Toast'
import AnnouncementBar from './components/AnnouncementBar'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Cart from './components/Cart'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Auth from './pages/Auth'
import Account from './pages/Account'
import Wishlist from './pages/Wishlist'
import { ShippingReturns, SizeGuide, ContactUs, FAQ } from './pages/HelpPages'
import AdminLogin from './pages/Admin/Login'
import AdminLayout from './pages/Admin/Layout'
import AdminDashboard from './pages/Admin/Dashboard'
import AdminProducts from './pages/Admin/Products'
import AdminCategories from './pages/Admin/Categories'
import AdminInventory from './pages/Admin/Inventory'
import AdminOrders from './pages/Admin/Orders'
import AdminSiteImages from './pages/Admin/SiteImages'
import AdminReturns from './pages/Admin/Returns'

function StorefrontLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F0EDE6' }}>
      <AnnouncementBar />
      <Navbar />
      <Cart />
      <main className="flex-1">{children}</main>
      <Footer />
      {/* Mobile bottom nav */}
      <div
        className="bottom-nav fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around h-[56px]"
        style={{ background: 'rgba(255,255,255,.7)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(217,212,203,.5)' }}
      >
        <a href="/" className="flex flex-col items-center gap-0.5">
          <i className="ti ti-home" style={{ fontSize: 20, color: '#1C1B1A' }} />
          <span className="text-[10px] text-[#6B6663]">Home</span>
        </a>
        <a href="/products" className="flex flex-col items-center gap-0.5">
          <i className="ti ti-search" style={{ fontSize: 20, color: '#1C1B1A' }} />
          <span className="text-[10px] text-[#6B6663]">Shop</span>
        </a>
        <a href="/wishlist" className="flex flex-col items-center gap-0.5">
          <i className="ti ti-heart" style={{ fontSize: 20, color: '#1C1B1A' }} />
          <span className="text-[10px] text-[#6B6663]">Wishlist</span>
        </a>
        <a href="/account" className="flex flex-col items-center gap-0.5">
          <i className="ti ti-user" style={{ fontSize: 20, color: '#1C1B1A' }} />
          <span className="text-[10px] text-[#6B6663]">Account</span>
        </a>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<StorefrontLayout><Home /></StorefrontLayout>} />
              <Route path="/products" element={<StorefrontLayout><Products /></StorefrontLayout>} />
              <Route path="/products/:id" element={<StorefrontLayout><ProductDetail /></StorefrontLayout>} />
              <Route path="/checkout" element={<StorefrontLayout><Checkout /></StorefrontLayout>} />
              <Route path="/order-confirmation/:id" element={<StorefrontLayout><OrderConfirmation /></StorefrontLayout>} />
              <Route path="/auth" element={<StorefrontLayout><Auth /></StorefrontLayout>} />
              <Route path="/account" element={<StorefrontLayout><Account /></StorefrontLayout>} />
              <Route path="/wishlist" element={<StorefrontLayout><Wishlist /></StorefrontLayout>} />
              <Route path="/shipping-returns" element={<StorefrontLayout><ShippingReturns /></StorefrontLayout>} />
              <Route path="/size-guide" element={<StorefrontLayout><SizeGuide /></StorefrontLayout>} />
              <Route path="/contact" element={<StorefrontLayout><ContactUs /></StorefrontLayout>} />
              <Route path="/faq" element={<StorefrontLayout><FAQ /></StorefrontLayout>} />

              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="site-images" element={<AdminSiteImages />} />
                <Route path="returns" element={<AdminReturns />} />
              </Route>
            </Routes>
          </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
