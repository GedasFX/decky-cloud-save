#!/bin/sh
set -e

cd /backend

wget https://downloads.rclone.org/v1.61.1/rclone-v1.61.1-linux-amd64.zip

checksum=$(md5sum rclone-v1.61.1-linux-amd64.zip)
[ "$checksum" != "3d6893531ec9f2f1ed89ef9fe38dc468  rclone-v1.61.1-linux-amd64.zip" ] && exit 1

unzip rclone-v1.61.1-linux-amd64.zip

mkdir -p out
mv rclone-v1.61.1-linux-amd64/rclone out/