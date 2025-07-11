# Comptabilité Na Biso

**Comptabilité Na Biso** est une application web complète de gestion comptable conçue pour les entreprises, offrant une interface moderne et intuitive pour la gestion des opérations comptables.

---

## Fonctionnalités principales

### Gestion des utilisateurs
- Multi-niveaux d'accès (Super Admin, Admin, Chef Comptable, Comptables)
- Gestion des profils utilisateurs
- Système de connexion sécurisé
- Attribution des rôles et permissions

### Comptabilité
- Journaux comptables spécialisés :
  - Journal de caisse
  - Journal de banque (avec filtrage EB/SB, multi-devises, exports, diagramme circulaire)
  - Journal des opérations diverses
- Grand livre comptable (filtrage par compte, période, exercice, export PDF/Excel)
- Balance comptable (filtrage par période et exercice, totaux dynamiques, export PDF/Excel)
- Gestion dynamique des taux de change (CRUD, filtrage, historique, export PDF/Excel)
- Gestion des comptes analytiques

### Administration
- Gestion des entreprises
- Gestion des comptables (CRUD, affichage dynamique, protection XSS, affichage email complet)
- Suivi des activités

### Export et Rapports
- Export des données vers Excel et PDF sur toutes les pages principales
- Génération de rapports comptables
- Tableaux de bord analytiques

### Ergonomie et expérience utilisateur
- Interface responsive et moderne (Bootstrap 5.3)
- Tableaux dynamiques et filtrables (par année, période, exercice, etc.)
- Boutons d’action clairs et accessibles
- Indicateurs de chargement (spinner) lors des opérations asynchrones
- Affichage des messages d’erreur et de succès
- Affichage des emails sur plusieurs lignes si besoin

---

## Technologies utilisées

### Frontend
- HTML5
- CSS3 (design responsive, styles personnalisés)
- JavaScript (ES6+)
- Bootstrap 5.3
- Bootstrap Icons
- Chart.js (diagrammes circulaires)
- Animations et transitions modernes

### Backend
- PHP (API REST sécurisée)
- MySQL

### Outils et bibliothèques
- XAMPP (environnement de développement)
- Git (contrôle de version)
- Visual Studio Code (IDE recommandé)

---

## Installation

1. Cloner le dépôt :
    ```bash
    git clone https://github.com/votre-username/compte_na_biso.git
    ```

2. Placer le projet dans le dossier htdocs de XAMPP :
    ```bash
    C:\xampp\htdocs\compte_na_biso
    ```

3. Importer la base de données depuis le fichier SQL fourni

4. Configurer les accès à la base de données dans le fichier de configuration

---

## Structure du projet

```
compte_na_biso/
├── css/
│   └── stylesAll.css
    └── styles.css

├── js/
│   ├── auth.js
│   ├── comptables.js
│   ├── sidebar.js
│   ├── listeOperations.js
│   ├── balance.js
│   ├── tauxChange.js
│   ├── grandLivre.js
│   └── ...
├── api/
│   ├── tauxChange.php
│   ├── listerOperations.php
│   ├── balance.php
│   ├── grandLivre.php
│   └── ...
├── index.html
├── dashboard.html
├── listeOperations.html
├── balance.html
├── taux_change.html
├── grandLivre.html
├── comptables.html
└── autres pages...
```

---

## Pages principales

- **Dashboard** : Vue d’ensemble et accès rapide aux modules
- **Journal Banque** : Saisie, filtrage (année, EB/SB), exports, diagramme circulaire
- **Balance** : Filtrage par période/exercice, totaux dynamiques, exports
- **Grand Livre** : Filtrage par compte/période, détails, exports
- **Taux de Change** : Gestion CRUD, filtrage, historique, exports
- **Comptables** : Gestion des utilisateurs, rôles, sécurité, affichage dynamique

---

## Rôles utilisateurs

- **Super Admin** : Accès complet à toutes les fonctionnalités
- **Admin** : Gestion des comptables et des entreprises
- **Chef Comptable** : Supervision des opérations comptables
- **Comptable** : Saisie et gestion des écritures selon leur spécialité

---

## Sécurité

- Authentification sécurisée
- Gestion des sessions
- Validation des données côté client et serveur
- Protection contre les injections SQL
- Contrôle d'accès basé sur les rôles
- Protection XSS (affichage sécurisé des données)

---

## Contribuer

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commit vos changements
4. Push vers la branche
5. Ouvrir une Pull Request

---

## Auteur

Développé par Samuel Kisenge  
Contact : [ksksamuelkis@gmail.com](mailto:ksksamuelkis@gmail.com)

---

## Licence

Ce projet est sous licence privée. Tous droits réservés.

---

> Version 1.0.0  
> Dernière mise à jour : Juin 2024
