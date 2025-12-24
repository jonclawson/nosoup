output "vercel_project_id" {
  description = "ID of the Vercel project"
  value       = vercel_project.nosoup.id
}

output "vercel_project_name" {
  description = "Name of the Vercel project"
  value       = vercel_project.nosoup.name
}

output "neon_project_id" {
  description = "ID of the Neon project"
  value       = neon_project.nosoup_db.id
}

output "database_url" {
  description = "Neon database connection string"
  value       = local.database_url
  sensitive   = true
}

output "r2_bucket_name" {
  description = "Name of the R2 bucket"
  value       = cloudflare_r2_bucket.nosoup_uploads.name
}

output "r2_public_url" {
  description = "Public URL for R2 bucket (R2.dev subdomain)"
  value       = "https://pub-${cloudflare_r2_bucket.nosoup_uploads.id}.r2.dev"
}

output "deployment_url" {
  description = "URL of the Vercel deployment"
  value       = "https://${vercel_project.nosoup.name}.vercel.app"
}

output "bucket_dev_url" {
  description = "The public r2.dev development URL for the bucket"
  value       = "https://${cloudflare_r2_managed_domain.dev_url.domain}"
}