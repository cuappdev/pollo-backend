#!/bin/bash
# To build, do `./run.sh`.
# To build and watch, run `./run.sh watch`

child_processes=();

control_c() {
  for pid in "${child_processes[@]}"; do
    kill $pid;
  done
  exit;
}

trap control_c SIGINT

build() {
  webpack;
  gulp scripts;
}

watch() {
  # Build once first, and then watch afterwards.:
  gulp scripts;
  gulp &
  child_processes+=($!);
  npm run dev;
}

if [ "$1" == "watch" ]; then
  watch;
else
  build;
fi
