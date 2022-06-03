
export function createWorker() {
    if (typeof SharedWorker === 'undefined') {
        console.warn("SharedWorker is not supported in this browser, Send to sync will not work.");
    } else {
        return new SharedWorker('/worker.js');
    }
}