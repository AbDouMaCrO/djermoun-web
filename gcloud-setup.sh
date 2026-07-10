#!/bin/bash
# Google Cloud Run Jobs setup for djermoun auto-scraper
# Free tier: 240,000 vCPU-seconds/month + 3 Cloud Scheduler jobs free
#
# BEFORE RUNNING:
#   1. Install gcloud CLI: https://cloud.google.com/sdk/docs/install
#   2. Run: gcloud auth login
#   3. Fill in the three variables below

PROJECT_ID="YOUR_PROJECT_ID"       # e.g. djermoun-auto-123456
SUPABASE_URL="YOUR_SUPABASE_URL"   # from Supabase project settings
SUPABASE_KEY="YOUR_SUPABASE_KEY"   # service role key

# ── derived values (no need to change) ──────────────────────────────────────
REGION="us-central1"
REPO="djermoun-scraper"
IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/auto-scraper"

set -e

echo "==> Setting project"
gcloud config set project "$PROJECT_ID"

echo "==> Enabling APIs"
gcloud services enable \
  run.googleapis.com \
  cloudscheduler.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com

echo "==> Creating Artifact Registry repository"
gcloud artifacts repositories create "$REPO" \
  --repository-format=docker \
  --location="$REGION" 2>/dev/null || echo "Repository already exists, continuing..."

echo "==> Building and pushing Docker image"
gcloud builds submit \
  --tag "$IMAGE" \
  python-scraper/

echo "==> Creating Cloud Run Job"
gcloud run jobs create auto-scraper \
  --image "$IMAGE" \
  --region "$REGION" \
  --set-env-vars "SUPABASE_URL=$SUPABASE_URL,SUPABASE_KEY=$SUPABASE_KEY" \
  --max-retries 1 \
  --task-timeout 300

echo "==> Getting service account for scheduler"
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")
SA="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

echo "==> Granting scheduler permission to invoke job"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SA" \
  --role="roles/run.invoker"

echo "==> Creating Cloud Scheduler trigger (hourly)"
gcloud scheduler jobs create http auto-scraper-trigger \
  --location "$REGION" \
  --schedule "0 * * * *" \
  --uri "https://$REGION-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/$PROJECT_ID/jobs/auto-scraper:run" \
  --message-body "" \
  --oauth-service-account-email "$SA" \
  --oauth-token-scope "https://www.googleapis.com/auth/cloud-platform"

echo ""
echo "✓ Done. Scraper runs every hour via Cloud Scheduler -> Cloud Run Job."
echo "  Monitor: https://console.cloud.google.com/run/jobs?project=$PROJECT_ID"
