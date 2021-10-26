# Shitty Sync
A (somewhat) shitty way to sync videos with your friends.
### [sync.si instance](https://sync.si/)

### Getting started

- pull this repo
- install the dependencies (both in the root folder & in the `frontend` folder)
- build the frontend with `npm run build`
- run the server with `npm run start`

### Deploying using Docker:

1. Build the image:

  ```bash
  docker build --target=run -t shitty-sync .
  ```

2. Run the container:

  ```bash
  docker run -p 8080:8080 shitty-sync:latest
  ```

### Development

- Run `npm run dev` in both the root and `frontend` folder

### Contributing

PLS contribute

[What to do?](https://github.com/MaticBabnik/shitty-sync/projects/1) 

### Issues
Please note that issues related to extremely bad internet connections (ping >2000ms or extremely low bandwidth) are unlikely to be solved.