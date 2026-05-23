# Vite-Gourmand-FrontEnd

Application web frontend pour le service de traiteur bordelais **Vite & Gourmand**.  
Elle permet aux utilisateurs de consulter les menus passer des commandes et y laisser un.

---

## Prérequis

- [Node.js](https://nodejs.org/) (v18 ou supérieur)
- [npm](https://www.npmjs.com/)
- Un navigateur moderne (Chrome par exemple)
- Le backend Symfony doit être lancé sur `http://127.0.0.1:8000`

---

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/Ashura1234/Vite-Gourmand.git
cd Vite-Gourmand
```

### 2. Installer les dépendances

```bash
npm install
```

Ca installe Bootstrap, Bootstrap Icons et leurs dépendances dans `node_modules/`.

### 3. Compiler le SCSS

Utiliser l'extension **Live Sass Compiler** dans VS Code.  
Cliquer sur `Watch Sass` dans la barre inférieure de VS Code.  
Le fichier `scss/main.css` sera généré automatiquement à chaque modification.

### 4. Lancer le serveur

Utiliser l'extension **Live Server** dans VS Code.  
Cliquer sur `Go Live` dans la barre inférieure.  
L'application sera accessible sur `http://localhost:3000`.

## Lien avec le backend

Le backend Symfony doit être lancé séparément.  
Consulter le README du dépôt backend pour l'installation :  
-> [vite_gourmand_backend](https://github.com/Ashura1234/vite_gourmand_backend)

---

## Auteur

Projet réalisé dans le cadre d'une formation développeur web.