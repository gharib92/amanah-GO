Rekognition integration - quick setup (for beginners)

What environment variables to set:

- AWS_REGION: AWS region where Rekognition is available (ex: eu-west-1)
- AWS_ACCESS_KEY_ID: IAM access key id for a user/role with Rekognition and S3 permissions
- AWS_SECRET_ACCESS_KEY: Secret access key for the IAM user

Permissions required:
- Rekognition: rekognition:CompareFaces (and any other Rekognition actions you plan to use)
- S3: s3:GetObject, s3:PutObject (if you plan to store images in S3)

Activation steps (simple):
1) Install AWS Rekognition SDK in your project (locally and in your build):
   npm install @aws-sdk/client-rekognition

2) Set the environment variables in your dev environment or in Cloudflare Workers secrets:
   - For local dev: set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
   - For Cloudflare: add secrets / env in the dashboard or use wrangler secrets

3) Make sure images are reachable by your backend:
   - Option A: store selfies and documents in an S3 bucket accessible by Rekognition
   - Option B: fetch images as bytes from their URLs (R2 or internal endpoints) and call Rekognition with Bytes

4) Test the integration in a non-production environment:
   - Create a KYC session, upload selfie and document, then call `GET /api/kyc/status/:id`
   - If Rekognition is configured, the code will try to call it and update the status accordingly

Notes and recommendations:
- For document images it may be necessary to detect/extract the face region before CompareFaces, or use a partner KYC provider which handles document parsing
- Think about privacy: limit retention of images, use signed URLs or short-lived storage, and inform users
- For ambiguous scores (e.g. 60-80%), consider marking as PENDING and trigger manual review

If you want, I can add automated tests or a sample script showing a real Rekognition call once you have AWS credentials ready.