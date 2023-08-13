#!/bin/sh

# Environment vars you can setup
# KONG_ADMIN_URL - Url to the Kong admin api
# AUTH_TYPE - If Kong's admin api requires sending an Authorization header, it defines the type of the header (valid values: Baisc or Bearer).
# AUTH_TOKEN - Base64 Token to send in the Authorization header if needed. The token is calculated as base64(username:password).

CONFIG_FILE="/usr/share/nginx/html/config.json"

# Check if config.json exists
if [ -f "$CONFIG_FILE" ]; then
  # Check if KONG_ADMIN_URL is set
  if [ -n "$KONG_ADMIN_URL" ]; then
    # Update the existing config.json with KONG_ADMIN_URL only
    jq --arg kong_admin_url "$KONG_ADMIN_URL" \
       '.kong_admin_url = $kong_admin_url' \
       $CONFIG_FILE > tmp_file && mv tmp_file $CONFIG_FILE
    echo "Updated config.json with KONG_ADMIN_URL"
  fi

  # Check if USERNAME, and AUTH_TYPE are set
  if [ -n "$AUTH_TOKEN" ] && [ -n "$AUTH_TYPE" ]; then
    # Update the existing config.json with USERNAME, and AUTH_TYPE
    jq --arg auth_token "$AUTH_TOKEN" \
       --arg auth_type "$AUTH_TYPE" \
       '.auth_token = $auth_token | .auth_type = $auth_type' \
       $CONFIG_FILE > tmp_file && mv tmp_file $CONFIG_FILE
    echo "Updated config.json with USERNAME and AUTH_TYPE"
  else
    # Output an error if USERNAME, or AUTH_TYPE is missing
    echo "Error: USERNAME and AUTH_TYPE must be set"
  fi
else
  # Create config.json if KONG_ADMIN_URL and all other variables are set
  if [ -n "$KONG_ADMIN_URL" ] && [ -n "$AUTH_TOKEN" ] && [ -n "$PASSWORD" ] && [ -n "$AUTH_TYPE" ]; then
    # Create a new config.json with all variables
    echo '{ "kong_admin_url": "'"$KONG_ADMIN_URL"'", "kong_admin_authorization": "'"$AUTH_TYPE"' '"$AUTH_TOKEN"'" }' > $CONFIG_FILE
    echo "Created config.json with all variables"
  elif [ -n "$KONG_ADMIN_URL" ]; then
    # Create a new config.json with KONG_ADMIN_URL only
    echo '{ "kong_admin_url": "'"$KONG_ADMIN_URL"'" }' > $CONFIG_FILE
    echo "Created config.json with KONG_ADMIN_URL"
  else
    echo "Nothing to do, starting nginx"
  fi
fi

# Start the web server
exec "$@"
