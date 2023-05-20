#!/bin/sh
#Generates the debug info seen on the home page
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
COMMIT="$(git rev-parse HEAD)"
DATE="$(date -Isecond)"

echo "VITE_BRANCH=\"$BRANCH\"" > .env
echo "VITE_COMMIT=\"$COMMIT\"" >> .env
echo "VITE_DATE=\"$DATE\"" >> .env