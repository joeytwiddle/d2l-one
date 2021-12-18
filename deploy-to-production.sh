#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

# Load the config file, and check the neccessary variables have been defined
if [ ! -f deployment.cfg ]
then
	echo "File deployment.cfg is missing"
	exit 1
fi

source ./deployment.cfg

if [ -z "$SERVER_AUTH" ]
then
	echo "I cannot deploy without a SERVER_AUTH"
	exit 1
fi

if [ -z "$NODE_USER" ]
then
	echo "I cannot deploy without a NODE_USER"
	exit 1
fi

if [ -n "$START_FRESH_SSH_AGENT" ]
then
	# I now have too many keys in my ssh-agent, which causes login attempts to fail with "Too many authentication failures" after a few keys are attempted
	# So we will disable the existing ssh-agent, start a new one, and then specify the key we want to use
	unset SSH_AUTH_SOCK
	eval "$(ssh-agent)"
fi

if [ -n "$SSH_KEY" ]
then ssh-add "$SSH_KEY"
fi

sudo_rsync() {
	rsync --rsync-path="sudo rsync" "$@"
}

# Send the deplyment scripts that will be run remotely
sudo_rsync -ai --delete ./deployment_scripts/ "${SERVER_AUTH}:/root/deployment_scripts" "$@"

# Install necessary packages, and create a non-root account for the API server
ssh "${SERVER_AUTH}" sudo env NODE_USER="$NODE_USER" bash /root/deployment_scripts/set_up_new_deployment_1.sh

# The website
# This assumes the default nginx install shares files from this folder (was true for CentOS)
#
# This version only sends the files/folders that are present on local, and only removes things that are missing below them
# This allows you to drop extra files in the remote folder, which will not be removed here
# However if you do remove something from the root folder on local, then you will have to manually remove it from the remote
#
sudo_rsync -ai --delete ./packages/d2l-website/* "${SERVER_AUTH}:/usr/share/nginx/html/" "$@"
echo "### List of unexpected files on remote:"
sudo_rsync -ain --delete --omit-dir-times --exclude='/app' ./packages/d2l-website/ "${SERVER_AUTH}:/usr/share/nginx/html" "$@"
echo "### End of unexpected files"
#
# This version sends the entire local folder, and delete anything not present below it, except for the /app folder which it ignores
# If you drop a file in the remote folder manually, this script will delete it!
#
#sudo_rsync -ainv --delete --exclude='/app' ./packages/d2l-website/ "${SERVER_AUTH}:/usr/share/nginx/html" "$@"

# The web app
sudo_rsync -ai --delete ./packages/d2l-expo/web-build/ "${SERVER_AUTH}:/usr/share/nginx/html/app" "$@"

# Nginx configuration
sudo_rsync -ai ./deployment_scripts/etc/nginx/default.d/d2l-api.conf "${SERVER_AUTH}:/etc/nginx/default.d/" "$@"

# The API server
sudo_rsync -ai --delete --exclude=node_modules --exclude=sessions --no-owner --no-group ./packages/d2l-api/ "${SERVER_AUTH}:/home/${NODE_USER}/d2l-api" "$@"
# I could not get `--chown "$NODE_USER:$NODE_USER"` to work, so instead the set_up_new_deployment_2.sh script will chown the files

# Log in and restart the servers with the new code/config
ssh "${SERVER_AUTH}" sudo env NODE_USER="$NODE_USER" bash /root/deployment_scripts/set_up_new_deployment_2.sh
