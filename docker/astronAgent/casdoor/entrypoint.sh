#!/bin/sh
set -e

chmod -R 777 /conf 2>/dev/null || true

echo "===== Initializing Casdoor Configuration ====="
echo "CONSOLE_DOMAIN: ${CONSOLE_DOMAIN:-http://localhost}"
echo "HOST_BASE_ADDRESS: ${HOST_BASE_ADDRESS:-http://localhost}"

# Generate config from template using sed (replace all environment variables)
echo "Generating init_data.json from template..."
sed -e "s|\${CONSOLE_DOMAIN}|${CONSOLE_DOMAIN}|g" \
    -e "s|\${HOST_BASE_ADDRESS}|${HOST_BASE_ADDRESS}|g" \
    /conf/init_data.json.template > /conf/init_data.json

echo "Configuration updated successfully!"
echo "redirectUris: [${CONSOLE_DOMAIN}/callback, ${HOST_BASE_ADDRESS}/callback]"
echo "=========================================="

# Start Casdoor
exec /server --createDatabase=true