#!/bin/bash
# set -eux

cp -rf ~/projects/deep_gems_art/gempundit_cropped_clean_full/ ~/projects/deep_gems_art/gems_processed_4

for file in ~/projects/deep_gems_art/gems_processed_4/*
do
  echo "$file"
  # first, get average hue of image
  hue=$(convert "$file" -colorspace hsi -resize 1x1 txt:- | rg -o "hsia\((\d*)" -r '$1' --color never)
  color="hsb($(((hue + 0) % 360)), 15%, 25%)"
  # Fill it with the color, shrink and sharpen
  convert "$file" -background "$color" -flatten -filter Lanczos -resize 216x216 -gravity center -extent 216x216 -bordercolor "$color" -border 20 -sharpen 0x2.5 "${file%.*.*.*}.jpg"
  rm "$file"
done
