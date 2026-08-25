# Jingle Duel

Application web/PWA locale : un logo et un jingle apparaissent, puis le joueur doit reproduire le jingle au micro. Le résultat est noté sur 100 selon la mélodie, le rythme, la durée et la netteté du signal.

## Fonctionnalités

- Trois jingles originaux synthétisés dans le navigateur.
- Animation de logo synchronisée avec la référence.
- Compte à rebours et enregistrement micro.
- Analyse locale : aucune donnée audio n'est envoyée sur un serveur.
- Score détaillé, rang, conseil personnalisé, record local et historique.
- Réécoute de l'essai et comparaison A/B.
- Mode Studio : import d'un jingle audio de 0,7 à 8 secondes et d'un logo facultatif.
- Difficultés Détente, Normal et Expert.
- Interface responsive, installable comme PWA et utilisable hors ligne après le premier chargement.

## Lancement

Le microphone exige une origine sécurisée : `https://` ou `http://localhost`. Il ne faut donc pas ouvrir directement `index.html` en `file://`.

### Windows

1. Installer Node.js 18 ou plus récent.
2. Double-cliquer sur `start.bat`.
3. Ouvrir `http://localhost:4173` dans Chrome, Edge, Firefox ou Safari.

### macOS / Linux

```bash
./start.command
```

ou :

```bash
node server.mjs
```

Puis ouvrir `http://localhost:4173`.

## Déploiement

Le dossier est entièrement statique. Il peut être déposé tel quel sur Vercel, Netlify, GitHub Pages ou tout hébergement HTTPS. `server.mjs` n'est utile que pour le lancement local.

## Confidentialité

L'enregistrement et l'analyse sont effectués dans le navigateur avec Web Audio et MediaRecorder. L'audio n'est ni téléversé ni conservé après la fermeture de la page. Seuls les scores et l'historique sont enregistrés dans `localStorage`.

## Contenus et licences

Les trois jingles intégrés et l'identité « Jingle Duel » sont originaux. Le Studio personnalisé permet d'ajouter des jingles et logos sous licence ou appartenant à l'utilisateur. Aucun logo ou jingle de marque tierce n'est distribué avec le projet.
