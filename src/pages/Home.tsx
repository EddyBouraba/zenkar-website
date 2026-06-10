import NewsSection from '../components/home/NewsSection'
import ModesSection from '../components/home/ModesSection'
import MysteryDustSection from '../components/home/MysteryDustSection'
import KingdomStatus from '../components/home/KingdomStatus'
import SEO from '../components/SEO'

const HOME_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Zenkar',
  description: 'Serveur Minecraft SMP Semi-RP français — explorez un monde vivant et forgez votre légende.',
  url: 'https://zenkar.fr',
  genre: ['Survival', 'Role-playing'],
  gamePlatform: 'Minecraft Java Edition',
  applicationCategory: 'Game',
  inLanguage: 'fr',
  publisher: {
    '@type': 'Organization',
    name: 'Zenkar',
    url: 'https://zenkar.fr',
  },
}

export default function Home() {
  return (
    <>
      <SEO
        canonical="/"
        jsonLd={HOME_JSON_LD}
      />
      <NewsSection />
      <KingdomStatus />
      <ModesSection />
      <MysteryDustSection />
    </>
  )
}
