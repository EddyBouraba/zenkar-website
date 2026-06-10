# Zenkar — Todo

## À faire côté serveur (nécessite accès au serveur Minecraft)
- [ ] **État du royaume** — brancher les vraies données (joueurs en ligne, version, statut) sur l'endpoint `/stats` dans `backend/main.py`

## À faire côté toi (clés / comptes externes)
- [ ] **Reset de mot de passe** — choisir un service email (SMTP OVH, Resend, Mailgun...) et configurer `SMTP_*` dans `backend/.env`
- [ ] **Liens réseaux sociaux** — remplacer les `href="#"` dans `src/components/home/NewsSection.tsx` (Discord, YouTube, TikTok, Twitter)
- [ ] **Lien Discord** dans le règlement (`src/pages/Regles.tsx` ligne ~123) — remplacer `href="#"` par le vrai lien d'invitation
- [ ] **Google Search Console** — déclarer le sitemap dynamique : `https://api.zenkar.fr/sitemap.xml`
- [ ] **Image og-default.jpg** — déjà générée dans `public/`, vérifier qu'elle est bien servie en prod

## À faire côté code
- [ ] **Turnstile sur /auth/login** — le token est envoyé depuis le frontend mais le backend ne le vérifie pas encore (seulement sur `/auth/register`)
- [ ] **Sitemap articles** — les articles sont inclus dynamiquement, mais penser à re-soumettre le sitemap dans Search Console après chaque gros lot de publications

## En attente / plus tard
- [ ] **Forum** — remplacer le placeholder "bientôt disponible" quand le forum sera prêt
- [ ] **Classements** — page placeholder, à brancher sur les données du serveur en Saison 2
- [ ] **Carte dynamique** — page placeholder, à brancher sur Dynmap ou BlueMap au lancement
- [ ] **Wiki** — page placeholder, à ouvrir après le lancement

## Fait ✓
- [x] SEO complet (react-helmet-async, og:image, Schema.org, sitemap dynamique, robots.txt)
- [x] Favicon — croix pattée dorée
- [x] og-default.jpg générée (1200×630)
- [x] Turnstile Cloudflare invisible sur inscription + connexion
- [x] Grades boutique (Pionnier / Vétéran / Conquérant / Légende / VIP) — profil + admin dashboard
- [x] Erreurs de formulaire inline (inscription)
- [x] JWT en cookie HttpOnly (login, register, Discord OAuth)
- [x] Anti-abus compte Minecraft (rate limiting + cooldown 24h)
- [x] Audit sécurité — XSS (DOMPurify), CSRF OAuth, PyJWT, python-multipart
- [x] Page 404 personnalisée
- [x] Page Règlement
- [x] Forum "bientôt disponible" (sans mock data)
