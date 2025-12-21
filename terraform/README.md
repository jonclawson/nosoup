# Terraform Configuration for Cloudflare

This directory contains Terraform configuration to provision:
- Cloudflare D1 Database
- Cloudflare R2 Bucket (for file uploads)
- Cloudflare Pages Project

## Setup

1. Copy the example variables file:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. Edit `terraform.tfvars` with your Cloudflare credentials:
   - Get your API token from: https://dash.cloudflare.com/profile/api-tokens
   - Get your Account ID from: https://dash.cloudflare.com/ (right sidebar)

3. Initialize Terraform:
   ```bash
   terraform init
   ```

4. Review the plan:
   ```bash
   terraform plan
   ```

5. Apply the configuration:
   ```bash
   terraform apply
   ```

## GitHub Secrets Required

For the GitHub Actions workflow to work, add these secrets to your repository:
- `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
- `NEXTAUTH_SECRET` - Your NextAuth secret key
- `NEXTAUTH_URL` - Your production URL (e.g., https://nosoup.pages.dev)

## Outputs

After applying, Terraform will output:
- `d1_database_id` - ID of the created D1 database
- `r2_bucket_name` - Name of the R2 bucket
- `pages_project_name` - Name of the Pages project
- `pages_url` - URL of your deployed application
