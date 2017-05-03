#!/bin/bash
# To build, do `./build.sh`.
# To build and watch, run `./build.sh watch`

child_processes=();

control_c() {
  for pid in "${child_processes[@]}"; do
    kill $pid;
  done
  exit;
}

trap control_c SIGINT

build() {
  webpack &
  child_processes+=($!);
  gulp scripts &
  child_processes+=($!);
}

watch() {
  # Build once first, and then watch afterwards.:
  gulp &
  child_processes+=($!);
  webpack --watch &
  child_processes+=($!);  
}

if [ "$1" == "--watch" ]; then
  watch;
else
  build;
fi

for pid in "${child_processes[@]}"; do
  wait $pid;
done
