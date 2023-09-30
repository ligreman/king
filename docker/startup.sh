#!/bin/sh

# Environment vars you can setup
# KONG_ADMIN_URL - Url to the Kong admin api
# AUTH_METHOD - If Kong's admin api requires sending an Authorization header, it defines how it is sent (valid values: header, query, body).
# AUTH_FIELD - The name of the field/param where the token will be sent using the method selected. Eg: Authorization (if sent in header).
# AUTH_TOKEN - Token to send. Must include the "Basic" or "Bearer" part. Eg: "Basic dXNlcm5hbWU6cGFzc3dvcmQ=". Note: for Basic, the token is calculated as base64(username:password).

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

  # Check if AUTH_TOKEN, and AUTH_METHOD, and AUTH_FIELD are set
  if [ -n "$AUTH_TOKEN" ] && [ -n "$AUTH_METHOD" ] && [ -n "$AUTH_FIELD" ]; then
    # Update the existing config.json with AUTH_TOKEN, and AUTH_METHOD
    jq --arg auth_token "$AUTH_TOKEN" \
       --arg auth_method "$AUTH_METHOD" \
       --arg auth_field "$AUTH_FIELD" \
       '.auth_token = $auth_token | .auth_method = $auth_method | .auth_field = $auth_field' \
       $CONFIG_FILE > tmp_file && mv tmp_file $CONFIG_FILE
    echo "Updated config.json with AUTH_TOKEN, AUTH_METHOD and AUTH_FIELD"
  else
    # Output an error if AUTH_TOKEN, AUTH_FIELD, or AUTH_METHOD is missing
    echo "Error: AUTH_TOKEN, AUTH_FIELD and AUTH_METHOD must be set"
  fi
else
  # Create config.json if KONG_ADMIN_URL and all other variables are set
  if [ -n "$KONG_ADMIN_URL" ] && [ -n "$AUTH_TOKEN" ] && [ -n "$AUTH_FIELD" ] && [ -n "$AUTH_METHOD" ]; then
    # Create a new config.json with all variables
    echo '{ "kong_admin_url": "'"$KONG_ADMIN_URL"'", "kong_admin_authorization_method": "'"$AUTH_METHOD"'", "kong_admin_authorization_field": '"$AUTH_FIELD"'", "kong_admin_authorization_token": '"$AUTH_TOKEN"'" }' > $CONFIG_FILE
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
