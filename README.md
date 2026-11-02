# E-R.I — deuxième direction

HTML, CSS et JavaScript natifs, sans installation ni compilation. Ouvrir `dist/index.html` ou servir le dossier `dist/`.

Direction : composition éditoriale, fond blanc cassé, grande typographie, symbole de marque surdimensionné en arrière-plan. Sept solutions en accordéon, présentation courte et contact direct. Pas de grille de cartes ni d’illustrations techniques.

## Inclus

- Responsive : styles dédiés aux petits écrans.
- Accordéons natifs accessibles au clavier, dialogues natifs avec fermeture Échap.
- Logo en fond avec mouvement très discret au défilement ; mouvement désactivé si l’utilisateur le demande.
- Assistant de démonstration accessible depuis « Une question ? », sans bulle flottante.
- Liens e-mail, téléphone, portail d’assistance et espace client.

## Référencement

Six pages solutions locales : maintenance-infogerance.html, sauvegarde-hebergement.html, solution-logiciels.html, virtualisation.html, solution-connect.html et mailinblack.html. Chacune dispose de son propre accordéon sur l’accueil, au même niveau que Développement, puis d’une navigation entre solutions. Même thème, coordonnées, assistant et styles que l’accueil. Chaque page possède son titre, sa description, sa canonical et ses données WebPage ; les six URLs figurent dans le sitemap.

Contenus réécrits depuis les cinq anciennes pages E-R.I fournies. La page Mailinblack d’origine retourne HTTP 403 : contenu fondé sur la documentation officielle de Protect, à valider commercialement. Sources : https://support.mailinblack.com/en/articles/143154-how-does-mailinblack-filtering-work et https://support.mailinblack.com/fr/articles/143166-je-viens-de-cliquer-sur-un-lien-et-j-ai-une-alerte-secure-link-que-dois-je-faire . Les délais, tarifs et garanties non confirmés ne sont pas repris.

Le fichier dist/.htaccess prépare six redirections 301 des anciennes URLs vers les nouvelles pour un serveur Apache autorisant mod_alias et les fichiers .htaccess. Sur un autre hébergement, configurer les mêmes redirections dans sa configuration. Elles ne sont pas vérifiées sur le serveur de production.

Titre et description ciblés sur les services à Roanne, métadonnées Open Graph et Twitter, données structurées WebSite et LocalBusiness, robots.txt et sitemap.xml. Les coordonnées structurées reprennent celles visibles sur la page. Les avis clients ne sont pas balisés comme des notes agrégées de l’entreprise.

URL de production retenue : https://www.e-r-i.fr/. Avant publication, confirmer ce domaine et le chemin racine ; adapter ensemble canonical, og:url, JSON-LD, robots.txt et sitemap.xml si nécessaire. Servir le contenu de dist/ à la racine. Configurer les redirections HTTPS et www côté hébergement, puis soumettre le sitemap dans Google Search Console. Ces fichiers ne publient pas le site. Protéger une préproduction contre l’indexation au niveau de l’hébergement.

## Assets

Les deux PNG joints sont conservés dans `dist/assets/`. Des SVG constitués de quatre rectangles ont été dérivés des silhouettes des PNG pour conserver les proportions et avoir un logo net en grand. Le gris #DEDEDE et le bleu nuit #0F2033 viennent des fichiers fournis.

Figtree est chargée depuis Bunny Fonts ; une pile de polices système prend le relais hors connexion. Aucun autre service tiers n’est chargé par la page.

## Limites du premier jet

- L’assistant utilise un relais PHP vers Groq ; activation décrite ci-dessous.
- Le contact ouvre la messagerie ; aucun formulaire ni envoi serveur.
- Offres, textes, liens support et informations légales à valider avant ouverture publique.
- Aucun témoignage ou résultat client inventé.

## Assistant Groq sur mutualisé PHP

Prérequis : PHP 8.1 ou supérieur, extension cURL et accès HTTPS sortant à `api.groq.com`. Publier le contenu de `dist/` dans la racine publique (par exemple `public_html/`), y compris `api/chat.php`. GitHub Pages ne peut pas exécuter ce relais.

Copier `groq-config.example.php` sous le nom `groq-config.php` **un niveau au-dessus de la racine publique** : par exemple `groq-config.php` à côté de `public_html/`, jamais dedans. Renseigner la clé Groq dans ce fichier privé sur l’hébergement. Ne pas la committer, la placer dans le JavaScript ou l’envoyer dans le chat. Les variables serveur `GROQ_API_KEY` et `GROQ_MODEL`, si disponibles, prennent priorité sur le fichier. Le modèle par défaut est `llama-3.3-70b-versatile` ; il peut être remplacé dans la configuration selon les modèles accessibles au compte.

En local : `php -d display_errors=0 -d display_startup_errors=0 -S 127.0.0.1:8080 -t dist`, puis ouvrir `http://127.0.0.1:8080`. Sans clé, le relais retourne une erreur 503 explicite. Une fois configuré, envoyer une question depuis l’assistant pour vérifier la connexion réelle et les droits du modèle. API utilisée : [Groq Chat Completions](https://console.groq.com/docs/api-reference). Le fichier `api/.user.ini` masque les erreurs PHP dans les réponses sous PHP-FPM/CGI ; sous Wamp avec le module Apache, désactiver aussi `display_errors` et `display_startup_errors` dans la configuration PHP pour éviter que des avertissements de démarrage corrompent le JSON.

Le navigateur conserve deux échanges récents en mémoire et les transmet avec la question. Le serveur impose les rôles et le contexte E-R.I, limite le corps à 16 Ko, la réponse à 600 tokens et l’appel à 25 secondes. Aucun historique n’est enregistré par le relais. Un fichier temporaire partagé, hors racine publique, limite les appels à 10 par minute et par IP et 60 au total. Le répertoire temporaire PHP doit être accessible en écriture. Derrière un proxy, `REMOTE_ADDR` peut représenter plusieurs visiteurs ; aucun en-tête IP fourni par le client n’est considéré fiable. Ces limites ne remplacent pas les plafonds de consommation du compte Groq.

## Fichiers

- `dist/index.html` : structure et contenu.
- `dist/styles.css` : identité, composition et responsive.
- `dist/app.js` : dialogues, assistant et mouvement du fond.
- `dist/assets/` : symboles fournis et versions vectorielles.

## Thèmes clair et sombre

Bouton lune/soleil dans le menu. Au premier accès, le site suit le thème du système. Le choix manuel est conservé dans `localStorage` sous `eri-theme`, sans transmission au serveur. Le thème est appliqué avant l’affichage pour éviter le flash clair. Logos, favicon, texte, bordures et dialogues suivent le thème. Si le stockage est bloqué, le bouton reste fonctionnel pour la page courante.

## Défilement à deux plans

Le logo est dans le document, en calque absolu. Pour 100 px de défilement, le texte monte de 100 px et le logo de 50 px (ordinateur et mobile). Aucun suivi de souris ni plafond. requestAnimationFrame synchronise la transformation avec le scroll natif. La réduction des animations rétablit le même défilement naturel pour les deux plans.

## Avis clients — partie 02 / E-R.I

Huit avis Google complets 5 étoiles vérifiés le 2 novembre 2026 sur https://magasin.tel/f/e-r-i-6097958/. Notes individuelles vérifiées dans le HTML de chaque avis. Sélection statique, mise à jour manuelle, sans clé API.

Carrousel toutes les 6,5 secondes : deux avis sur bureau, un sur mobile. Commandes précédent, suivant et pause. Pause au survol, au focus et dans un onglet masqué. La réduction des animations désactive le défilement automatique. Sans JavaScript, tous les avis restent visibles.

## Transitions par section

- Accueil : titre qui apparaît, puis deuxième ligne et textes secondaires légèrement décalés dans le temps.
- Expertises : introduction latérale, puis lignes en cascade avec un dévoilement horizontal discret.
- Présentation : fondu lent et faible remontée. Citations avec un léger décalage entre elles.
- Contact : titre dévoilé du bas vers le haut, flèche en diagonale et coordonnées en fondu.

Déclenchement une seule fois, au passage dans la fenêtre, via IntersectionObserver et Web Animations API. Le contenu reste visible sans JavaScript ou si ces API ne sont pas disponibles. Aucun défilement forcé. La réduction des animations annule les effets, y compris si le réglage système change pendant la visite. Un contrôle atteint au clavier est immédiatement rendu sans animation d’entrée. Les couleurs et la parallaxe à 50 % sont conservées.

## Zooms et dézooms

Les apparitions combinent désormais de petites variations d’échelle : accueil 1,035 → 1 (dézoom) ; introduction et lignes d’expertises 0,98 / 0,985 → 1 (zoom) ; présentation 0,975 → 1 sans translation ; avis 1,025 → 1 ; contact 1,04 → 1. Durées de 1450 à 1950 ms pour les blocs concernés, sans rebond. Les mouvements latéraux/verticaux restants sont secondaires (8 à 10 px). Chaque animation revient à l’échelle exacte 1 et est retirée après lecture. La mise en page ne change pas. La préférence de réduction des animations et les protections clavier restent actives.

## Rythme des animations

Durées finales : accueil 1,85 s ; expertises 1,45–1,55 s ; présentation 1,55–1,7 s ; avis 1,6 s ; contact 1,95 s. Les fondus secondaires durent 0,95–1,3 s. Les durées ont été raccourcies d’environ 15 % par rapport à la version précédente, avec des décalages de départ légèrement réduits. Courbe douce, effets et amplitudes conservés. Les animations principales restent perceptibles, sans bloquer la navigation.
