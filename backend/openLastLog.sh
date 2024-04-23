#!/usr/bin/env bash

clear && tail -f ~/homebrew/logs/decky-cloud-save/"$(ls -Art ~/homebrew/logs/decky-cloud-save | tail -n 1)"
