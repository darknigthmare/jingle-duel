# Jingle Duel

Jingle Duel est un jeu web/PWA de duel musical. Le joueur écoute un jingle, le reproduit au microphone ou depuis un fichier audio, puis reçoit un score sur 100 fondé sur la mélodie, le rythme, la durée et la netteté du signal.

## Fonctionnalités

- Six jingles originaux synthétisés dans le navigateur : Arcade Spark, Cosmic Bloom, Retro Pulse, Neon Strike, Velvet Orbit et Prism Run.
- Six rivaux avec des objectifs adaptés aux difficultés Détente, Normal et Expert.
- Animation de scène synchronisée avec la référence, compte à rebours et capture microphone.
- Repli par fichier audio disponible après l'écoute de la référence lorsque le microphone est absent ou refusé.
- Analyse locale de la mélodie, du rythme, de la durée et de la netteté ; aucun audio n'est envoyé sur un serveur.
- Score, rang, métriques détaillées, conseil, réécoute et comparaison A/B.
- Progression locale : XP, niveaux, victoires, séries, duels, maîtrises, records par jingle et difficulté, et historique des 50 derniers résultats classés.
- Mode Studio : création d'un duel depuis un jingle audio original de 0,7 à 8 secondes et un logo facultatif.
- Interface responsive et accessible, installable comme PWA et utilisable hors ligne après un premier chargement en ligne.

## Lancement local

Node.js 18 ou plus récent est requis. Le microphone exige HTTPS ou une adresse locale sécurisée telle que http://localhost ; ouvrir directement index.html avec le protocole file ne suffit pas.

Sous Windows, double-cliquer sur start.bat. Sous macOS ou Linux, lancer :

~~~bash
./start.command
~~~

La commande équivalente sur toutes les plateformes est :

~~~bash
npm start
~~~

Le build est généré automatiquement, puis le jeu est servi sur http://127.0.0.1:4173.

## Vérification

~~~bash
npm test
~~~

Cette commande reconstruit dist, vérifie la syntaxe JavaScript, puis exécute les tests du moteur audio/scoring et du serveur statique. npm run qa lance le même contrôle complet.

## Déploiement

Le build statique est produit dans dist. La configuration Vercel exécute la suite complète de tests avant de publier ce dossier.

## Confidentialité et sauvegarde

L'enregistrement, le décodage et l'analyse audio sont effectués dans le navigateur avec Web Audio et MediaRecorder. L'audio n'est ni téléversé ni persisté. La progression, les records, l'historique et les préférences sont sauvegardés uniquement dans localStorage sur l'appareil.

## Contenus et licences

Les six jingles intégrés, les rivaux et l'identité « Jingle Duel » sont des créations originales du projet. Le Studio permet d'ajouter des jingles et logos appartenant à l'utilisateur ou qu'il est autorisé à exploiter. Aucun logo, jingle ou média de marque tierce n'est distribué avec le projet. La provenance des ressources intégrées est détaillée dans ASSET_PROVENANCE.md.
