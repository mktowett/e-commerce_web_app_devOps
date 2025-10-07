# Terraform — PERN DevOps Infra (Phase 2)
- Default VPC, 1× Ubuntu 22.04 EC2 (t2.medium), security group for app/monitoring, S3 artifacts bucket.
- After `apply`, SSH: `ssh -i ~/.ssh/YOUR_KEY.pem ubuntu@$(terraform output -raw ec2_public_ip)`.
