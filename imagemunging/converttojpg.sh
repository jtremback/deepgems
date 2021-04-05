#!/bin/bash
# set -eux

cp -rf ~/projects/deep_gems_art/gempundit_cropped_clean_full/ ~/projects/deep_gems_art/gempundit_cropped_clean_full_jpg

for file in ~/projects/deep_gems_art/gempundit_cropped_clean_full_jpg/*
do
  echo "$file"
  convert "$file" "${file%.*.*.*}.jpg"
done

# -background "hsb($hue, 25%, 25%)" 