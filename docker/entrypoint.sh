#!/bin/sh
set -eu

PORT_VALUE="${PORT:-8080}"

if [ ! -f /etc/nginx/templates/default.conf.template ]; then
  echo "Missing Nginx template: /etc/nginx/templates/default.conf.template" >&2
  exit 1
fi

# Render runtime PORT into the active Nginx server configuration.
sed "s/__PORT__/${PORT_VALUE}/g" \
  /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
