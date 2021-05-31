#!/bin/sh
#Generates the debug info seen on the home page
echo "VUE_APP_BRANCH=\"$(git rev-parse --abbrev-ref HEAD)\"" > .env;echo "VUE_APP_COMMIT=\"$(git rev-parse HEAD)\"">>.env