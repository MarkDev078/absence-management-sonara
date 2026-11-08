# Plan d'implémentation — Concepts Workflow / Approbation (sonara-login → Laravel)

**Projet :** absence-management-system (absence-management-sonara-2-0)
**Statut :** Plan pour approbation — aucun code d'implémentation n'est écrit à ce stade.
**Cible :** Laravel 13 + Inertia.js v3 + React 19 TypeScript (SPA)
**Référence :** sonara-login (D:\WeCode\Node.js\sonara-login)
**Architecture :** Multi-rôles par utilisateur (many-to-many), double portail Employé ↔ RH, pas de sélection de rôle au login.
**Correction RH :** La RH ne décide pas (approve/reject) — elle prend connaissance d'une demande déjà approuvée par la chaîne hiérarchique.

---

## 1. Évaluation de faisabilité

**Oui, c'est faisable.** Les concepts de sonara-login se cartographient naturellement sur le modèle Laravel existant. Il s'agit d'une **extension**, pas d'une réécriture.

| Concept sonara-login | Équivalent Laravel existant | Statut |
|---|---|---|
| `ownerId` | `absence_requests.employee_id` | Existe |
| `statut` (En attente / Approuvée / Rejetée) | `absence_requests.status` | Existe |
| `currentApproverId` | **Manquant** — `absence_requests.current_approver_id` | À ajouter |
| `decisions[]` (approve/reject uniquement) | Table `approvals` | Existe, à étendre |
| `decide()` (chaîne managériale) | `ApprovalController@approve/@reject` | Existe, à adapter |
| RH prise de connaissance | **Nouveau** — pas d'équivalent dans le code actuel | À créer |
| `managerId` / `isSubordinate` | `User.manager_id` + relations `manager()`/`subordinates()` | Existe |
| `canView(record)` | Vérifications inline éparses | Existe partiellement |
| `canDecide(record)` | Vérifications inline dans ApprovalController | Existe partiellement |
| Multi-rôles par utilisateur | Colonne `role` unique sur `users` | À refactoriser |

**Principaux écarts à combler :**
1. Colonne `current_approver_id` manquante sur `absence_requests`
2. Statut `pending` manquant de l'enum `approvals.status` (actuellement `['approved', 'rejected']`, `NULL` = pending implicite)
3. Champs `kind` (approve/reject) manquants sur `approvals`
4. Logique d'approbation par niveaux fixes par rôle (manager=1, rh=2, admin=3) → remplacée par la chaîne dynamique `manager_id`
5. La RH n'est PAS dans la chaîne de décision — nouvel action "prise de connaissance" séparée
6. Aucune méthode `canView` / `canDecide` centralisée
7. Page `Approval/Index.tsx` référencée mais absente du frontend
8. Colonne `role` unique sur `users` → passage à multi-rôles (many-to-many)

---

## 2. Mapping détaillé sonara-login → Laravel

### Modèle de données (workflow)

| Champ sonara-login | Colonne Laravel | Table | Notes |
|---|---|---|---|
| `ownerId` | `employee_id` | `absence_requests` | FK vers `users.id` |
| `statut` | `status` | `absence_requests` | draft/pending/approved/rejected |
| `currentApproverId` | `current_approver_id` | `absence_requests` | **Nouvelle colonne** FK vers `users.id`, nullable |
| `decisions[].userId` | `approver_id` | `approvals` | Décideurs uniquement (managers de la chaîne) |
| `decisions[].kind` | `kind` | `approvals` | **Nouveau champ** enum (approve/reject) |
| `decisions[].at` | `approved_at` | `approvals` | Existe déjà (timestamp nullable) |
| `decisions[].reason` | `comment` | `approvals` | Existe déjà (text nullable) |
| RH prise de connaissance | `rh_acknowledged_at` / `rh_acknowledged_by_id` | `absence_requests` | **Nouveaux champs** (pas dans sonara-login) |
| `User.managerId` | `manager_id` | `users` | Existe déjà |

### Modèle de données (multi-rôles)

| Table | Colonnes | Notes |
|---|---|---|
| `roles` | `id`, `name` (employee, rh, admin, manager, infirmerie, dg), `label`, timestamps | **Nouvelle table** |
| `role_user` | `user_id`, `role_id`, timestamps | **Nouvelle table pivot** many-to-many |
| `users.role` | (conservée temporairement, puis supprimée) | Remplacée par la relation many-to-many |

### Logique `decide()` (chaîne managériale uniquement)

| Cas | Comportement Laravel cible |
|---|---|
| `decide(..., kind='rejeter')` par un manager de la chaîne | `status` → `rejected`, `current_approver_id` → `NULL` |
| `decide(..., kind='approuver')` et l'employé a un manager | `status` → `pending`, `current_approver_id` → `manager_id` de l'employé, prochaine approval créée |
| `decide(..., kind='approuver')` et l'employé n'a pas de manager | `status` → `approved`, `current_approver_id` → `NULL` (chaîne complète) |
| RH prend connaissance (status déjà `approved`) | `rh_acknowledged_at` → `now()`, `rh_acknowledged_by_id` → id de la RH (status inchangé) |

### Logique d'accès

| Fonction | Équivalent Laravel cible |
|---|---|
| `canView(record)` | propriétaire OU utilisateur ayant un rôle parmi [manager, rh, admin] ET manage l'employé (via `isSubordinateOf`) |
| `canDecide(record)` | `status='pending'` AND `current_approver_id === user.id` AND `isSubordinateOf(employé, user)` — nécessite un rôle `manager` ou `rh` |
| `canAcknowledgeRh(record)` (RH) | `status='approved'` AND `user->hasRole('rh')` |

---

## 3. Plan d'implémentation par étapes

### Étape 1 — Migrations de base de données

**Fichier à créer :** `database/migrations/2026_xx_xx_xxxxxx_add_workflow_fields_to_absence_requests_and_approvals.php`

Modifications :
1. **Table `absence_requests`** :
   - Ajouter `current_approver_id` (`foreignId()->nullable()->constrained('users')->nullOnDelete()`), après `current_approval_level`
   - Ajouter `rh_acknowledged_at` (`timestamp()->nullable()`)
   - Ajouter `rh_acknowledged_by_id` (`foreignId()->nullable()->constrained('users')->nullOnDelete()`)
2. **Table `approvals`** :
   - Changer `status` enum de `['approved', 'rejected']` vers `['pending', 'approved', 'rejected']`
   - Ajouter `kind` enum (`['approve', 'reject']`), nullable
   - Garder `comment` comme raison de la décision

**Fichier à créer :** `database/migrations/2026_xx_xx_xxxxxx_create_roles_and_role_user_tables.php`

Modifications :
3. **Table `roles`** : `id`, `name` (string unique), `label` (string), timestamps
4. **Table `role_user`** : `user_id` (FK users), `role_id` (FK roles), timestamps, primary key composite
5. Migration des données : les valeurs actuelles de `users.role` sont copiées dans `roles` + pivot `role_user`
6. Conserver temporairement `users.role` pour compatibilité, à supprimer après validation

**Règle de non-régression :** aucune colonne existante n'est supprimée ni renommée à l'étape 1.

---

### Étape 2 — Modèles Eloquent

#### `Role.php` (nouveau modèle)

```php
class Role extends Model
{
    protected $fillable = ['name', 'label'];
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }
}
```

#### `User.php`

1. Ajouter la relation :
   ```php
   public function roles(): BelongsToMany
   {
       return $this->belongsToMany(Role::class);
   }
   ```
2. Ajouter les méthodes :
   ```php
   public function hasRole(string $role): bool
   {
       return $this->roles()->where('name', $role)->exists();
   }
   public function hasAnyRole(array $roles): bool
   {
       return $this->roles()->whereIn('name', $roles)->exists();
   }
   public function isEmployee(): bool { return $this->hasRole('employee'); }
   public function isRh(): bool { return $this->hasRole('rh'); }
   public function isAdmin(): bool { return $this->hasRole('admin'); }
   public function isManager(): bool { return $this->hasRole('manager'); }
   public function isSubordinateOf(User $potentialManager): bool
   {
       $current = $this;
       while ($current->manager_id) {
           if ($current->manager_id === $potentialManager->id) return true;
           $current = $current->manager;
           if (!$current) return false;
       }
       return false;
   }
   ```
   (`subordinates()` et `manager()` existent déjà.)

#### `AbsenceRequest.php`

1. Ajouter `current_approver_id`, `rh_acknowledged_at`, `rh_acknowledged_by_id` au `$fillable`.
2. Cast `current_approver_id => 'integer'`, `rh_acknowledged_by_id => 'integer'`.
3. Relations :
   ```php
   public function currentApprover(): BelongsTo
   {
       return $this->belongsTo(User::class, 'current_approver_id');
   }
   public function rhAcknowledger(): BelongsTo
   {
       return $this->belongsTo(User::class, 'rh_acknowledged_by_id');
   }
   ```
4. Méthodes métier :
   ```php
   public function canView(User $user): bool
   {
       if ($this->employee_id === $user->id) return true;
       if ($user->hasAnyRole(['manager', 'rh', 'admin'])) {
           $employee = $this->employee;
           return $employee ? $user->isSubordinateOf($employee) : false;
       }
       return false;
   }

   public function canDecide(User $user): bool
   {
       if ($this->status !== 'pending') return false;
       if ($this->current_approver_id !== $user->id) return false;
       if (!$user->hasAnyRole(['manager', 'rh'])) return false;
       $employee = $this->employee;
       return $employee ? $user->isSubordinateOf($employee) : false;
   }

   public function canAcknowledgeRh(User $user): bool
   {
       return $this->status === 'approved' && $user->hasRole('rh');
   }

   public function decide(User $decider, string $kind, ?string $reason = null): void
   {
       if (!$this->canDecide($decider)) {
           throw new \Illuminate\Validation\ValidationException([...]);
       }

       $this->approvals()->create([
           'approver_id' => $decider->id,
           'step' => $this->current_approval_level + 1,
           'status' => $kind === 'approve' ? 'approved' : 'rejected',
           'kind' => $kind,
           'comment' => $reason,
           'approved_at' => now(),
       ]);

       if ($kind === 'reject') {
           $this->update(['status' => 'rejected', 'current_approver_id' => null]);
           return;
       }

       $employee = $this->employee;
       $nextApproverId = $employee ? $employee->manager_id : null;

       if ($nextApproverId) {
           $this->update([
               'status' => 'pending',
               'current_approval_level' => $this->current_approval_level + 1,
               'current_approver_id' => $nextApproverId,
           ]);
           $this->approvals()->create([
               'approver_id' => $nextApproverId,
               'step' => $this->current_approval_level + 1,
               'kind' => null,
               'comment' => null,
               'approved_at' => null,
           ]);
       } else {
           $this->update(['status' => 'approved', 'current_approver_id' => null]);
       }
   }

   public function acknowledgeRh(User $rhUser): void
   {
       if (!$this->canAcknowledgeRh($rhUser)) {
           throw new \Illuminate\Validation\ValidationException([...]);
       }
       $this->update([
           'rh_acknowledged_at' => now(),
           'rh_acknowledged_by_id' => $rhUser->id,
       ]);
   }
```

#### `Approval.php`

Ajouter `kind` au `$fillable`, cast `kind => 'string'`.

---

### Étape 3 — Autorisation centralisée

Créer `app/Policies/AbsenceRequestPolicy.php` :
```php
public function view(User $user, AbsenceRequest $absenceRequest): bool
{
    return $absenceRequest->canView($user);
}

public function decide(User $user, AbsenceRequest $absenceRequest): bool
{
    return $absenceRequest->canDecide($user);
}

public function acknowledgeRh(User $user, AbsenceRequest $absenceRequest): bool
{
    return $absenceRequest->canAcknowledgeRh($user);
}
```

Enregistrer dans `AuthServiceProvider`. Les contrôleurs appellent `$this->authorize(...)` en complément des vérifications existantes.

Middleware mis à jour : `role:rh` vérifie maintenant `$user->hasRole('rh')` (plus la colonne unique `users.role`).

---

### Étape 4 — Contrôleurs API

#### `AuthController.php`

**Aucun changement.** Login reste matricule + mot de passe uniquement. Pas de champ « rôle » au login. L'utilisateur détient tous ses rôles simultanément après authentification.

#### `ApprovalController.php`

Remplacer la logique par niveaux fixes (manager=1, rh=2, admin=3) par la logique hiérarchique :
- `pending()` : `Approval` où `approver_id = user.id` et `status IS NULL`. Filtre role manager|rh|admin conservé.
- `approve()` : `$this->authorize('decide', $absenceRequest)`, puis `$absenceRequest->decide($user, 'approve', $request->reason)`.
- `reject()` : `$this->authorize('decide', $absenceRequest)`, puis `$absenceRequest->decide($user, 'reject', $request->reason)`.
- Supprimer : `getExpectedApprovalLevel()`, `arePreviousLevelsApproved()`, `processApprovalWorkflow()`, `getApproverIdForLevel()`, `getRhApproverId()`, `getAdminApproverId()`.

#### `AbsenceRequestController.php`

- `submit()` : `status='pending'`, `current_approval_level=1`, `current_approver_id=$employee->manager_id`, création de l'Approval pending pour le manager (si manager_id existe). Si pas de manager → `status='approved'` directement.
- `show()` : utiliser `$absenceRequest->canView($user)`.
- `cancel()` : logique existante conservée.
- `acknowledgeRh()` : `$this->authorize('acknowledgeRh', $absenceRequest)`, puis `$absenceRequest->acknowledgeRh($user)`.

---

### Étape 5 — Routes

**`routes/web.php`** : aucune modification structurelle. La route `/approvals` pointe vers `Approval/Index` (page à créer à l'étape 6).

**`routes/api.php`** :
```php
// Approbations (managers de la chaîne uniquement)
Route::post('approvals/{approval}/approve', [ApprovalController::class, 'approve'])
    ->middleware('role:manager|rh|admin');
Route::post('approvals/{approval}/reject', [ApprovalController::class, 'reject'])
    ->middleware('role:manager|rh|admin');

// Prise de connaissance RH
Route::post('absence-requests/{absenceRequest}/acknowledge-rh', [AbsenceRequestController::class, 'acknowledgeRh'])
    ->middleware('role:rh');
```

---

### Étape 6 — Frontend (Inertia + React TypeScript)

#### Types TypeScript

Ajouter dans `resources/js/types/auth.ts` (ou fichier dédié) :
```ts
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type ApprovalKind = 'approve' | 'reject';

export interface Role {
  id: number;
  name: string;
  label: string;
}

export interface ApprovalDecision {
  id: number;
  absence_request_id: number;
  approver_id: number;
  step: number;
  status: ApprovalStatus;
  kind: ApprovalKind | null;
  comment: string | null;
  approved_at: string | null;
  approver?: User;
}

export interface AbsenceRequestWorkflow {
  id: number;
  employee_id: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';
  current_approval_level: number;
  current_approver_id: number | null;
  current_approver?: User;
  rh_acknowledged_at: string | null;
  rh_acknowledged_by_id: number | null;
  rh_acknowledger?: User;
  approvals: ApprovalDecision[];
}
```

#### Pages et double portail

1. **`resources/js/pages/Approval/Index.tsx`** — créer (manquant, référencé par `routes/web.php:14`). Liste les `pending` de l'utilisateur connecté (`GET /api/approvals/pending`), boutons Approuver / Rejeter avec saisie optionnelle de raison.
2. **`resources/js/pages/DemandeDetail.tsx`** — ajouter : affichage du workflow (statut, approver courant, historique des décisions), boutons Approuver / Rejeter si `canDecide`, bouton "Prendre connaissance" (RH) si `status='approved'` et utilisateur RH.
3. **`resources/js/pages/Historique.tsx`** — ajouter colonne/badge pour l'approver courant et l'état de la prise de connaissance RH.
4. **`resources/js/pages/Dashboard.tsx`** — ajouter un widget de bascule `Employé ↔ RH` :
   - Mode Employé (par défaut) : Nouvelle Demande, Historique, Mes demandes
   - Mode RH : Approbations en attente, Prise de connaissance
   - La bascule ne déconnecte pas et ne recharge pas la session

#### Appels API

- `POST /api/approvals/{id}/approve` + `{ reason?: string }`
- `POST /api/approvals/{id}/reject` + `{ reason?: string }`
- `POST /api/absence-requests/{id}/acknowledge-rh` (RH uniquement)
- `GET /api/approvals/pending`

---

### Étape 7 — Tests et vérification

**Unitaires (PHPUnit) :**
- `canView()` : propriétaire oui, subordonné oui, étranger non
- `canDecide()` : pending + current approver + manage l'employé + rôle manager/rh oui ; autres cas non
- `canAcknowledgeRh()` : status='approved' + user RH oui ; status='pending' non ; user non-RH non
- `hasRole()` / `hasAnyRole()` : multi-rôles fonctionnent (un user employee+rh retourne true pour les deux)
- `decide('reject')` → status='rejected', current_approver_id=null
- `decide('approve')` avec manager → status='pending', current_approver_id=manager_id
- `decide('approve')` sans manager → status='approved', current_approver_id=null
- `acknowledgeRh()` sur demande non-approved → exception
- Contrôleurs : approbation/refus autorisés, refus pour utilisateur non-autorisé

**Intégration :**
- Flux complet : employé crée (draft) → soumet (pending, current_approver=manager) → manager approuve (pending, next level ou approved si fin de chaîne) → RH prend connaissance (rh_acknowledged_at renseigné, status inchangé)
- Rejet à n'importe quel niveau → rejected, fin du workflow
- Utilisateur multi-rôles (employee+rh) peut soumettre une absence ET approuver une autre dans la même session

**Frontend :** `npm run build` pour vérifier la compilation TypeScript.

---

## 4. Ordre d'implémentation et dépendances

```
Étape 1 (Migrations: workflow + rôles) → Étape 2 (Modèles) → Étape 3 (Policy + middleware) → Étape 4 (Contrôleurs) → Étape 5 (Routes) → Étape 6 (Frontend + double portail) → Étape 7 (Tests)
```

---

## 5. Ce qui N'est PAS modifié (non-régression)

- Table `users` conservée (profil applicatif/cache)
- Kerberos / SSO / adldap2 : parkés (décision antérieure)
- Aucune colonne existante supprimée ni renommée à l'étape 1 (la colonne `users.role` est conservée temporairement)
- Logique de cancel (draft only, restriction 3+ approuvés) conservée
- Routes existantes conservées
- Statuts `draft`, `pending`, `approved`, `rejected`, `cancelled` de `absence_requests.status` conservés
- Authentification inchangée : matricule + mot de passe uniquement, pas de sélection de rôle au login

---

## 6. Point d'attention : rôle Admin

Le middleware `role:admin` est conservé comme garde-fou d'accès, mais l'autorisation fine (`canDecide`) repose sur `current_approver_id` et `isSubordinateOf`. Un admin décide uniquement s'il est le `current_approver_id` d'une demande dont il manage l'employé.

---

## 7. Livrable attendu après approbation

Une fois ce plan validé, l'implémentation se fera dans l'ordre ci-dessus, étape par étape, avec tests à chaque étape. Aucun code ne sera écrit tant que l'utilisateur n'aura pas donné son accord sur ce plan.

---

## 8. Fichiers concernés (résumé)

| Fichier | Action |
|---|---|
| `database/migrations/2026_xx_xx_xxxxxx_add_workflow_fields_to_absence_requests_and_approvals.php` | Créer |
| `database/migrations/2026_xx_xx_xxxxxx_create_roles_and_role_user_tables.php` | Créer |
| `app/Models/Role.php` | Créer |
| `app/Models/AbsenceRequest.php` | Modifier (fillable, casts, relations, canView/canDecide/canAcknowledgeRh/decide/acknowledgeRh) |
| `app/Models/Approval.php` | Modifier (fillable kind) |
| `app/Models/User.php` | Modifier (roles(), hasRole(), hasAnyRole(), isSubordinateOf, raccourcis is*) |
| `app/Policies/AbsenceRequestPolicy.php` | Créer |
| `app/Http/Controllers/API/ApprovalController.php` | Modifier (supprimer niveaux fixes, logique hiérarchique) |
| `app/Http/Controllers/API/AbsenceRequestController.php` | Modifier (submit, show, ajouter acknowledgeRh) |
| `app/Http/Controllers/AbsenceRequestShowController.php` | Modifier (autorisation via canView) |
| `app/Http/Controllers/API/AuthController.php` | Aucun changement |
| `routes/api.php` | Modifier (ajouter route acknowledge-rh) |
| `resources/js/types/auth.ts` | Modifier (interfaces workflow + Role) |
| `resources/js/pages/Approval/Index.tsx` | Créer |
| `resources/js/pages/DemandeDetail.tsx` | Modifier (workflow + boutons décider/accuser RH) |
| `resources/js/pages/Historique.tsx` | Modifier (colonne approver courant + état RH) |
| `resources/js/pages/Dashboard.tsx` | Modifier (ajouter widget bascule Employé ↔ RH) |