#!/bin/sh

if [ -z "${TUNEQUEST_CREATE_URL}" ]; then
  echo "ERROR: TUNEQUEST_CREATE_URL not set"
  exit 1
fi

sed -i "s,/REPLACEME_CREATE_URL,${TUNEQUEST_CREATE_URL}," /app/.next/server/pages/index.html

/usr/local/bin/docker-entrypoint.sh.orig "$@"
