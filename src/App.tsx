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

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppLayout() {
  const location = useLocation()
  const isHome = location.pathname === '/'

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
          <Route path="/profil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/news/:slug" element={<NewsArticle />} />
          <Route
            path="/classements"
            element={<Placeholder title="Classements" subtitle="Les classements arrivent en Saison 2." icon="trophy" />}
          />
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
          <Route
            path="/regles"
            element={<Placeholder title="Règles" subtitle="Les règles du serveur seront publiées au lancement officiel." icon="help" />}
          />
          <Route
            path="/support"
            element={<Placeholder title="Support" subtitle="Pour toute question, rejoins le Discord et ouvre un ticket." icon="help" />}
          />
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
