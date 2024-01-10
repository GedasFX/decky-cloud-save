#!/bin/sh
set -e

cd /backend

wget https://downloads.rclone.org/v1.65.1/rclone-v1.65.1-linux-amd64.zip

checksum=$(md5sum rclone-v1.65.1-linux-amd64.zip)
[ "$checksum" != "d5585f0e81fdeeceb5a4277a4720ed99  rclone-v1.65.1-linux-amd64.zip" ] && exit 1

unzip rclone-v1.65.1-linux-amd64.zip

mkdir -p out
mv rclone-v1.65.1-linux-amd64/rclone out/
