# 💩Shitty💩 Sync

[![Docker Image CI](https://github.com/MaticBabnik/shitty-sync/actions/workflows/docker-image.yml/badge.svg)](https://github.com/MaticBabnik/shitty-sync/actions/workflows/docker-image.yml)

A (somewhat) shitty way to sync videos with your friends.

Check out a demo [**sync.si instance**](https://sync.si/)!

## Getting started

1. Pull this repo
2. Install the dependencies with `npm i` (both in the root folder & in the `frontend` folder)
3. Build the frontend with `npm run build`
4. Run the server with `npm run start`

## 📈 Metrics

The server enables access to performance metrics using Prometheus. They are exposed by default on the `/metrics`
endpoint.

## 🌳Environment variables

| var            | Description                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| `PORT`         | Webserver port, defaults to 8080                                                                      |
| `PORT_METRICS` | Prometheus `/metrics` port, defaults to 9090 and should not be the same as PORT                       |
| `NO_METRICS`   | Disables metrics if set to a [truthy value](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) |

## Deploying using 🐳 Docker:

1. Pull the image:

```bash
docker pull weebify/shitty-sync:latest
```

2. Run the container:

```bash
docker run -p 8080:8080 -p 9090:9090 shitty-sync:latest
```

## 🛠️ Development

-   Run `npm run dev` in both the root and `frontend` folder

-   To build locally with Docker, execute:

    ```bash
    $ docker build --target=run -t shitty-sync .
    $ docker run -p 8080:8080 -p 9090:9090 shitty-sync:latest
    ```

## ↪️Contributing

All contributions are welcome! If you want to contribute, but don't know what to do, check out
the [project board](https://github.com/MaticBabnik/shitty-sync/projects/1).

If you develop a cool new feature or improve existing solutions, submit a PR with the feature and a brief explanation.

## 📢 Issues

Please note that issues related to extremely bad internet connections (ping >2000ms or extremely low bandwidth) are
unlikely to be solved.
