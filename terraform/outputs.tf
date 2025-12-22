output "vercel_project_id" {
  description = "ID of the Vercel project"
  value       = vercel_project.nosoup.id
}

output "vercel_project_name" {
  description = "Name of the Vercel project"
  value       = vercel_project.nosoup.name
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
