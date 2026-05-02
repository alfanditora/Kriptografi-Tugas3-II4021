import { ref, computed } from 'vue'

export function useDateTime() {
  const now = ref(new Date())

  // Update current time every minute
  let interval = null

  const start = () => {
    now.value = new Date()
    interval = setInterval(() => {
      now.value = new Date()
    }, 60000)
  }

  const stop = () => {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
  }

  // Format date for display
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  // Format time for display
  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // Format for message timestamp (e.g., "2:30 PM" or "Yesterday")
  const formatMessageTime = (date) => {
    const dateObj = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (dateObj.toDateString() === today.toDateString()) {
      return formatTime(dateObj)
    } else if (dateObj.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return formatDate(dateObj)
    }
  }

  // ISO string for API
  const toISOString = (date) => {
    return new Date(date).toISOString()
  }

  const formattedNow = computed(() => formatDate(now.value))
  const formattedTime = computed(() => formatTime(now.value))

  return {
    now,
    formattedNow,
    formattedTime,
    start,
    stop,
    formatDate,
    formatTime,
    formatMessageTime,
    toISOString
  }
}
