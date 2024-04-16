#!/bin/sh
set -e

cd /backend

wget https://downloads.rclone.org/v1.66.0/rclone-v1.66.0-linux-amd64.zip

checksum=$(md5sum rclone-v1.66.0-linux-amd64.zip)
[ "$checksum" != "59a19a5f31c258aacf99970ae7d028cd  rclone-v1.66.0-linux-amd64.zip" ] && exit 1

unzip rclone-v1.66.0-linux-amd64.zip

mkdir -p out
mv rclone-v1.66.0-linux-amd64/rclone out/
