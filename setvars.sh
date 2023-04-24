#!/bin/sh
#Generates the debug info seen on the home page
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
COMMIT="$(git rev-parse HEAD)"
DATE="$(date -Isecond)"

# echo "VUE_APP_BRANCH=\"$(git rev-parse --abbrev-ref HEAD)\"" > .env
# echo "VUE_APP_COMMIT=\"$(git rev-parse HEAD)\"">>.env
# echo "VUE_APP_DATE=\"$(date -Isecond)\"">>.env

echo "VUE_APP_BRANCH=\"$BRANCH\"" > .env
echo "VUE_APP_COMMIT=\"$COMMIT\"" >> .env
echo "VUE_APP_DATE=\"$DATE\"" >> .env
echo "VITE_BRANCH=\"$BRANCH\"" >> .env
echo "VITE_COMMIT=\"$COMMIT\"" >> .env
echo "VITE_DATE=\"$DATE\"" >> .env