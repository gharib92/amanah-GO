/*
 Rekognition client helper
 Objectif : fournir des fonctions utilitaires pour appeler Amazon Rekognition.
 Ce fichier contient beaucoup de commentaires pour expliquer chaque partie.

 REMARQUES pour débutant :
 - Amazon Rekognition est un service AWS qui permet de détecter/analyser des visages.
 - On peut appeler CompareFaces avec des images stockées dans S3 ou avec des bytes (Bytes).
 - Dans un environnement Cloudflare Workers + R2, Rekognition ne lit pas R2 directement :
   il faudra soit :
     - copier depuis R2 vers S3 (si vous souhaitez utiliser S3 côté AWS), ou
     - récupérer les bytes côté backend et appeler Rekognition via le param "Bytes".
 - Sécurité : ne stockez jamais vos clefs AWS dans le code. Utilisez les variables d'environnement
   (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION) ou un rôle IAM.

 Le code ci‑dessous est un squelette : les appels réels sont fournis en exemple (TODO).
*/

// Importer le client Rekognition depuis le SDK AWS v3
// Vous devez ajouter la dépendance `@aws-sdk/client-rekognition` si vous voulez exécuter
// les appels réels. Pour l'instant, ce fichier inclut le pseudo‑code et des fonctions qui
// renvoient une structure standard pour faciliter le développement.

// import { RekognitionClient, CompareFacesCommand } from "@aws-sdk/client-rekognition"

// Type retourné par nos helpers (simple et pratique pour la suite)
export type RekognitionResult = {
  success: boolean
  similarity?: number | null // similarité (%) entre les deux visages, 0-100
  raw?: any // réponse brute du provider pour debug
  error?: string | null
}

// Créer / configurer un client Rekognition (version asynchrone)
// Paramètres :
// - env : objet contenant les variables d'environnement (AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
// Retour : instance de RekognitionClient (ou null si pas configuré / dépendance manquante)
export async function createRekognitionClient(env?: any): Promise<any> {
  // Vérifier si les variables d'environnement sont définies
  const region = env?.AWS_REGION || process.env.AWS_REGION
  const key = env?.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID
  const secret = env?.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY

  if (!region || !key || !secret) {
    // Ne pas planter : retourner null pour indiquer que Rekognition n'est pas configuré
    console.warn('⚠️ Rekognition client not configured (missing AWS env vars)')
    return null
  }

  try {
    // Essayer d'importer dynamiquement le SDK AWS Rekognition si présent
    const mod = await import('@aws-sdk/client-rekognition')
    const { RekognitionClient } = mod

    const client = new RekognitionClient({ region, credentials: { accessKeyId: key, secretAccessKey: secret } })
    console.log('✅ Rekognition client initialized')
    return client
  } catch (err: any) {
    // Si l'import échoue (dépendance non installée), on logge et renvoie null.
    console.warn('⚠️ AWS SDK Rekognition not available or failed to import:', err?.message || err)
    return null
  }
}

// Helper : comparer deux images en bytes via Rekognition (ex: Bytes sources)
// Params:
// - client: instance de RekognitionClient (peut être null en dev)
// - sourceBytes: ArrayBuffer ou Buffer du selfie
// - targetBytes: ArrayBuffer ou Buffer du document (ou visage extrait du document)
// Retour: RekognitionResult
export async function compareFacesWithBytes(client: any, sourceBytes: ArrayBuffer | Uint8Array, targetBytes: ArrayBuffer | Uint8Array): Promise<RekognitionResult> {
  // Si client non configuré, retourner un mock friendly
  if (!client) {
    console.log('ℹ️ Rekognition client non configuré, retour mock')
    return { success: true, similarity: 0.82, raw: { mock: true } }
  }

  try {
    // Essayer d'importer CompareFacesCommand dynamiquement
    const mod = await import('@aws-sdk/client-rekognition')
    const { CompareFacesCommand } = mod

    // Convertir ArrayBuffer en Uint8Array si nécessaire
    const sourceArr = sourceBytes instanceof ArrayBuffer ? new Uint8Array(sourceBytes) : sourceBytes as Uint8Array
    const targetArr = targetBytes instanceof ArrayBuffer ? new Uint8Array(targetBytes) : targetBytes as Uint8Array

    const params = {
      SourceImage: { Bytes: sourceArr },
      TargetImage: { Bytes: targetArr },
      SimilarityThreshold: 50 // optionnel, on peut ajuster
    }

    // Timeout helper : rejette si dépasse 10s
    const cmd = new CompareFacesCommand(params)
    const sendPromise = client.send(cmd)

    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Rekognition timeout')), 10000))

    const resp: any = await Promise.race([sendPromise, timeoutPromise])

    // Interpréter la réponse
    const bestMatch = resp?.FaceMatches?.[0]
    const similarity = bestMatch?.Similarity || 0

    return { success: true, similarity, raw: resp }
  } catch (err: any) {
    console.error('❌ Rekognition compareFaces failed:', err?.message || err)
    return { success: false, similarity: null, error: err?.message || String(err) }
  }
}

// Helper : comparer deux images stockées dans S3 (si vous stockez dans S3)
// Params:
// - client: instance de RekognitionClient
// - sourceBucket, sourceName: S3 bucket & key pour le selfie
// - targetBucket, targetName: S3 bucket & key pour le document
export async function compareFacesWithS3(client: any, sourceBucket: string, sourceName: string, targetBucket: string, targetName: string): Promise<RekognitionResult> {
  if (!client) {
    console.log('ℹ️ Rekognition client non configuré, retour mock (S3)')
    return { success: true, similarity: 78, raw: { mock: true } }
  }

  try {
    const mod = await import('@aws-sdk/client-rekognition')
    const { CompareFacesCommand } = mod

    const params = {
      SourceImage: { S3Object: { Bucket: sourceBucket, Name: sourceName } },
      TargetImage: { S3Object: { Bucket: targetBucket, Name: targetName } },
      SimilarityThreshold: 50
    }

    const cmd = new CompareFacesCommand(params)

    const sendPromise = client.send(cmd)
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Rekognition timeout')), 10000))
    const resp: any = await Promise.race([sendPromise, timeoutPromise])

    const bestMatch = resp?.FaceMatches?.[0]
    const similarity = bestMatch?.Similarity || 0

    return { success: true, similarity, raw: resp }
  } catch (err: any) {
    console.error('❌ Rekognition compareFaces (S3) failed:', err?.message || err)
    return { success: false, similarity: null, error: err?.message || String(err) }
  }
}
