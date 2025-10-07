resource "aws_security_group" "pern_sg" {
  name        = "${var.project_name}-sg"
  description = "Allow app, monitoring, ssh, web"
  vpc_id      = data.aws_vpc.default.id

  # Inbound
  dynamic "ingress" {
    for_each = [
      { from = 22, to = 22, proto = "tcp", cidr = var.allow_ssh_cidr }, # SSH
      { from = 80, to = 80, proto = "tcp", cidr = "0.0.0.0/0" },        # HTTP
      { from = 443, to = 443, proto = "tcp", cidr = "0.0.0.0/0" },      # HTTPS
      { from = 3000, to = 3000, proto = "tcp", cidr = "0.0.0.0/0" },    # Frontend
      { from = 9000, to = 9000, proto = "tcp", cidr = "0.0.0.0/0" },    # Backend
      { from = 5432, to = 5432, proto = "tcp", cidr = "0.0.0.0/0" },    # Postgres (tighten later)
      { from = 9090, to = 9090, proto = "tcp", cidr = "0.0.0.0/0" },    # Prometheus
      { from = 3001, to = 3001, proto = "tcp", cidr = "0.0.0.0/0" },    # Grafana
    ]
    content {
      from_port   = ingress.value.from
      to_port     = ingress.value.to
      protocol    = ingress.value.proto
      cidr_blocks = [ingress.value.cidr]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-sg" }
}
