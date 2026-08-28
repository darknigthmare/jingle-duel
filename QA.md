# Contrôles qualité

## Automatisés

npm test couvre :

- le build statique et l'injection d'une révision propre au cache PWA ;
- la syntaxe de l'application, du moteur audio, du worker, du serveur, du service worker et du script de build ;
- la détection de hauteur sur un signal déterministe de 440 Hz ;
- le silence et l'absence de signal ;
- le scoring parfait, la transposition vocale, la pénalisation d'une imitation monotone et les écarts entre difficultés ;
- le service de dist, les en-têtes de sécurité, HEAD, le refus des méthodes non autorisées et la protection contre les dotfiles et traversées de chemin.

## Parcours navigateur avant publication

- accueil, sélection d'un jingle, écoute, tentative, analyse, résultat, réessai et retour ;
- microphone autorisé avec une vraie piste MediaStream lorsque le matériel est simulable ;
- refus ou absence de microphone, message d'erreur utile et repli par fichier audio ;
- import Studio d'un fichier valide et rejet accessible d'un fichier invalide ;
- sauvegarde, restauration, progression, records et effacement sélectif de l'historique ;
- desktop, mobile portrait, mobile paysage, absence de débordement horizontal et focus visible ;
- installation/mise à jour du service worker et rechargement hors ligne après amorçage ;
- absence d'erreur JavaScript inattendue ;
- réponse HTTP, manifeste, service worker et en-têtes de sécurité de la production.

Une capture microphone matérielle reste à valider sur chaque appareil cible. Les API utilisées sont getUserMedia, MediaRecorder et Web Audio ; l'analyse d'un fichier local constitue le repli sans microphone.
