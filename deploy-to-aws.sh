#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

source ./deployment.cfg

if [ -z "$SERVER_AUTH" ]
then
	echo "I cannot deploy without a SERVER_AUTH"
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

sudo_rsync -ai --delete ./deployment_scripts/ "${SERVER_AUTH}:/root/deployment_scripts" "$@"

sudo_rsync -ai --delete ./packages/d2l-website/ "${SERVER_AUTH}:/usr/share/nginx/html" "$@"

ssh "${SERVER_AUTH}" sudo bash /root/deployment_scripts/set_up_new_deployment.sh
