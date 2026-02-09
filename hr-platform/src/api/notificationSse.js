import { EventSourcePolyfill } from 'event-source-polyfill'

let eventSource = null
let listeners = []

export function connectSSE(onMessage) {
  if (onMessage && !listeners.includes(onMessage)) {
    listeners.push(onMessage)
  }

  if (eventSource) return

  const token = localStorage.getItem('accessToken')

  // ✅ 토큰이 없으면 SSE 연결하지 않음
  if (!token) {
    console.warn('No access token - skipping SSE connection')
    return
  }

  const baseURL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')

  eventSource = new EventSourcePolyfill(
    `${baseURL}/api/notifications/subscribe`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      },
      withCredentials: true,
      heartbeatTimeout: 60_000
    }
  )

  eventSource.addEventListener('notification', (event) => {
    const data = JSON.parse(event.data)
    listeners.forEach(cb => {
      try {
        cb(data)
      } catch (err) {
        console.error('Error in SSE listener:', err)
      }
    })
  })

  eventSource.onerror = (err) => {
    console.warn('SSE disconnected', err)
    eventSource.close()
    eventSource = null

    // ✅ 재연결 전 토큰 확인 - 토큰이 없으면 재연결하지 않음
    const currentToken = localStorage.getItem('accessToken')
    if (currentToken) {
      setTimeout(() => {
        connectSSE()
      }, 5000)
    } else {
      console.warn('No token available - not reconnecting SSE')
    }
  }
}

export function disconnectSSE(onMessage) {
  if (onMessage) {
    listeners = listeners.filter(cb => cb !== onMessage)
  } else {
    listeners = []
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
  }
}
