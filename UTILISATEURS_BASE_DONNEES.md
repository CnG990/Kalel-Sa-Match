# 🔐 Utilisateurs de la Base de Données - Kalel Sa Match (KSM)

## 📋 Liste des Comptes Utilisateurs

### 👑 ADMINISTRATEURS

#### 1. Admin Principal (TestAccountsSeeder)
- **Email:** `admin@terrasyn.sn`
- **Mot de passe:** `admin123`
- **Nom:** Diallo Cheikh
- **Téléphone:** +221 77 123 4567
- **Rôle:** admin
- **Statut:** Validé

#### 2. Admin Principal (DatabaseSeeder)
- **Email:** `admin@terrains-dakar.com`
- **Mot de passe:** `Admin123!`
- **Nom:** Administrateur Principal
- **Téléphone:** +221 33 123 4567
- **Rôle:** admin
- **Statut:** approuve

#### 3. Admin Test (DatabaseSeeder)
- **Email:** `admin@terrains.com`
- **Mot de passe:** `password`
- **Nom:** Test Admin
- **Téléphone:** +221 33 123 4568
- **Rôle:** admin
- **Statut:** approuve

#### 4. Compte Personnel Cheikh (TestAccountsSeeder)
- **Email:** `cheikh.diallo@terrasyn.sn`
- **Mot de passe:** `cheikh2025`
- **Nom:** Diallo Cheikh
- **Téléphone:** +221 77 555 0123
- **Rôle:** admin
- **Statut:** Validé

---

### 🏢 GESTIONNAIRES

#### 1. Gestionnaire Principal (TestAccountsSeeder)
- **Email:** `gestionnaire@terrasyn.sn`
- **Mot de passe:** `gestionnaire123`
- **Nom:** Ba Mamadou
- **Téléphone:** +221 76 234 5678
- **Rôle:** gestionnaire
- **Statut:** Validé

#### 2. Gestionnaire Validé (DatabaseSeeder)
- **Email:** `gestionnaire@terrains-dakar.com`
- **Mot de passe:** `Gestionnaire123!`
- **Nom:** Gestionnaire Principal
- **Téléphone:** +221 77 123 4567
- **Rôle:** gestionnaire
- **Statut:** approuve

#### 3. Gestionnaire Test (DatabaseSeeder)
- **Email:** `gestionnaire@test.com`
- **Mot de passe:** `password`
- **Nom:** Test Gestionnaire
- **Téléphone:** +221 77 123 4568
- **Rôle:** gestionnaire
- **Statut:** en_attente (⚠️ Nécessite validation)

#### 4. Manager Test (TestAccountsSeeder)
- **Email:** `manager.test@terrasyn.sn`
- **Mot de passe:** `manager123`
- **Nom:** Sow Aminata
- **Téléphone:** +221 77 888 9999
- **Rôle:** gestionnaire
- **Statut:** Validé

---

### 👤 CLIENTS

#### 1. Client Principal (TestAccountsSeeder)
- **Email:** `client@terrasyn.sn`
- **Mot de passe:** `client123`
- **Nom:** Ndiaye Fatou
- **Téléphone:** +221 78 345 6789
- **Rôle:** client
- **Statut:** Validé

#### 2. Client Principal (DatabaseSeeder)
- **Email:** `client@terrains-dakar.com`
- **Mot de passe:** `Client123!`
- **Nom:** Client Principal
- **Téléphone:** +221 76 234 5678
- **Rôle:** client
- **Statut:** approuve

#### 3. Client Test (DatabaseSeeder)
- **Email:** `client@test.com`
- **Mot de passe:** `password`
- **Nom:** Test Client
- **Téléphone:** +221 76 234 5679
- **Rôle:** client
- **Statut:** approuve

---

## 🎯 Comptes Recommandés pour les Tests

### Pour l'Application Mobile Client :
- **Email:** `client@terrasyn.sn`
- **Mot de passe:** `client123`

### Pour l'Application Mobile Gestionnaire :
- **Email:** `gestionnaire@terrasyn.sn`
- **Mot de passe:** `gestionnaire123`

### Pour l'Administration :
- **Email:** `admin@terrasyn.sn`
- **Mot de passe:** `admin123`

---

## 📝 Notes Importantes

1. **Plusieurs seeders** créent des utilisateurs avec des emails différents
2. **Certains gestionnaires** sont en statut `en_attente` et nécessitent une validation
3. **Les clients** sont automatiquement approuvés
4. **Les mots de passe** sont hashés avec `Hash::make()` dans Laravel

## 🔄 Pour Réinitialiser les Utilisateurs

Exécuter les seeders :
```bash
cd Backend
php artisan db:seed --class=TestAccountsSeeder
# ou
php artisan db:seed --class=DatabaseSeeder
```

