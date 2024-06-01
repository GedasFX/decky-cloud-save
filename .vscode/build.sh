#!/usr/bin/env bash
CLI_LOCATION="$(pwd)/cli"
echo "Building plugin in $(pwd)"
printf "Please input sudo password to proceed.\n"

# read -s sudopass

# printf "\n"

# rm backend/rclone-

rm -r $(pwd)/out/*
echo $sudopass | sudo $CLI_LOCATION/decky plugin build $(pwd)
mv $(pwd)/out/Decky\ Cloud\ Save.zip out/decky-cloud-save.zip