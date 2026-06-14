import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './hooks/useAuth'
import Header from './components/layout/Header'
import NavBar from './components/layout/NavBar'
import Footer from './components/layout/Footer'
import Hero from './components/home/Hero'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Modes from './pages/Modes'
import Boutique from './pages/Boutique'
import Vote from './pages/Vote'
import Login from './pages/Login'
import Register from './pages/Register'
import Placeholder from './pages/Placeholder'
import Profile from './pages/Profile'
import AdminDashboard from './pages/admin/AdminDashboard'
import NewsArticle from './pages/NewsArticle'
import NotFound from './pages/NotFound'
import Regles from './pages/Regles'
import MentionsLegales from './pages/MentionsLegales'
import Support from './pages/Support'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Classements from './pages/Classements'
import LaunchPage from './pages/LaunchPage'

const LAUNCH_MODE = import.meta.env.VITE_LAUNCH_MODE === 'true'

const STAFF_ROUTES = ['/connexion', '/inscription', '/admin', '/profil', '/mot-de-passe-oublie', '/reinitialiser-mot-de-passe']

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppLayout() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  if (LAUNCH_MODE && !STAFF_ROUTES.some(r => location.pathname.startsWith(r))) {
    return <LaunchPage />
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Header />
      {isHome && <Hero />}
      <NavBar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/modes" element={<Modes />} />
          <Route path="/boutique" element={<Boutique />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/connexion" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/inscription" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/mot-de-passe-oublie" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
          <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />
          <Route path="/profil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/news/:slug" element={<NewsArticle />} />
          <Route path="/classements" element={<Classements />} />
          <Route
            path="/forum"
            element={<Placeholder title="Forum" subtitle="Le forum ouvre bientôt. Rejoins le Discord en attendant." icon="forum" />}
          />
          <Route
            path="/carte"
            element={<Placeholder title="Carte dynamique" subtitle="La carte du monde sera disponible au lancement officiel." icon="map" />}
          />
          <Route
            path="/wiki"
            element={<Placeholder title="Wiki" subtitle="Le wiki communautaire arrive après le lancement." icon="wiki" />}
          />
          <Route path="/regles" element={<Regles />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/support" element={<Support />} />
          <Route path="/contact" element={<Navigate to="/support" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  )
}
