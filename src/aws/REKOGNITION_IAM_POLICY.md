Amanah GO — Rekognition minimal IAM policy & example exports

But: fournir une policy IAM minimale pour tests locaux et commandes d'export pour activer Rekognition en local.

---

1) Policy IAM minimale (JSON)

- Remplace `123456789012` par ton AWS account id si tu veux créer la policy via AWS CLI.
- Remplace `<your-bucket-name>` par le nom du bucket S3 que tu utiliseras (si tu stockes des images en S3).

rekognition-policy.json
```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "RekognitionCompare",
      "Effect": "Allow",
      "Action": [
        "rekognition:CompareFaces",
        "rekognition:SearchFacesByImage",
        "rekognition:DetectFaces"
      ],
      "Resource": "*"
    },
    {
      "Sid": "S3ReadForImages",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket",
        "s3:PutObject"
      ],
      "Resource": [
        "arn:aws:s3:::<your-bucket-name>",
        "arn:aws:s3:::<your-bucket-name>/*"
      ]
    },
    {
      "Sid": "CloudWatchLogsWrite",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

Notes:
- `rekognition:*` actions are kept explicit and minimal for face compare flows. If you later use more Rekognition APIs, add them.
- For tests, `Resource: "*"` is OK for Rekognition, but you can scope further if required.
- S3 actions are limited to a single bucket; prefer this to `Resource: "*"`.

---

2) Exemple de commandes AWS CLI pour créer user & policy (tests)

# 1) Créer la policy
aws iam create-policy --policy-name AmanahRekognitionPolicy --policy-document file://rekognition-policy.json

# 2) Créer un utilisateur de test
aws iam create-user --user-name amanah-rekognition-user

# 3) Attacher la policy à l'utilisateur
aws iam attach-user-policy --user-name amanah-rekognition-user --policy-arn arn:aws:iam::<ACCOUNT_ID>:policy/AmanahRekognitionPolicy

# 4) Créer des credentials (access key)
aws iam create-access-key --user-name amanah-rekognition-user

Le dernier commande retournera un JSON avec `AccessKeyId` et `SecretAccessKey`. Copie-les pour les étapes d'export ci‑dessous.

---

3) Exemple de fichier `.env.local` (NE PAS commit)
```
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# AWS_SESSION_TOKEN=xxxxx   # optionnel, si vous utilisez des credentials temporaires
APP_ORIGIN=http://localhost:3000
```

Explication simple:
- `AWS_REGION`: région AWS (ex: eu-west-1)
- `AWS_ACCESS_KEY_ID` et `AWS_SECRET_ACCESS_KEY`: identifiants pour un utilisateur/role avec les permissions ci‑dessus
- `AWS_SESSION_TOKEN`: si vous utilisez des credentials temporaires (ex: STS assume-role)
- `APP_ORIGIN`: utile si vos images DB sont des routes internes commençant par '/'

---

4) Commandes d'export (copier/coller dans ton terminal macOS)

export AWS_REGION=eu-west-1
export AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxx
export AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# export AWS_SESSION_TOKEN=... # seulement si nécessaire
export APP_ORIGIN="http://localhost:3000"

Astuce: pour charger rapidement `.env.local` dans le terminal (démo):
set -a; source .env.local; set +a

---

5) Vérification rapide
- Installe le SDK Rekognition localement (si ce n'est pas encore fait):
  npm install @aws-sdk/client-rekognition

- Démarre le serveur (dev):
  npm run dev:sandbox

- Lance le script de test réel:
  API_URL="http://localhost:3000" BEARER_TOKEN="<JWT>" \ 
    SELFIE_PATH="./selfie.jpg" DOCUMENT_PATH="./id.jpg" ./test-kyc-rekognition.sh

- Regarde la console du serveur pour: `✅ Rekognition client initialized`, puis `fetching images`, `calling Rekognition`.

---

6) Recommandations de sécurité (débutant)
- NE PAS commit tes clés dans Git. Ajoute `.env.local` à `.gitignore`.
- Préfère les rôles IAM et permissions temporaires en production.
- Limite les permissions au strict nécessaire (principe du moindre privilège).

---

Si tu veux, je peux aussi générer une policy JSON prête à copier dans AWS Console ou un gist pour faciliter la création.