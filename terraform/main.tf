terraform {
  required_version = ">= 1.14.0"
  
  cloud {}
  
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
    neon = {
      source  = "kislerdm/neon"
      version = "~> 0.6"
    }
  }
}

provider "vercel" {
  api_token = var.vercel_api_token
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

provider "neon" {
  api_key = var.neon_api_key
}

# Vercel Project
resource "vercel_project" "nosoup" {
  name      = var.vercel_project_name
  framework = "nextjs"
}

# Neon Postgres Database
resource "neon_project" "nosoup_db" {
  org_id             = var.neon_org_id
  name               = var.neon_project_name
  region_id          = var.neon_region
  pg_version         = 16
  compute_provisioner = "k8s-pod"
  history_retention = 21600  # max 6 hours for free tier

  lifecycle {
    prevent_destroy = false  # Set to true in production to prevent accidental deletion
  }
}

resource "neon_branch" "main" {
  project_id = neon_project.nosoup_db.id
  name       = "main"
}

resource "neon_database" "nosoup" {
  project_id = neon_project.nosoup_db.id
  branch_id  = neon_branch.main.id
  name       = var.database_name
  owner_name = neon_project.nosoup_db.database_user
}

resource "neon_endpoint" "nosoup" {
  project_id = neon_project.nosoup_db.id
  branch_id  = neon_branch.main.id
  type       = "read_write"
}

locals {
  database_url = "postgresql://${neon_project.nosoup_db.database_user}:${neon_project.nosoup_db.database_password}@${neon_endpoint.nosoup.host}/nosoup?sslmode=require"
}

# Cloudflare R2 Bucket for file storage
resource "cloudflare_r2_bucket" "nosoup_uploads" {
  account_id = var.cloudflare_account_id
  name       = var.r2_bucket_name
  location   = var.r2_bucket_location
}

# Note: CORS configuration for R2 must be set via Cloudflare dashboard or API
# Navigate to R2 > Your Bucket > Settings > CORS Policy
# Add policy: Allow origins: *, Methods: GET, HEAD

# Enable R2.dev public access subdomain
resource "terraform_data" "enable_r2_public_access" {
  input = {
    account_id  = var.cloudflare_account_id
    bucket_name = cloudflare_r2_bucket.nosoup_uploads.name
    api_token   = var.cloudflare_api_token
  }

  provisioner "local-exec" {
    command = <<-EOT
      curl -X POST "https://api.cloudflare.com/client/v4/accounts/${self.input.account_id}/r2/buckets/${self.input.bucket_name}/public" \
        -H "Authorization: Bearer ${self.input.api_token}" \
        -H "Content-Type: application/json" \
        -d '{"enabled": true}'
    EOT
  }

  provisioner "local-exec" {
    when    = destroy
    command = <<-EOT
      curl -X POST "https://api.cloudflare.com/client/v4/accounts/${self.input.account_id}/r2/buckets/${self.input.bucket_name}/public" \
        -H "Authorization: Bearer ${self.input.api_token}" \
        -H "Content-Type: application/json" \
        -d '{"enabled": false}'
    EOT
  }
}

# Environment Variables for Vercel Project
resource "vercel_project_environment_variable" "database_url" {
  project_id = vercel_project.nosoup.id
  key        = "DATABASE_URL"
  value      = local.database_url
  target     = ["production", "preview"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "nextauth_url" {
  project_id = vercel_project.nosoup.id
  key        = "NEXTAUTH_URL"
  value      = var.nextauth_url
  target     = ["production", "preview", "development"]
}

resource "vercel_project_environment_variable" "nextauth_secret" {
  project_id = vercel_project.nosoup.id
  key        = "NEXTAUTH_SECRET"
  value      = var.nextauth_secret
  target     = ["production", "preview"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "r2_account_id" {
  project_id = vercel_project.nosoup.id
  key        = "R2_ACCOUNT_ID"
  value      = var.cloudflare_account_id
  target     = ["production", "preview", "development"]
}

resource "vercel_project_environment_variable" "r2_access_key_id" {
  project_id = vercel_project.nosoup.id
  key        = "R2_ACCESS_KEY_ID"
  value      = var.r2_access_key_id
  target     = ["production", "preview"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "r2_secret_access_key" {
  project_id = vercel_project.nosoup.id
  key        = "R2_SECRET_ACCESS_KEY"
  value      = var.r2_secret_access_key
  target     = ["production", "preview"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "r2_bucket_name" {
  project_id = vercel_project.nosoup.id
  key        = "R2_BUCKET_NAME"
  value      = cloudflare_r2_bucket.nosoup_uploads.name
  target     = ["production", "preview", "development"]
}

resource "vercel_project_environment_variable" "r2_use_r2" {
  project_id = vercel_project.nosoup.id
  key        = "R2_USE_R2"
  value      = "true"
  target     = ["production", "preview", "development"]
}
