#!/bin/sh

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

  # Check if USERNAME, PASSWORD, and AUTH_TYPE are set
  if [ -n "$USERNAME" ] && [ -n "$PASSWORD" ] && [ -n "$AUTH_TYPE" ]; then
    # Update the existing config.json with USERNAME, PASSWORD, and AUTH_TYPE
    jq --arg username "$USERNAME" \
       --arg password "$PASSWORD" \
       --arg auth_type "$AUTH_TYPE" \
       '.username = $username | .password = $password | .auth_type = $auth_type' \
       $CONFIG_FILE > tmp_file && mv tmp_file $CONFIG_FILE
    echo "Updated config.json with USERNAME, PASSWORD, and AUTH_TYPE"
  else
    # Output an error if USERNAME, PASSWORD, or AUTH_TYPE is missing
    echo "Error: USERNAME, PASSWORD, and AUTH_TYPE must be set"
  fi
else
  # Create config.json if KONG_ADMIN_URL and all other variables are set
  if [ -n "$KONG_ADMIN_URL" ] && [ -n "$USERNAME" ] && [ -n "$PASSWORD" ] && [ -n "$AUTH_TYPE" ]; then
    # Create a new config.json with all variables
    echo '{ "kong_admin_url": "'"$KONG_ADMIN_URL"'", "username": "'"$USERNAME"'", "password": "'"$PASSWORD"'", "auth_type": "'"$AUTH_TYPE"'" }' > $CONFIG_FILE
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