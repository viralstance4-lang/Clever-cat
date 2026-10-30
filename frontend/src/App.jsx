import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { Toaster } from 'react-hot-toast'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    if (window.fbq) window.fbq('track', 'PageView')
  }, [pathname])
  return null
}
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import WhatsAppButton from './components/ui/WhatsAppButton'
// Core conversion-path pages — kept eager since a homepage visitor is likely
// to hit these in quick succession.
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'

// Secondary pages — lazy-loaded so their code isn't in the bundle every
// homepage visitor downloads.
const LoginPage    = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ProfilePage  = lazy(() => import('./pages/ProfilePage'))
const OrdersPage   = lazy(() => import('./pages/OrdersPage'))
const AboutPage    = lazy(() => import('./pages/AboutPage'))
const IQJuniorPage = lazy(() => import('./pages/IQJuniorPage'))
const ContactPage  = lazy(() => import('./pages/ContactPage'))
const BlogPage     = lazy(() => import('./pages/BlogPage'))
const BlogDetail   = lazy(() => import('./pages/BlogDetailPage'))
const PolicyPage   = lazy(() => import('./pages/PolicyPage'))
import AdminRoute from './components/auth/AdminRoute'
import ThankYouPage from './pages/ThankYouPage'

// Admin panel is never visited by customers — lazy-load it so its code isn't
// part of the bundle every storefront visitor downloads.
const AdminLayout            = lazy(() => import('./components/admin/AdminLayout'))
const AdminDashboard         = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProducts          = lazy(() => import('./pages/admin/AdminProducts'))
const AdminProductForm       = lazy(() => import('./pages/admin/AdminProductForm'))
const AdminBlogs             = lazy(() => import('./pages/admin/AdminBlogs'))
const AdminBlogForm          = lazy(() => import('./pages/admin/AdminBlogForm'))
const AdminBlogCategories    = lazy(() => import('./pages/admin/AdminBlogCategories'))
const AdminBlogTags          = lazy(() => import('./pages/admin/AdminBlogTags'))
const AdminOrders            = lazy(() => import('./pages/admin/AdminOrders'))
const AdminUsers             = lazy(() => import('./pages/admin/AdminUsers'))
const AdminCoupons           = lazy(() => import('./pages/admin/AdminCoupons'))
const AdminSettings          = lazy(() => import('./pages/admin/AdminSettings'))
const AdminCategories        = lazy(() => import('./pages/admin/AdminCategories'))
const AdminFAQs              = lazy(() => import('./pages/admin/AdminFAQs'))
const AdminReviews           = lazy(() => import('./pages/admin/AdminReviews'))
const AdminPolicies          = lazy(() => import('./pages/admin/AdminPolicies'))
const AdminMedia             = lazy(() => import('./pages/admin/AdminMedia'))
const AdminLogos             = lazy(() => import('./pages/admin/AdminLogos'))
const AdminBanners           = lazy(() => import('./pages/admin/AdminBanners'))
const AdminConcerns          = lazy(() => import('./pages/admin/AdminConcerns'))
const AdminShopVideos        = lazy(() => import('./pages/admin/AdminShopVideos'))
const AdminTestimonials      = lazy(() => import('./pages/admin/AdminTestimonials'))
const AdminPriceRanges       = lazy(() => import('./pages/admin/AdminPriceRanges'))
const AdminHomepageSections  = lazy(() => import('./pages/admin/AdminHomepageSections'))
const AdminEnquiries         = lazy(() => import('./pages/admin/AdminEnquiries'))
const AdminPaymentSettings   = lazy(() => import('./pages/admin/AdminPaymentSettings'))
const AdminAnnouncements     = lazy(() => import('./pages/admin/AdminAnnouncements'))

function AdminFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-forest-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function SiteLayout() {
  return (
    <>
      <Navbar />
      {/* pb reserves space for the footer's wavy top edge (absolute + -translate-y-full,
          h-14/h-24) so it overlaps blank space instead of clipping page content. */}
      <main className="flex-1 pb-14 md:pb-24">
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#FCF8F0', color: '#3D1868', border: '1px solid #42307B' },
        }}
      />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/"             element={<HomePage />} />
          <Route path="/shop"         element={<ShopPage />} />
          <Route path="/products"     element={<ShopPage />} />
          <Route path="/store"        element={<ShopPage />} />
          <Route path="/shop/:slug"   element={<ProductPage />} />
          <Route path="/cart"         element={<CartPage />} />
          <Route path="/checkout"     element={<CheckoutPage />} />
          <Route path="/thank-you"    element={<ThankYouPage />} />
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/register"     element={<RegisterPage />} />
          <Route path="/profile"      element={<ProfilePage />} />
          <Route path="/orders"       element={<OrdersPage />} />
          <Route path="/about"        element={<AboutPage />} />
          <Route path="/iq-junior"    element={<IQJuniorPage />} />
          <Route path="/contact"      element={<ContactPage />} />
          <Route path="/blog"         element={<Navigate to="/blogs" replace />} />
          <Route path="/blogs"        element={<BlogPage />} />
          <Route path="/blog/:slug"   element={<BlogDetail />} />
          <Route path="/policy/:slug" element={<PolicyPage />} />
        </Route>

        <Route path="/admin" element={<AdminRoute><Suspense fallback={<AdminFallback />}><AdminLayout /></Suspense></AdminRoute>}>
          <Route index                    element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"         element={<AdminDashboard />} />
          <Route path="products"          element={<AdminProducts />} />
          <Route path="products/new"      element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="blogs"             element={<AdminBlogs />} />
          <Route path="blogs/new"         element={<AdminBlogForm />} />
          <Route path="blogs/:id/edit"    element={<AdminBlogForm />} />
          <Route path="categories"        element={<AdminCategories />} />
          <Route path="blog-categories"   element={<AdminBlogCategories />} />
          <Route path="blog-tags"         element={<AdminBlogTags />} />
          <Route path="orders"            element={<AdminOrders />} />
          <Route path="enquiries"         element={<AdminEnquiries />} />
          <Route path="users"             element={<AdminUsers />} />
          <Route path="reviews"           element={<AdminReviews />} />
          <Route path="coupons"           element={<AdminCoupons />} />
          <Route path="faqs"              element={<AdminFAQs />} />
          <Route path="policies"          element={<AdminPolicies />} />
          <Route path="media"             element={<AdminMedia />} />
          <Route path="logos"             element={<AdminLogos />} />
          <Route path="banners"           element={<AdminBanners />} />
          <Route path="concerns"          element={<AdminConcerns />} />
          <Route path="shop-videos"       element={<AdminShopVideos />} />
          <Route path="testimonials"      element={<AdminTestimonials />} />
          <Route path="announcements"     element={<AdminAnnouncements />} />
          <Route path="price-ranges"      element={<AdminPriceRanges />} />
          <Route path="homepage-builder"  element={<AdminHomepageSections />} />
          <Route path="settings"          element={<AdminSettings />} />
          <Route path="payment-settings"  element={<AdminPaymentSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
