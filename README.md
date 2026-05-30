# Discord Custom Presence

Application desktop multiplateforme pour creer et gerer une presence riche Discord personnalisee.

L'application permet d'afficher un message custom, des images, des boutons Discord, ou ce que l'utilisateur ecoute dans son navigateur via une extension locale.

## Sommaire

- [Fonctionnalites](#fonctionnalites)
- [Installation](#installation)
- [Configuration Discord](#configuration-discord)
- [Utilisation](#utilisation)
- [Extension navigateur](#extension-navigateur)
- [Developpement](#developpement)
- [Build et distribution](#build-et-distribution)
- [Publication GitHub Releases](#publication-github-releases)
- [Depannage](#depannage)
- [Signaler un probleme](#signaler-un-probleme)
- [Limites connues](#limites-connues)

## Fonctionnalites

- Application Windows, macOS et Linux.
- Rich Presence Discord via `discord-rpc`.
- Mode message custom avec :
  - details ;
  - state ;
  - grande image ;
  - petite image ;
  - texte au survol des images ;
  - jusqu'a 2 boutons.
- Mode navigateur pour afficher la musique ou video en cours.
- Extension navigateur incluse pour Spotify Web, YouTube, YouTube Music et SoundCloud.
- Serveur local limite a `127.0.0.1:38432`.
- Builds automatises avec GitHub Actions.

## Installation

### Depuis une release GitHub

1. Ouvrir la page **Releases** du depot GitHub.
2. Telecharger le fichier correspondant a votre systeme :
   - Windows : `Discord Custom Presence Setup x.x.x.exe` ou version portable `.exe`.
   - macOS : `.dmg` ou `.zip`.
   - Linux : `.AppImage` ou `.deb`.
   - Extension Chrome / Edge : `discord-custom-presence-chrome-extension.zip`.
3. Installer ou lancer l'application.
4. Verifier que l'application Discord desktop est ouverte.

### Windows

- `Setup.exe` installe l'application.
- La version portable `.exe` peut etre lancee directement.
- Windows SmartScreen peut afficher un avertissement si l'application n'est pas signee. Cliquer sur **Informations complementaires**, puis **Executer quand meme** uniquement si vous avez telecharge le fichier depuis la release officielle du projet.

### macOS

- Ouvrir le fichier `.dmg` ou `.zip`.
- Deplacer l'application dans `Applications`.
- Si macOS bloque l'ouverture car l'application n'est pas signee/notariee, ouvrir **Reglages systeme > Confidentialite et securite**, puis autoriser l'application.

### Linux

Avec AppImage :

```bash
chmod +x "Discord Custom Presence-x.x.x.AppImage"
./"Discord Custom Presence-x.x.x.AppImage"
```

Avec Debian/Ubuntu :

```bash
sudo dpkg -i discord-custom-presence_x.x.x_amd64.deb
```

## Configuration Discord

Discord Rich Presence utilise une application creee dans le portail developpeur Discord.

1. Aller sur <https://discord.com/developers/applications>.
2. Cliquer sur **New Application**.
3. Donner un nom a l'application.
4. Copier l'**Application ID**.
5. Ouvrir Discord Custom Presence.
6. Coller l'Application ID dans le champ **Discord Client ID**.
7. Cliquer sur **Save**, puis **Connect**.

### Images Rich Presence

Pour les images, l'option la plus fiable est d'utiliser les assets Discord :

1. Ouvrir votre application dans le Discord Developer Portal.
2. Aller dans **Rich Presence > Art Assets**.
3. Ajouter vos images.
4. Utiliser le nom de l'asset dans les champs `Large image key` ou `Small image key`.

Les URLs d'images peuvent fonctionner dans certains cas, mais Discord ne garantit pas leur support dans tous les clients. Pour une presence stable, utilisez des assets uploades dans Discord.

## Utilisation

### Mode Custom

1. Selectionner **Custom message**.
2. Remplir les champs :
   - **Details** : premiere ligne de la presence.
   - **State** : deuxieme ligne de la presence.
   - **Large image key or URL** : image principale.
   - **Large image text** : texte au survol de l'image principale.
   - **Small image key or URL** : petite image.
   - **Small image text** : texte au survol de la petite image.
   - **Button label / URL** : boutons visibles par les autres utilisateurs.
3. Cliquer sur **Save**.
4. Cliquer sur **Connect** si l'application n'est pas deja connectee.

### Mode Browser media

1. Installer l'extension navigateur depuis le dossier `browser-extension/`.
2. Selectionner **Browser media** dans l'application.
3. Lancer une musique ou video sur un site supporte.
4. L'application recoit les informations et met a jour la Rich Presence.

Sites avec support dedie :

- Spotify Web
- YouTube
- YouTube Music
- SoundCloud

Les autres sites utilisent un fallback base sur le titre de la page si un element audio/video est detecte.

### Boutons Discord

Les boutons sont visibles par les autres utilisateurs sur votre profil Discord. Discord ne permet generalement pas a l'utilisateur local de cliquer ses propres boutons.

## Extension navigateur

Le dossier `browser-extension/` contient une extension Manifest V3.

### Chrome / Edge

Depuis une release GitHub :

1. Telecharger `discord-custom-presence-chrome-extension.zip`.
2. Extraire le fichier ZIP dans un dossier permanent.
3. Ouvrir `chrome://extensions`.
4. Activer **Developer mode**.
5. Cliquer sur **Load unpacked**.
6. Selectionner le dossier extrait.

Depuis le code source :

1. Ouvrir `chrome://extensions`.
2. Activer **Developer mode**.
3. Cliquer sur **Load unpacked**.
4. Selectionner le dossier `browser-extension/`.

### Firefox

1. Ouvrir `about:debugging#/runtime/this-firefox`.
2. Cliquer sur **Load Temporary Add-on**.
3. Selectionner `browser-extension/manifest.json`.

### Fonctionnement technique

L'extension lit les informations visibles dans la page, puis envoie un payload HTTP local a :

```text
http://127.0.0.1:38432/now-playing
```

Le serveur local accepte uniquement les connexions depuis `127.0.0.1` ou `::1`.

## Developpement

### Prerequis

- Node.js 20 ou plus recent.
- npm.
- Discord desktop installe et ouvert.
- Un compte Discord avec une application creee dans le Developer Portal.

### Installation du projet

```bash
git clone https://github.com/<user>/<repo>.git
cd <repo>
npm install
```

### Lancer en mode developpement

```bash
npm run dev
```

### Verifier le code

```bash
npm run lint
npm audit
```

### Structure du projet

```text
.
├── .github/workflows/release.yml
├── browser-extension/
│   ├── background.js
│   ├── content.js
│   ├── manifest.json
│   └── README.md
├── src/
│   ├── main.js
│   ├── preload.js
│   ├── renderer.html
│   ├── renderer.js
│   └── styles.css
├── package.json
└── README.md
```

### Ajouter un site media

Les adapters navigateur sont dans `browser-extension/content.js`.

Pour ajouter un site :

1. Ajouter une entree dans le tableau `adapters`.
2. Definir `host`.
3. Implementer `read()` pour retourner :

```js
{
  title: 'Titre',
  artist: 'Artiste',
  album: 'Album',
  source: 'Nom du site'
}
```

4. Recharger l'extension dans le navigateur.
5. Tester avec l'application desktop ouverte en mode **Browser media**.

## Build et distribution

### Build local

```bash
npm run dist
```

Les fichiers generes sont dans `dist/`.

Pour generer uniquement le ZIP de l'extension Chrome / Edge :

```bash
npm run extension:zip
```

Sur Windows, le projet desactive actuellement `signAndEditExecutable` pour permettre un build local non signe sans certificat.

### Targets configurees

- Windows : NSIS installer + executable portable.
- macOS : DMG + ZIP.
- Linux : AppImage + DEB.

### Signature des applications

Pour une distribution publique plus propre, il faudra ajouter plus tard :

- un certificat Windows Authenticode ;
- un certificat Apple Developer ID ;
- la notarisation macOS ;
- des secrets GitHub Actions pour les certificats.

## Publication GitHub Releases

Le workflow `.github/workflows/release.yml` construit automatiquement les releases quand un tag `v*.*.*` est pousse.

Exemple :

```bash
git tag v0.1.0
git push origin v0.1.0
```

GitHub Actions va :

1. Installer Node.js.
2. Installer les dependances npm.
3. Construire l'application sur Windows, macOS et Linux.
4. Uploader les artefacts.
5. Creer une GitHub Release.

## Depannage

### Discord ne detecte pas la presence

Verifier :

- Discord desktop est ouvert.
- Vous utilisez l'application Discord officielle, pas seulement Discord Web.
- Le **Client ID** est correct.
- Vous avez clique sur **Connect**.
- Le statut d'activite est active dans Discord :
  - **User Settings > Activity Privacy > Share your detected activities with others**.

### Erreur `Missing Discord application client ID`

Le champ **Discord Client ID** est vide.

Solution :

1. Copier l'Application ID depuis le Discord Developer Portal.
2. Le coller dans l'application.
3. Cliquer sur **Save** puis **Connect**.

### Les images ne s'affichent pas

Causes possibles :

- L'asset n'existe pas dans le Discord Developer Portal.
- Le nom de l'asset est mal ecrit.
- Discord n'a pas encore fini de propager l'asset.
- L'URL d'image n'est pas supportee par le client Discord.
- Un texte d'image est renseigne sans image associee. Le texte au survol n'est utilise que si la cle ou l'URL de l'image correspondante est remplie.

Solution recommandee :

1. Uploader l'image dans **Rich Presence > Art Assets**.
2. Utiliser exactement le nom de l'asset.
3. Attendre quelques minutes si l'asset vient d'etre ajoute.

### Les boutons ne sont pas cliquables pour moi

C'est un comportement Discord normal. Les autres utilisateurs peuvent voir et cliquer les boutons, mais le compte qui affiche la presence ne peut generalement pas cliquer ses propres boutons.

### Le mode navigateur ne fonctionne pas

Verifier :

- L'application desktop est ouverte.
- Le mode **Browser media** est selectionne.
- L'extension est bien chargee dans le navigateur.
- Le site est supporte ou contient un element audio/video actif.
- Le navigateur autorise l'extension sur le site.

Test rapide :

```bash
curl http://127.0.0.1:38432/health
```

La reponse attendue est :

```json
{"ok":true}
```

### Spotify / YouTube change et la detection casse

Les sites web changent regulierement leur DOM. Il faut alors mettre a jour l'adapter correspondant dans `browser-extension/content.js`.

### `npm install` echoue

Verifier :

- Node.js est installe.
- npm est disponible.
- La connexion Internet fonctionne.
- Le cache npm n'est pas corrompu.

Commandes utiles :

```bash
npm cache verify
npm install
```

### `npm run dist` echoue sur Windows avec winCodeSign ou symlink

Si l'erreur mentionne `winCodeSign`, `symbolic link` ou `privilege`, le probleme vient souvent de l'extraction d'outils de signature.

Le projet configure deja :

```json
"signAndEditExecutable": false
```

Si vous modifiez la configuration de build, gardez cette option pour les builds locaux non signes, ou activez le mode developpeur Windows / utilisez un environnement CI adapte.

### L'application est bloquee par l'antivirus ou SmartScreen

Les builds non signes peuvent etre signales par Windows ou certains antivirus.

Solutions :

- Telecharger uniquement depuis la release officielle.
- Verifier que le depot GitHub correspond au projet attendu.
- Pour une distribution publique, signer l'application avec un certificat valide.

## Signaler un probleme

Avant d'ouvrir une issue :

1. Verifier que vous utilisez la derniere release.
2. Lire la section [Depannage](#depannage).
3. Tester avec Discord desktop ouvert.
4. Tester sans autre client Rich Presence lance en meme temps.

Dans l'issue, inclure :

- Systeme d'exploitation et version.
- Version de l'application.
- Version de Discord.
- Mode utilise : `custom` ou `browser media`.
- Etapes exactes pour reproduire.
- Resultat attendu.
- Resultat obtenu.
- Captures d'ecran si utile.
- Logs ou messages d'erreur.

Ne partagez jamais de token Discord, mot de passe, cookie navigateur ou information privee.

## Limites connues

- Discord desktop doit etre lance sur la meme machine.
- Les images sont plus fiables avec des assets Discord qu'avec des URLs externes.
- Les sites de streaming peuvent casser la detection si leur interface change.
- Les extensions Firefox chargees temporairement sont supprimees au redemarrage du navigateur.
- Les installateurs ne sont pas signes par defaut.

## Licence

Ce projet est distribue sous licence MIT.
