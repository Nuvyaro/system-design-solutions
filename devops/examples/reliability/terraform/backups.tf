# Backup bucket in the primary region, replicated to the DR region.
# Versioning + Object Lock protect backups from accidental deletion and ransomware.

resource "aws_s3_bucket" "backups" {
  bucket              = "${var.app_name}-backups-${var.primary_region}"
  object_lock_enabled = true
}

resource "aws_s3_bucket_versioning" "backups" {
  bucket = aws_s3_bucket.backups.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_object_lock_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id
  rule {
    default_retention {
      mode = "COMPLIANCE" # nobody, including admins, can delete locked versions early
      days = var.backup_retention_days
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id
  rule {
    id     = "tier-and-expire"
    status = "Enabled"
    filter {}
    transition {
      days          = 7
      storage_class = "GLACIER_IR"
    }
    noncurrent_version_expiration {
      noncurrent_days = var.backup_retention_days + 1
    }
  }
}

resource "aws_s3_bucket_public_access_block" "backups" {
  bucket                  = aws_s3_bucket.backups.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Replica bucket in the DR region
resource "aws_s3_bucket" "backups_dr" {
  provider            = aws.dr
  bucket              = "${var.app_name}-backups-${var.dr_region}"
  object_lock_enabled = true
}

resource "aws_s3_bucket_versioning" "backups_dr" {
  provider = aws.dr
  bucket   = aws_s3_bucket.backups_dr.id
  versioning_configuration {
    status = "Enabled"
  }
}

# IAM role that S3 assumes to copy objects across regions
data "aws_iam_policy_document" "replication_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["s3.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "replication" {
  name               = "${var.app_name}-backup-replication"
  assume_role_policy = data.aws_iam_policy_document.replication_assume.json
}

data "aws_iam_policy_document" "replication" {
  statement {
    actions   = ["s3:GetReplicationConfiguration", "s3:ListBucket"]
    resources = [aws_s3_bucket.backups.arn]
  }
  statement {
    actions   = ["s3:GetObjectVersionForReplication", "s3:GetObjectVersionAcl", "s3:GetObjectVersionTagging", "s3:GetObjectRetention", "s3:GetObjectLegalHold"]
    resources = ["${aws_s3_bucket.backups.arn}/*"]
  }
  statement {
    actions   = ["s3:ReplicateObject", "s3:ReplicateDelete", "s3:ReplicateTags", "s3:ObjectOwnerOverrideToBucketOwner"]
    resources = ["${aws_s3_bucket.backups_dr.arn}/*"]
  }
}

resource "aws_iam_role_policy" "replication" {
  name   = "replication"
  role   = aws_iam_role.replication.id
  policy = data.aws_iam_policy_document.replication.json
}

resource "aws_s3_bucket_replication_configuration" "backups" {
  depends_on = [aws_s3_bucket_versioning.backups, aws_s3_bucket_versioning.backups_dr]
  bucket     = aws_s3_bucket.backups.id
  role       = aws_iam_role.replication.arn

  rule {
    id     = "to-dr-region"
    status = "Enabled"
    filter {}
    delete_marker_replication {
      status = "Disabled" # deleting in the primary must not delete the DR copy
    }
    destination {
      bucket        = aws_s3_bucket.backups_dr.arn
      storage_class = "STANDARD_IA"
    }
  }
}
