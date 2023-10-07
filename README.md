# Sync

[![Docker Image CI](https://github.com/MaticBabnik/shitty-sync/actions/workflows/docker-images.yml/badge.svg)](https://github.com/MaticBabnik/shitty-sync/actions/workflows/docker-images.yml)

A web app for group watching videos.

Currently supported sources:

-   Youtube
-   Plain video files\*
-   MPEG DASH videos\*

\* as long as they are hosted publicly and can be accessed cross-origin

Live @ [**sync.si**](https://sync.si/)!

## Deploying using Docker Compose:

1. Copy the compose file
2. `docker compose up -d`

need I say more?

## Development

> [!NOTE]
> I use `bun`, but feel free to use any `npm` compatible-ish package manager

1. Install the dependencies with `bun i` (in `backend` & `frontend` folder)
2. Run the frontend in `frontend` with `bun run dev`
3. Run the server in `backend` with `bun run watch`

## 📈 Metrics

The server enables access to performance metrics using Prometheus. They are exposed by default on the `/metrics`
endpoint.

## Backend Environment variables

| var            | Description                                                                  |
| -------------- | ---------------------------------------------------------------------------- |
| `PORT`         | Webserver port, defaults to 8080                                             |
| `PORT_METRICS` | Prometheus metrics port, defaults to 9090 and should not be the same as PORT |
| `NO_METRICS`   | Disables metrics                                                             |

## Contributing

(Almost) all contributions are welcome! If you want to contribute, but don't know what to do, check out
the [project board](https://github.com/MaticBabnik/shitty-sync/projects/1).

If you develop a cool new feature or improve existing solutions, submit a PR with the feature and a brief explanation.
