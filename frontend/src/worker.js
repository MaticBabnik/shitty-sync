/// <reference no-default-lib="false"/>
/// <reference lib="ES2020" />
/// <reference lib="webworker" />

/*
    This shared worker basically just broadcasts all messages it recieves.
*/

;(() => {
  // eslint-disable-next-line no-undef
  const self = /** @type {SharedWorkerGlobalScope} */ (/** @type {unknown} */ (globalThis.self))

  const allPorts = []

  function broadcast(message) {
    allPorts.forEach((port) => {
      port.postMessage(message)
    })
  }

  self.onconnect = (e) => {
    const port = e.ports[0]
    allPorts.push(port)

    port.addEventListener('message', (msgEvent) => {
      if (msgEvent.data == null) return
      broadcast(msgEvent.data)
    })

    port.start()
  }
})()
