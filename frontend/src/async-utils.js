export function waitFor(socket, event) {
  return new Promise((resolve) => {
    socket.once(event, resolve)
  })
}
export function delay(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}
