#!/bin/sh
set -e

CONFIG_PATH="/usr/share/nginx/html/env-config.js"
ADMIN_USER_VALUE=${VITE_ADMIN_USERNAME:-admin}
ADMIN_PASS_VALUE=${VITE_ADMIN_PASSWORD:-trivia}

escape_js_string() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

USER_ESCAPED=$(escape_js_string "$ADMIN_USER_VALUE")
PASS_ESCAPED=$(escape_js_string "$ADMIN_PASS_VALUE")

cat > "$CONFIG_PATH" <<EOF
window.__TRIVIA_CONFIG__ = {
  VITE_ADMIN_USERNAME: "${USER_ESCAPED}",
  VITE_ADMIN_PASSWORD: "${PASS_ESCAPED}"
};
EOF

exec "$@"
