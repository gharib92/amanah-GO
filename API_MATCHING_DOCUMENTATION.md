# 🎯 APIs MATCHING - Documentation Technique

## Vue d'ensemble

Les APIs de matching intelligent permettent de trouver les meilleures correspondances entre :
- **Colis** recherchant un voyageur
- **Voyageurs** recherchant des colis

### Score de Compatibilité (0-100)

Chaque correspondance reçoit un score basé sur 5 critères :

| Critère | Points Max | Description |
|---------|------------|-------------|
| **Dates** | 30 | Compatibilité temporelle |
| **Aéroports** | 25 | Origine/Destination identiques |
| **Poids** | 20 | Disponibilité suffisante |
| **Prix** | 15 | Budget vs Prix demandé |
| **Rating** | 10 | Note utilisateur |

---

## 1. POST /api/matches/trips-for-package

**Description** : Trouve les trajets compatibles pour un colis donné

### Request Body

```json
{
  "origin_city": "Paris",
  "destination_city": "Casablanca",
  "weight": 10,
  "budget": 100,
  "preferred_date": "2025-01-15",
  "flexible_dates": true,
  "min_rating": 4.0,
  "kyc_verified_only": false
}
```

### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `origin_city` | string | ✅ | Ville de départ |
| `destination_city` | string | ✅ | Ville d'arrivée |
| `weight` | number | ✅ | Poids du colis (kg) |
| `budget` | number | ✅ | Budget maximum (€) |
| `preferred_date` | string | ✅ | Date préférée (YYYY-MM-DD) |
| `flexible_dates` | boolean | ❌ | Flexibilité ±2 jours (défaut: false) |
| `min_rating` | number | ❌ | Note minimum voyageur (défaut: 0) |
| `kyc_verified_only` | boolean | ❌ | Uniquement KYC vérifié (défaut: false) |

### Response Success (200)

```json
{
  "matches": [
    {
      "trip_id": 1,
      "score": 85,
      "traveler": {
        "id": 1,
        "name": "Ahmed Alami",
        "rating": 4.8,
        "kyc_status": "VERIFIED"
      },
      "trip": {
        "origin_city": "Paris",
        "destination_city": "Casablanca",
        "departure_date": "2025-01-15T10:00:00Z",
        "arrival_date": "2025-01-15T14:00:00Z",
        "available_weight": 15,
        "price_per_kg": 8,
        "flexible_dates": true,
        "flight_number": "AT205"
      },
      "pricing": {
        "price_per_kg": 8,
        "total_price": 80,
        "commission": 9.6,
        "traveler_earns": 70.4,
        "savings": 200,
        "savings_percent": 71
      },
      "compatibility": {
        "date_match": true,
        "route_match": true,
        "weight_ok": true,
        "price_ok": true
      }
    }
  ],
  "total": 1,
  "package_details": {
    "origin_city": "Paris",
    "destination_city": "Casablanca",
    "weight": 10,
    "budget": 100,
    "preferred_date": "2025-01-15",
    "flexible_dates": true
  },
  "filters": {
    "min_rating": 4.0,
    "kyc_verified_only": false
  }
}
```

### Response Error (400)

```json
{
  "error": "Champs obligatoires manquants"
}
```

### Response Empty (200)

```json
{
  "matches": [],
  "total": 0,
  "message": "Aucun trajet trouvé pour ces critères"
}
```

---

## 2. POST /api/matches/packages-for-trip

**Description** : Trouve les colis compatibles pour un trajet donné

### Request Body

```json
{
  "origin_city": "Paris",
  "destination_city": "Casablanca",
  "available_weight": 15,
  "price_per_kg": 8,
  "departure_date": "2025-01-15",
  "flexible_dates": true,
  "min_budget": 50
}
```

### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `origin_city` | string | ✅ | Ville de départ |
| `destination_city` | string | ✅ | Ville d'arrivée |
| `available_weight` | number | ✅ | Poids disponible (kg) |
| `price_per_kg` | number | ✅ | Prix par kg demandé (€) |
| `departure_date` | string | ✅ | Date de départ (YYYY-MM-DD) |
| `flexible_dates` | boolean | ❌ | Flexibilité ±2 jours (défaut: false) |
| `min_budget` | number | ❌ | Budget minimum accepté (défaut: 0) |

### Response Success (200)

```json
{
  "matches": [
    {
      "package_id": 1,
      "score": 82,
      "sender": {
        "id": 2,
        "name": "Fatima Bennani",
        "rating": 4.9,
        "kyc_status": "VERIFIED"
      },
      "package": {
        "title": "Cadeaux famille",
        "content": "Vêtements et jouets",
        "weight": 10,
        "dimensions": "60x40x30",
        "budget": 100,
        "preferred_date": "2025-01-15",
        "flexible_dates": true,
        "photo_url": null
      },
      "pricing": {
        "sender_pays": 80,
        "traveler_earns": 70.4,
        "commission": 9.6,
        "savings": 200,
        "savings_percent": 71
      },
      "compatibility": {
        "date_match": true,
        "route_match": true,
        "weight_ok": true,
        "budget_ok": true
      }
    }
  ],
  "total": 1,
  "trip_details": {
    "origin_city": "Paris",
    "destination_city": "Casablanca",
    "available_weight": 15,
    "price_per_kg": 8,
    "departure_date": "2025-01-15",
    "flexible_dates": true
  },
  "filters": {
    "min_budget": 50
  }
}
```

---

## Algorithme de Scoring Détaillé

### 1. Dates (30 points max)

```typescript
const daysDiff = Math.abs((packageDate - tripDate) / (1000 * 60 * 60 * 24))

if (daysDiff === 0) {
  score += 30  // Même jour = parfait
} else if (daysDiff <= 2 && flexible_dates) {
  score += 25  // ±2 jours avec flexibilité
} else if (daysDiff <= 2) {
  score += 20  // ±2 jours sans flexibilité
} else if (daysDiff <= 7) {
  score += 10  // Même semaine
}
```

### 2. Aéroports (25 points max)

```typescript
const originMatch = packageData.origin_city === tripData.departure_city
const destMatch = packageData.destination_city === tripData.arrival_city

if (originMatch && destMatch) {
  score += 25  // Trajet exact
} else if (originMatch || destMatch) {
  score += 15  // Au moins une ville correspond
}
```

### 3. Poids (20 points max)

```typescript
const availableWeight = tripData.available_weight - tripData.reserved_weight
const packageWeight = packageData.weight

if (packageWeight <= availableWeight) {
  const ratio = packageWeight / availableWeight
  if (ratio <= 0.5) {
    score += 20  // Largement suffisant
  } else if (ratio <= 0.8) {
    score += 15  // Bon ratio
  } else {
    score += 10  // Juste suffisant
  }
}
```

### 4. Prix (15 points max)

```typescript
const proposedPricePerKg = packageData.budget / packageData.weight
const requestedPricePerKg = tripData.price_per_kg

if (proposedPricePerKg >= requestedPricePerKg) {
  const ratio = proposedPricePerKg / requestedPricePerKg
  if (ratio >= 1.2) {
    score += 15  // Paie plus que demandé
  } else if (ratio >= 1.0) {
    score += 12  // Paie exactement
  } else {
    score += 8   // Paie un peu moins
  }
}
```

### 5. Rating (10 points max)

```typescript
if (travelerRating >= 4.5) {
  score += 10
} else if (travelerRating >= 4.0) {
  score += 8
} else if (travelerRating >= 3.5) {
  score += 5
} else if (travelerRating > 0) {
  score += 3
}
```

---

## Exemples d'Utilisation

### Exemple 1 : Expéditeur cherche voyageur

```bash
curl -X POST http://localhost:3000/api/matches/trips-for-package \
  -H "Content-Type: application/json" \
  -d '{
    "origin_city": "Paris",
    "destination_city": "Casablanca",
    "weight": 10,
    "budget": 100,
    "preferred_date": "2025-01-15",
    "flexible_dates": true,
    "min_rating": 4.0
  }'
```

### Exemple 2 : Voyageur cherche colis

```bash
curl -X POST http://localhost:3000/api/matches/packages-for-trip \
  -H "Content-Type: application/json" \
  -d '{
    "origin_city": "Paris",
    "destination_city": "Casablanca",
    "available_weight": 15,
    "price_per_kg": 8,
    "departure_date": "2025-01-15",
    "flexible_dates": true
  }'
```

---

## Calculs Financiers

### Commission : 12%

```typescript
const totalPrice = price_per_kg * weight
const commission = totalPrice * 0.12
const travelerEarns = totalPrice - commission
const savings = (28 * weight) - totalPrice  // vs DHL
```

### Exemple : Colis 10kg à 8€/kg

- **Prix total** : 80€
- **Commission Amanah** : 9.60€ (12%)
- **Voyageur gagne** : 70.40€ (88%)
- **Économies vs DHL** : 200€ (71%)

---

## Intégration Frontend

### Recherche depuis page /search

```javascript
// Page /search - Recherche trajets pour colis
const response = await fetch('/api/matches/trips-for-package', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    origin_city: searchOrigin,
    destination_city: searchDestination,
    weight: packageWeight,
    budget: packageBudget,
    preferred_date: departureDate,
    flexible_dates: isFlexible
  })
})

const data = await response.json()
// Afficher les matches dans /results avec score, prix, voyageur
```

### Affichage dans /results

```javascript
matches.forEach(match => {
  // Badge score
  const scoreClass = match.score >= 80 ? 'bg-green-500' : 
                     match.score >= 60 ? 'bg-blue-500' : 'bg-gray-500'
  
  // Afficher voyageur
  // Afficher prix et économies
  // Afficher compatibilité (dates, route, poids, prix)
})
```

---

## Notes Techniques

- **Performance** : Optimisé pour < 100ms avec index DB sur `status`, `departure_city`, `arrival_city`
- **Scalabilité** : Cloudflare Workers edge computing
- **Sécurité** : Validation input, sanitization SQL
- **Cache** : Possible avec Cloudflare KV pour résultats fréquents

---

## Statuts

✅ **Implémenté et testé**
- API `/api/matches/trips-for-package`
- API `/api/matches/packages-for-trip`
- Algorithme de scoring 0-100
- Calculs financiers
- Filtres avancés

🚧 **À venir**
- Cache avec KV pour performances
- Webhooks notification nouveaux matchs
- ML pour améliorer scoring

---

**Date** : 2025-01-25  
**Version** : 1.0  
**Status** : Production Ready ✅
