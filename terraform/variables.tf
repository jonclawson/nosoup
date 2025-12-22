variable "vercel_api_token" {
  description = "Vercel API token"
  type        = string
  sensitive   = true
}

variable "vercel_project_name" {
  description = "Name of the Vercel project"
  type        = string
  default     = "nosoup"
}

variable "database_url" {
  description = "Postgres database connection string (create database in Vercel dashboard first)"
  type        = string
  sensitive   = true
}

variable "nextauth_url" {
  description = "NextAuth URL for authentication"
  type        = string
}

variable "nextauth_secret" {
  description = "NextAuth secret for authentication"
  type        = string
  sensitive   = true
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "r2_bucket_name" {
  description = "Name of the R2 bucket for uploads"
  type        = string
  default     = "nosoup-uploads"
}

variable "r2_bucket_location" {
  description = "Location for R2 bucket"
  type        = string
  default     = "WNAM"
}

variable "r2_access_key_id" {
  description = "R2 access key ID"
  type        = string
  sensitive   = true
}

variable "r2_secret_access_key" {
  description = "R2 secret access key"
  type        = string
  sensitive   = true
}
