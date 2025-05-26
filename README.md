# Comptabilité Na Biso

**Comptabilité Na Biso** est une application web complète de gestion comptable conçue pour les entreprises, offrant une interface moderne et intuitive pour la gestion des opérations comptables.

## Fonctionnalités principales

### Gestion des utilisateurs
- Multi-niveaux d'accès (Super Admin, Admin, Chef Comptable, Comptables)
- Gestion des profils utilisateurs
- Système de connexion sécurisé

### Comptabilité
- Journaux comptables spécialisés :
  - Journal de caisse
  - Journal de banque
  - Journal des opérations diverses
- Grand livre comptable
- Balance comptable
- Gestion dynamique des taux de change

### Administration
- Gestion des entreprises
- Gestion des comptables
- Attribution des rôles et permissions
- Suivi des activités

### Export et Rapports
- Export des données vers Excel
- Génération de rapports comptables
- Tableaux de bord analytiques

## Technologies utilisées

### Frontend
- HTML5
- CSS3 avec design responsive
- JavaScript (ES6+)
- Bootstrap 5.3
- Bootstrap Icons
- Animations et transitions modernes

### Backend
- PHP
- MySQL
- API REST

### Outils et bibliothèques
- XAMPP (environnement de développement)
- Git (contrôle de version)
- Visual Studio Code (IDE recommandé)

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

## Structure du projet

```
compte_na_biso/
├── css/
├── js/
│   ├── auth.js
│   ├── comptables.js
│   ├── sidebar.js
│   └── ...
├── php/
├── index.html
├── dashboard.html
└── autres pages...
```

## Rôles utilisateurs

- **Super Admin** : Accès complet à toutes les fonctionnalités
- **Admin** : Gestion des comptables et des entreprises
- **Chef Comptable** : Supervision des opérations comptables
- **Comptable** : Saisie et gestion des écritures selon leur spécialité

## Sécurité

- Authentification sécurisée
- Gestion des sessions
- Validation des données
- Protection contre les injections SQL
- Contrôle d'accès basé sur les rôles

## Contribuer

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commit vos changements
4. Push vers la branche
5. Ouvrir une Pull Request

## Auteur

Développé par Samuel Kisenge  
Contact : [ksksamuelkis@gmail.com](mailto:ksksamuelkis@gmail.com)

## Licence

Ce projet est sous licence privée. Tous droits réservés.

---

> Version 1.0.0  
> Dernière mise à jour : Mai 2024
