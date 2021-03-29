#!/bin/bash

# for file in ~/projects/gempundit_cropped_dirty/*
# do
#   convert "$file" -border 3 -bordercolor "rgba(0,0,0,0)" -background "white" -flatten -fuzz 0% -fill gray25 -draw "color +0+0 floodfill" "$file"
# done

for file in ~/projects/gempundit_cropped_dirty/*
do
  convert "$file" -background "gray25" -flatten "$file"
done