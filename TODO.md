# Zenkar — Todo

## À faire côté toi (clés / comptes externes)
- [x] **Reset de mot de passe** — Resend + noreply@zenkar.fr, domaine vérifié SPF/DKIM, token SHA-256 usage unique 1h
- [ ] **Twitch** — remplacer `href="#"` dans `src/components/home/NewsSection.tsx` quand le compte est prêt
- [x] **`hide-online-players=false`** dans `server.properties` — confirmé actif
- [x] **Votifier plugin** — `VoteURL` mis à jour avec `https://www.serveursminecraft.org/serveur/7632/`

## En attente / plus tard
- [ ] **Forum** — remplacer le placeholder "bientôt disponible" quand le forum sera prêt
- [ ] **Classements** — page placeholder, à brancher sur les données du serveur en Saison 2
- [ ] **Carte dynamique** — page placeholder, à brancher sur Dynmap ou BlueMap au lancement
- [ ] **Wiki** — page placeholder, à ouvrir après le lancement
- [ ] **TPS live** — actuellement statique à 20.0, à brancher sur un plugin Paper (ex: Spark API) quand disponible
- [ ] **Référencement** — continuer à inscrire le serveur sur d'autres annuaires (topminecraft.fr, etc.)

## Fait ✓
- [x] SEO complet (react-helmet-async, og:image, Schema.org, sitemap dynamique, robots.txt)
- [x] Favicon — croix pattée dorée
- [x] og-default.jpg générée (1200×630)
- [x] Google Search Console — sitemap `https://api.zenkar.fr/sitemap.xml` soumis, 8 pages découvertes
- [x] Turnstile Cloudflare invisible sur inscription + connexion
- [x] Grades boutique (Pionnier / Vétéran / Conquérant / Légende / VIP) — profil + admin dashboard
- [x] Grade Fondateur — protégé contre modifications admin, badge diamant rose
- [x] Erreurs de formulaire inline (inscription)
- [x] JWT en cookie HttpOnly (login, register, Discord OAuth)
- [x] Anti-abus compte Minecraft (rate limiting + cooldown 24h)
- [x] Audit sécurité — XSS (DOMPurify), CSRF OAuth, PyJWT, python-multipart
- [x] Page 404 personnalisée
- [x] Page Règlement — avec lien Discord réel
- [x] Page Mentions légales — `/mentions-legales` (éditeur anonyme, RGPD, cookies, hébergement)
- [x] Page Support — `/support` avec catégories Discord ticket, FAQ, email contact
- [x] Forum "bientôt disponible" (sans mock data)
- [x] Dashboard admin — gestion news, utilisateurs, badges
- [x] Système de badges joueur — création, assignation, affichage profil
- [x] Réactions aux articles (🔥 ❤️ 👏 😮) + articles similaires
- [x] Catégories d'articles (annonce, event, update, communauté)
- [x] Composant GradeBadge — affichage unifié des grades partout
- [x] État du Royaume — live via mcsrvstat.us (statut, joueurs, version) — rafraîchissement 60s
- [x] Liens boutique branchés sur Tebex (grades → packages, cosmétiques → mystery-dust)
- [x] Bouton "Soutenir Zenkar" et footer boutique redirigent vers `/boutique` interne
- [x] Liens réseaux sociaux — Discord, YouTube, Twitter branchés ; TikTok en attente
- [x] Modal "Rejoindre le serveur" — tuto animé 4 étapes avec copy IP, remplace le bouton Jouer Maintenant
- [x] Vote — 5 sites (Top-Serveurs, Serveur-Prive, Minecraft-Server-List, Minecraft-MP, ServeursMinecraft.org)
- [x] Déploiement prod MiniPC — Docker + Caddy + Cloudflare Tunnel + PostgreSQL
- [x] Migration DB — colonnes minecraft_username, minecraft_uuid, minecraft_linked_at, grade, is_admin ajoutées en prod
