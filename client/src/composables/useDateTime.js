import { ref, computed } from 'vue'

export function useDateTime() {
  const now = ref(new Date())

  // Memperbarui waktu sekarang setiap menit
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

  // Memformat tanggal untuk tampilan
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  // Memformat waktu untuk tampilan
  const formatTime = (date) => {
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // Memformat timestamp pesan (misal: "14:30" atau "Kemarin")
  const formatMessageTime = (date) => {
    const dateObj = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (dateObj.toDateString() === today.toDateString()) {
      return formatTime(dateObj)
    } else if (dateObj.toDateString() === yesterday.toDateString()) {
      return 'Kemarin'
    } else {
      return formatDate(dateObj)
    }
  }

  // String ISO untuk API
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
