#!/bin/bash
# Runs on the production server via: ssh user@host 'bash -s' < this-file
docker compose -f /opt/basa-app/docker-compose.prod.yml ps
curl -f https://app.businessassociationsa.com/api/health || echo "Health check endpoint not responding"
