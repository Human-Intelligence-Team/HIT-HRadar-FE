import { EventSourcePolyfill } from 'event-source-polyfill'

let eventSource = null

export function connectSSE(onMessage) {
  if (eventSource) return

  const token = localStorage.getItem('accessToken') // 또는 store

  eventSource = new EventSourcePolyfill(
    `${import.meta.env.VITE_API_BASE_URL}/api/notifications/subscribe`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      },
      withCredentials: true, // 필요 시
      heartbeatTimeout: 60_000
    }
  )

  eventSource.addEventListener('notification', (event) => {
    const data = JSON.parse(event.data)
    onMessage(data)
  })


  eventSource.onerror = (err) => {
    console.warn('SSE disconnected', err)
    eventSource.close()
    eventSource = null

    setTimeout(() => {
      connectSSE(onMessage)
    }, 5000)
  }
}

export function disconnectSSE() {
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
}
