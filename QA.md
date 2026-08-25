# Contrôles qualité effectués

- Vérification de syntaxe JavaScript pour l'application, le serveur local et le service worker.
- Chargement de l'écran d'accueil et du défi dans Chromium sans erreur de console.
- Vérification responsive à 1440 px et 390 px, sans débordement horizontal.
- Vérification visuelle des écrans accueil, écoute, jingle personnalisé et résultat.
- Lecture complète d'un jingle synthétisé et déverrouillage de l'étape micro.
- Import et analyse d'un WAV personnalisé de deux secondes.
- Détection de hauteur testée sur un signal de 440 Hz.
- Comparaison parfaite : 100/100.
- Comparaison fidèle à une octave différente : score de mélodie maximal, afin de respecter la tessiture du joueur.
- Comparaison d'un jingle fidèle synthétisé : score global supérieur à 90.
- Comparaison monotone avec rythme identique : score de mélodie fortement réduit.
- Détection du silence : score nul et conseil de rapprocher le micro.

Le parcours avec un périphérique micro physique doit être validé une dernière fois sur l'appareil cible, car l'environnement de génération interdit la capture audio matérielle. Les API utilisées sont `getUserMedia`, `MediaRecorder` et Web Audio, avec repli sur l'analyse capturée en direct si le format enregistré ne peut pas être redécodé.
