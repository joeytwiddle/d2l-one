#!/usr/bin/env bash
set -e

# This script is run as root on the server

if ! which tmux >/dev/null 2>&1
then
	yum install -y tmux nmap
fi

if ! which atop >/dev/null 2>&1
then
	amazon-linux-extras install epel -y
	yum install -y atop
	systemctl enable atop
	systemctl start atop
fi

if ! which nginx >/dev/null 2>&1
then
	yum install -y nginx
	systemctl enable nginx
	systemctl start nginx
fi

# Node on system is often not up-to-date, so we use nvm inside the user instead
#if ! which node >/dev/null 2>&1
#then
#	yum install -y nodejs
#fi

if [ ! -d "/home/${NODE_USER}" ]
then
	useradd -m "$NODE_USER"
fi
