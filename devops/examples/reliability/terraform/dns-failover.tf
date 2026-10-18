# Route 53 failover: send users to the primary region while it is healthy,
# and to the DR region automatically when the health check fails.

resource "aws_route53_health_check" "primary" {
  fqdn              = var.primary_endpoint
  type              = "HTTPS"
  port              = 443
  resource_path     = "/healthz"
  failure_threshold = 3  # 3 failed checks…
  request_interval  = 10 # …10 seconds apart ⇒ ~30 s to detect
}

resource "aws_route53_record" "primary" {
  zone_id         = var.domain_zone_id
  name            = "notes"
  type            = "CNAME"
  ttl             = 60 # short TTL so clients pick up the change quickly
  records         = [var.primary_endpoint]
  set_identifier  = "primary"
  health_check_id = aws_route53_health_check.primary.id

  failover_routing_policy {
    type = "PRIMARY"
  }
}

resource "aws_route53_record" "secondary" {
  zone_id        = var.domain_zone_id
  name           = "notes"
  type           = "CNAME"
  ttl            = 60
  records        = [var.dr_endpoint]
  set_identifier = "secondary"

  failover_routing_policy {
    type = "SECONDARY"
  }
}
