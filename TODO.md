# Zenkar — Todo

## À faire côté toi (clés / comptes externes)
- [ ] **Reset de mot de passe** — choisir un service email (SMTP OVH, Resend, Mailgun...) et configurer `SMTP_*` dans `backend/.env`
- [ ] **Liens réseaux sociaux** — remplacer les `href="#"` dans `src/components/home/NewsSection.tsx` (Discord, YouTube, TikTok, Twitter)
- [ ] **Lien Discord** dans le règlement (`src/pages/Regles.tsx` ligne ~123) — remplacer `href="#"` par le vrai lien d'invitation
- [ ] **Google Search Console** — déclarer le sitemap dynamique : `https://api.zenkar.fr/sitemap.xml`
- [ ] **`hide-online-players=false`** dans `server.properties` sur le VPS Minecraft pour afficher le vrai compteur de joueurs

## À faire côté code
- [x] **Turnstile sur /auth/login** — vérifié côté backend
- [ ] **Sitemap articles** — les articles sont inclus dynamiquement, penser à re-soumettre dans Search Console après chaque gros lot de publications

## En attente / plus tard
- [ ] **Forum** — remplacer le placeholder "bientôt disponible" quand le forum sera prêt
- [ ] **Classements** — page placeholder, à brancher sur les données du serveur en Saison 2
- [ ] **Carte dynamique** — page placeholder, à brancher sur Dynmap ou BlueMap au lancement
- [ ] **Wiki** — page placeholder, à ouvrir après le lancement
- [ ] **TPS live** — actuellement statique à 20.0, à brancher sur un plugin Paper (ex: Spark API) quand disponible

## Fait ✓
- [x] SEO complet (react-helmet-async, og:image, Schema.org, sitemap dynamique, robots.txt)
- [x] Favicon — croix pattée dorée
- [x] og-default.jpg générée (1200×630)
- [x] Turnstile Cloudflare invisible sur inscription + connexion
- [x] Grades boutique (Pionnier / Vétéran / Conquérant / Légende / VIP) — profil + admin dashboard
- [x] Grade Fondateur — protégé contre modifications admin, badge diamant rose
- [x] Erreurs de formulaire inline (inscription)
- [x] JWT en cookie HttpOnly (login, register, Discord OAuth)
- [x] Anti-abus compte Minecraft (rate limiting + cooldown 24h)
- [x] Audit sécurité — XSS (DOMPurify), CSRF OAuth, PyJWT, python-multipart
- [x] Page 404 personnalisée
- [x] Page Règlement
- [x] Forum "bientôt disponible" (sans mock data)
- [x] Dashboard admin — gestion news, utilisateurs, badges
- [x] Système de badges joueur — création, assignation, affichage profil
- [x] Réactions aux articles (🔥 ❤️ 👏 😮) + articles similaires
- [x] Catégories d'articles (annonce, event, update, communauté)
- [x] Composant GradeBadge — affichage unifié des grades partout
- [x] État du Royaume — live via mcsrvstat.us (statut, joueurs, version, TPS) — rafraîchissement 60s
- [x] Liens boutique branchés sur Tebex (grades → packages, cosmétiques → mystery-dust)
- [x] Bouton "Soutenir Zenkar" redirige vers page /boutique interne
- [x] Déploiement prod MiniPC — Docker + Caddy + Cloudflare Tunnel + PostgreSQL
- [x] Migration DB — colonnes minecraft_username, minecraft_uuid, minecraft_linked_at, grade, is_admin ajoutées en prod
