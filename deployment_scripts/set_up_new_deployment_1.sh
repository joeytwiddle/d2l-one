#!/usr/bin/env bash
set -e

# This script is run as root

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
