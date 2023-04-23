# Shitty Sync

[![Docker Image CI](https://github.com/MaticBabnik/shitty-sync/actions/workflows/docker-images.yml/badge.svg)](https://github.com/MaticBabnik/shitty-sync/actions/workflows/docker-images.yml)

A (somewhat) shitty way to sync videos with your friends.

Live @ [**sync.si**](https://sync.si/)!

## Deploying using Docker Compose:

1. Copy the compose file
2. `docker compose up -d`

need I say more?

## Development

1. Install the dependencies with `npm i` (in `backend` & `frontend` folder)
2. Build the frontend in `frontend` with `npm run build`
3. Run the server in `backend` with `EXPRESS_STATIC=1 npm run watch`

## 📈 Metrics

The server enables access to performance metrics using Prometheus. They are exposed by default on the `/metrics`
endpoint.

## Backend Environment variables

| var              | Description                                                                  |
| ---------------- | ---------------------------------------------------------------------------- |
| `PORT`           | Webserver port, defaults to 8080                                             |
| `PORT_METRICS`   | Prometheus metrics port, defaults to 9090 and should not be the same as PORT |
| `NO_METRICS`     | Disables metrics                                                             |
| `EXPRESS_STATIC` | Serves the frontend, meant for development (doesn't work in the image)       |

## Contributing

(Almost) all contributions are welcome! If you want to contribute, but don't know what to do, check out
the [project board](https://github.com/MaticBabnik/shitty-sync/projects/1).

If you develop a cool new feature or improve existing solutions, submit a PR with the feature and a brief explanation.
