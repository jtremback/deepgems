#!/bin/bash
# set -eux

cp -rf ~/projects/gems_processed/ ~/projects/gems_processed_jpg

for file in ~/projects/gems_processed_jpg/*
do
  echo "$file"
  convert "$file" "${file%.*.*.*}.jpg"
done

# -background "hsb($hue, 25%, 25%)" 