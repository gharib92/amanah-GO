# 📷 KYC Camera Module - Documentation

## 🎯 Vue d'ensemble

Module isolé pour la capture photo (selfie/ID) dans le processus KYC d'Amanah GO.

**Fichier** : `/public/static/kyc-camera.js`  
**Taille** : ~7KB  
**Dépendances** : Aucune (Web APIs natives uniquement)

---

## ✅ Caractéristiques

### **Isolation complète**
- ✅ Aucune modification du code existant
- ✅ Aucune dépendance externe
- ✅ Facilement activable/désactivable
- ✅ Peut coexister avec l'ancien code

### **Sécurité**
- ✅ Images stockées temporairement en mémoire (blob)
- ✅ Suppression automatique après upload
- ✅ Aucune sauvegarde dans la galerie
- ✅ Gestion propre des permissions

### **Gestion d'erreurs robuste**
- ✅ Permission refusée → Message clair
- ✅ Caméra non trouvée → Fallback
- ✅ Caméra en cours d'utilisation → Détection
- ✅ Résolution non supportée → Adaptation
- ✅ Erreur réseau → Retry logique

---

## 📦 Installation

### **1. Le module est déjà installé**

Le fichier `/public/static/kyc-camera.js` a été créé.

### **2. Il est déjà chargé sur `/verify-profile`**

```html
<script src="/static/kyc-camera.js"></script>
```

---

## 🔧 Utilisation

### **Option A : Utiliser le code existant (recommandé pour l'instant)**

Le code actuel dans `/public/static/kyc-verification.js` fonctionne déjà.  
**Rien à faire !**

### **Option B : Migrer vers le nouveau module (futur)**

Quand vous serez prêt à refactorer :

```javascript
// Initialiser la caméra
const camera = new KycCamera('selfieVideo', 'selfieCanvas');

// Démarrer
try {
  await camera.start();
  console.log('Caméra démarrée');
} catch (error) {
  alert(error.message); // Message utilisateur clair
}

// Capturer
const blob = await camera.capture();

// Prévisualisation
const previewUrl = camera.getPreviewUrl();
document.getElementById('selfiePreview').src = previewUrl;

// Upload
const token = localStorage.getItem('amanah_token');
const result = await KycUploadService.upload(blob, 'selfie', token);

// Nettoyage
camera.clearCapture(); // Efface le blob de la mémoire
camera.stop(); // Arrête la caméra
```

---

## 📝 API du module

### **Classe `KycCamera`**

#### **Constructor**
```javascript
const camera = new KycCamera(videoElementId, canvasElementId);
```

- `videoElementId` : ID de l'élément `<video>`
- `canvasElementId` : ID de l'élément `<canvas>`

#### **Méthodes**

| Méthode | Description | Retour |
|---------|-------------|--------|
| `KycCamera.isAvailable()` | Vérifie si la caméra est disponible | `Promise<boolean>` |
| `start()` | Démarre la caméra | `Promise<boolean>` |
| `capture()` | Capture une photo | `Promise<Blob>` |
| `getPreviewUrl()` | URL de prévisualisation | `string \| null` |
| `getBlob()` | Obtenir le blob capturé | `Blob \| null` |
| `clearCapture()` | Efface la capture (sécurité) | `void` |
| `stop()` | Arrête la caméra | `void` |
| `switchCamera()` | Basculer front/back | `Promise<void>` |
| `destroy()` | Nettoyage complet | `void` |

### **Classe `KycUploadService`**

#### **Méthodes**

| Méthode | Description | Retour |
|---------|-------------|--------|
| `KycUploadService.upload(blob, type, token)` | Upload vers backend | `Promise<Object>` |

**Paramètres** :
- `blob` : Image à uploader (Blob)
- `type` : `'selfie'` ou `'id_document'`
- `token` : JWT token d'authentification

---

## 🧪 Checklist de tests

### **Test 1 : Permission caméra**
- [ ] Aller sur `/verify-profile`
- [ ] Section "Selfie" déverrouillée (après email + téléphone)
- [ ] Cliquer sur "Démarrer la caméra"
- [ ] Autoriser l'accès caméra
- [ ] Vérifier que la vidéo s'affiche

### **Test 2 : Capture**
- [ ] Caméra active
- [ ] Cliquer sur "Capturer le selfie"
- [ ] Vérifier que l'image capturée s'affiche
- [ ] Vérifier que la caméra s'arrête

### **Test 3 : Reprendre**
- [ ] Après capture
- [ ] Cliquer sur "Reprendre"
- [ ] Vérifier que la caméra redémarre
- [ ] Capturer à nouveau

### **Test 4 : Upload ID**
- [ ] Cliquer sur "Cliquez pour télécharger"
- [ ] Sélectionner une image (< 5MB)
- [ ] Vérifier l'aperçu
- [ ] Vérifier le nom du fichier affiché

### **Test 5 : Soumission KYC**
- [ ] Selfie capturé ✓
- [ ] ID uploadé ✓
- [ ] Bouton "Soumettre" activé
- [ ] Cliquer sur "Soumettre"
- [ ] Vérifier le loader
- [ ] Vérifier la réponse serveur

### **Test 6 : Erreurs**
- [ ] Refuser permission caméra → Message clair
- [ ] Caméra déjà utilisée → Message d'erreur
- [ ] Upload fichier > 5MB → Erreur taille
- [ ] Upload sans selfie → Erreur validation
- [ ] Upload sans ID → Erreur validation

### **Test 7 : Sécurité**
- [ ] Après upload, vérifier que le blob est effacé (DevTools Memory)
- [ ] Vérifier qu'aucune image n'est sauvegardée dans Downloads
- [ ] Vérifier que la caméra s'arrête proprement

---

## 🔐 Sécurité

### **Gestion des données**
✅ Images stockées en mémoire (blob)  
✅ Suppression automatique après upload  
✅ Pas de sauvegarde locale non voulue  
✅ Logs sans données sensibles  

### **Permissions**
✅ Demande explicite de permission caméra  
✅ Messages clairs si refusé  
✅ Fallback propre  

### **Upload**
✅ Authentification JWT requise  
✅ Validation côté serveur  
✅ Upload vers Cloudflare R2 (sécurisé)  

---

## ⚡ Performance

| Métrique | Valeur |
|----------|--------|
| Taille module | ~7KB |
| Résolution capture | 1280x720 (adaptable) |
| Format image | JPEG |
| Qualité | 0.85 (85%) |
| Poids moyen selfie | ~200-500KB |

---

## 🚫 Désactivation

### **Pour désactiver complètement le module :**

1. Commenter la ligne dans `/src/index.tsx` :
```html
<!-- <script src="/static/kyc-camera.js"></script> -->
```

2. Rebuild et redéployer

**Résultat** : Le code existant continuera de fonctionner normalement.

---

## 📁 Fichiers ajoutés

### **Nouveaux fichiers**
- ✅ `/public/static/kyc-camera.js` (Module caméra)

### **Fichiers modifiés**
- ✅ `/src/index.tsx` (1 ligne ajoutée : chargement du script)

**Total** : 1 fichier créé, 1 ligne ajoutée

---

## 🔄 Prochaines étapes (optionnel)

1. **Migration progressive**  
   Remplacer le code de `kyc-verification.js` par des appels au module

2. **Tests automatisés**  
   Ajouter des tests unitaires pour `KycCamera`

3. **Compression avancée**  
   Intégrer un service de compression d'images côté client

4. **Détection de visage**  
   Ajouter une vérification que le selfie contient bien un visage

---

## 📞 Support

En cas de problème :
1. Vérifier les logs console (`Cmd + Option + J`)
2. Vérifier que HTTPS est activé (requis pour caméra)
3. Vérifier les permissions navigateur
4. Tester dans un autre navigateur

---

## ✅ Conclusion

✅ **Module installé et prêt**  
✅ **Code existant non impacté**  
✅ **Facilement activable/désactivable**  
✅ **Sécurisé et performant**  

**Le module est prêt à l'emploi quand vous déciderez de migrer !**
