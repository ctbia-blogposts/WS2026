#!/bin/bash
set -euo pipefail

CONFIG_FILE=_config.yml
DOCKER_DESTINATION=/tmp/_site
jekyll_pid=""

ensure_bundle_deps() {
    if ! bundle check >/dev/null 2>&1; then
        bundle install --jobs 4 --retry 3
    fi
}

stop_jekyll() {
    if [ -n "$jekyll_pid" ]; then
        kill -TERM "$jekyll_pid" 2>/dev/null || true
        wait "$jekyll_pid" 2>/dev/null || true
        jekyll_pid=""
    fi
}

start_jekyll() {
    ensure_bundle_deps
    mkdir -p "$DOCKER_DESTINATION"
    bundle exec jekyll serve --watch --port=8080 --host=0.0.0.0 --livereload --trace --force_polling --destination "$DOCKER_DESTINATION" --config "$CONFIG_FILE" &
    jekyll_pid=$!
}

trap stop_jekyll EXIT
trap 'exit 0' TERM INT
start_jekyll

while inotifywait -q -e modify,move_self,delete_self "$CONFIG_FILE"; do
    echo "Configuration changed; restarting Jekyll"
    stop_jekyll
    start_jekyll
done
