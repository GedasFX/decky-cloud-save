#!/bin/sh
set -e

cd /backend

wget -nc https://downloads.rclone.org/v1.68.1/rclone-v1.68.1-linux-amd64.zip

checksum=$(md5sum rclone-v1.68.1-linux-amd64.zip)
[ "$checksum" != "fff0fd5fdf25dd4a25e9464c3b1c7254  rclone-v1.68.1-linux-amd64.zip" ] && exit 1

unzip -n rclone-v1.68.1-linux-amd64.zip

mkdir -p out
mv rclone-v1.68.1-linux-amd64/rclone out/

cp rcloneLauncher out/
cp openLastLog.sh out/
chmod 755 out/rcloneLauncher out/openLastLog.sh
