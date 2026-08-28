# Provenance des ressources

Ce document décrit uniquement les ressources distribuées dans ce dépôt. Il ne
constitue pas une licence pour les fichiers importés par les joueurs dans le
Studio personnalisé.

## Jingles intégrés

Les six signatures `Arcade Spark`, `Cosmic Bloom`, `Retro Pulse`,
`Neon Strike`, `Velvet Orbit` et `Prism Run` sont définies localement dans
`app.js` sous forme de notes, fréquences et durées, puis synthétisées à
l'exécution avec Web Audio. Aucun enregistrement sonore tiers n'est distribué
pour ces jingles. Le dépôt les déclare comme créations originales du projet
dans `README.md`.

Les identités de rivaux `NOVA`, `ORION`, `VEX`, `LYRA`, `SOL` et
`ECHO`, leurs objectifs et leurs textes sont également des créations
originales définies localement dans l'application.

## Identité visuelle et icônes

L'identité « Jingle Duel » est dessinée par l'interface locale. Les deux seuls
fichiers bitmap distribués sont les icônes d'application :

- `assets/icon-192.png` — icône PNG 192 × 192 ; SHA-256
  `71c69cc5f622fb7e8f255e0e43f2ef37a14c2591236326c1ed65fddc6832945e` ;
- `assets/icon-512.png` — icône PNG 512 × 512 ; SHA-256
  `e7a48abffedb97ef4e02035581c8b8dce72ffa4f652e4eeb48cdba48025dcc9c`.

Le dépôt ne contient pas de fichier source, de métadonnée intégrée ou de note
de génération permettant d'attribuer plus précisément leur outil de création.
Elles sont donc répertoriées factuellement comme ressources locales du dépôt,
sans revendiquer un auteur ou un outil non documenté.

## Intégrité

Le build calcule une révision SHA-256 déterministe à partir du chemin et du
contenu de chaque fichier publié, avant de remplacer le placeholder du service
worker. La révision exacte est affichée par `npm run build` et intégrée au nom
du cache. Elle couvre notamment les deux icônes ci-dessus et évite de maintenir
ici des empreintes susceptibles de devenir obsolètes après une modification.

## Contenus importés

Les jingles et logos ajoutés via le Studio restent des contenus fournis par le
joueur. Ils ne font pas partie du dépôt, ne sont pas téléversés par
l'application et doivent être utilisés uniquement si le joueur dispose des
droits nécessaires.
