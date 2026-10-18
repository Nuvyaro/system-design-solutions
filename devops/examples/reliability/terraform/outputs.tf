output "backup_bucket_primary" {
  value = aws_s3_bucket.backups.bucket
}

output "backup_bucket_dr" {
  value = aws_s3_bucket.backups_dr.bucket
}

output "primary_health_check_id" {
  value = aws_route53_health_check.primary.id
}
