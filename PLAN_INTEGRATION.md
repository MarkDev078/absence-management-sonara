# Plan d'intégration — Frontend sonara-login dans absence-management-sonara-2-0

## Objectif

Appliquer le frontend bien conçu du projet `sonara-login` (React 19 + React Router SPA, CSS pur, Google Fonts Inter/Poppins) sur la base Laravel `absence-management-sonara-2-0`, en remplaçant le mock `localStorage` (`demoDb.ts`) par l'API Laravel Sanctum existante.

## État des lieux (diagnostic)

Deux setups frontend coexistent dans `resources/js/` :

| Setup | Chemin | Technologie | État | Problème |
|-------|--------|-------------|------|----------|
| Inertia.js v3 | `resources/js/pages/` | Inertia + React + Tailwind | Incomplet | Deux pages pointent vers des fichiers manquants/mauvais (`AbsenceType/Index` dead link, `Auth/Login` vs `Auth/Login.tsx`) |
| React Router (miroir sonara-login) | `resources/js/src/` | React Router 7 + CSS pur | Copie verbatim de sonara-login | Utilise encore `demoDb.ts` (localStorage, mots de passe en clair) au lieu de l'API Sanctum |

Incohérences backend déjà identifiées :
- `routes/web.php:13` → `AbsenceType/Index` est un lien mort (le vrai fichier est `Archived/AbsenceType/Index.tsx`).
- `app/Http/Controllers/API/ApprovalController.php:44,87` → `approve()`/`reject()` bloquent avec `isManager()` alors que les routes API autorisent `role:manager|rh|admin` (RH et admin refusés à tort).
- `app/Http/Controllers/API/AbsenceRequestController.php:219-223` → `cancel()` refuse d'annuler une demande `approved` avec le message "Cannot cancel fully approved request", concept ambigu et incohérent avec le statut `pending` autorisé.

Sécurité : `resources/js/src/data/demoDb.ts` contient des mots de passe en clair (`demo1234` pour tous les comptes démo EMP001, CHEF001, DIR001…). Ce fichier ne doit JAMAIS être committé en production.

## Décision d'architecture

**Adopter `resources/js/src/` (React Router) comme frontend unique**, et traiter `resources/js/pages/` (Inertia) comme héritage à archiver.

Raison :
- Le design sonara-login est déjà une SPA React Router complète avec ses composants (`PageShell`, `AppMenus`, pages Login/Dashboard/Historique/NouvelleDemande/DemandeDetail…).
- Le dossier `src/` en est déjà une copie verbatim ; il suffit de brancher l'API à la place du mock.
- Inertia impose des rechargements de page côté serveur qui dénaturent l'expérience SPA conçue dans sonara-login.
- Laravel Sanctum supporte l'authentification SPA (cookies de session + CSRF) sur le même domaine, ce qui convient parfaitement à un React Router servi par Laravel.

## Plan d'action (étapes)

### Étape 1 — Servir le SPA React depuis Laravel
- Ajouter une route catch-all dans `routes/web.php` qui renvoie l'application React (vue Blade ou fichier HTML buildé par Vite) pour toutes les routes non-API, afin que React Router gère le routage côté client.
- Conserver les routes API existantes sous `/api` (déjà définies dans `routes/api.php` avec `auth:sanctum`).
- Conserver `/login` (POST) et `/logout` (POST) dans `AuthController` pour l'authentification Sanctum session-based.

### Étape 2 — Remplacer `demoDb.ts` par une couche API (`src/api/`)
Créer `resources/js/src/api/client.ts` (fetch avec `credentials: 'include'` et en-tête CSRF) puis des fonctions :
- `login(matricule, password)` → POST `/api/login` (ou réutiliser `/login` web)
- `me()` → GET `/api/profile`
- `absenceTypes()` → GET `/api/absence-types`
- `absenceRequests()` → GET `/api/absence-requests`
- `createAbsenceRequest(data)` → POST `/api/absence-requests`
- `submitAbsenceRequest(id)` → POST `/api/absence-requests/{id}/submit`
- `cancelAbsenceRequest(id)` → POST `/api/absence-requests/{id}/cancel`
- `acknowledgeRh(id)` → POST `/api/absence-requests/{id}/acknowledge-rh`
- `pendingApprovals()` → GET `/api/approvals/pending`
- `approveApproval(id, reason)` → POST `/api/approvals/{id}/approve`
- `rejectApproval(id, reason)` → POST `/api/approvals/{id}/reject`
- `teamAbsenceRequests()` → GET `/api/my-team/absence-requests`

Supprimer `resources/js/src/data/demoDb.ts` et remplacer tous les appels (`getCurrentUser`, `authenticate`, `createDemand`, `decide`, `cancelDemand`, `hasSubordinates`, `myDemands`…) par la couche API.

### Étape 3 — Transférer le design sonara-login
Copier depuis `D:\WeCode\Node.js\sonara-login` vers `resources/js/src/` :
- `index.css` (variables CSS `--sonara-*`, Google Fonts, police Trebuchet MS)
- Les composants `PageShell.tsx`, `AppMenus.tsx`
- Les pages `Login.tsx`, `Dashboard.tsx`, `Historique.tsx`, `NouvelleDemande.tsx`, `DemandeDetail.tsx`, `NouvelleReprise.tsx`, `RepriseDetail.tsx`, `ManagerDetail.tsx`
- `App.tsx` (routes React Router, garde `Private`)
- `main.tsx`

Les adapter pour utiliser la couche API au lieu de `demoDb.ts`.

### Étape 4 — Corriger les incohérences backend
1. `routes/web.php:13` → pointer vers `Archived/AbsenceType/Index` ou recréer la page `AbsenceType/Index.tsx`.
2. `ApprovalController::approve()` et `reject()` → remplacer `if (! $user->isManager())` par une vérification cohérente avec le middleware (autoriser manager, rh, admin selon la logique métier, ou ajuster le middleware).
3. `AbsenceRequestController::cancel()` → clarifier le statut "fully approved" : soit autoriser l'annulation d'une demande approuvée par l'employé (avec cohérence métier), soit retourner une erreur explicite et documentée.

### Étape 5 — Sécurité
- Ajouter `resources/js/src/data/demoDb.ts` à `.gitignore` (s'il ne l'est pas déjà).
- Ne jamais committer les mots de passe en clair.
- Prévoir un fichier `demoDb.example.ts` sans mots de passe si un mock doit être conservé pour le développement.

### Étape 6 — Vérification
- `npm install && npm run build` (Vite 8) côté frontend.
- `php artisan` (migrations, seeds) et `php artisan route:list` pour vérifier les routes.
- Tester les flux : login employé → nouvelle demande → validation manager → accuse-réception RH.

## Fichiers à créer
- `resources/js/src/api/client.ts`
- `resources/js/src/api/endpoints.ts` (ou regroupé dans client.ts)
- `PLAN_INTEGRATION.md` (ce document)

## Fichiers à modifier
- `resources/js/src/App.tsx` (brancher l'API, supprimer l'import demoDb)
- `resources/js/src/pages/Login.tsx`
- `resources/js/src/pages/Dashboard.tsx`
- `resources/js/src/components/PageShell.tsx`
- `resources/js/src/components/AppMenus.tsx`
- `resources/js/src/index.css`
- `resources/js/src/main.tsx` (éventuellement)
- `routes/web.php` (route catch-all SPA + correction AbsenceType)
- `app/Http/Controllers/API/ApprovalController.php` (autorisations rh/admin)
- `app/Http/Controllers/API/AbsenceRequestController.php` (clarification cancel)
- `.gitignore` (ajouter demoDb.ts si absent)

## Fichiers à supprimer / archiver
- `resources/js/src/data/demoDb.ts` (supprimer, ou déplacer vers un dossier `archived/` hors du build)
- `resources/js/pages/` (Inertia) → archiver, ne plus servir de frontend principal

## Livrable final
Rapport d'analyse complet + code intégré fonctionnel : login via l'API Sanctum, création/soumission de demandes d'absence, chaîne d'approbation hiérarchique, accuse-réception RH, avec le design visuel sonara-login appliqué.
