import { reactive, toRefs } from 'vue'

const state = reactive({
  show: false,
  message: '',
  color: 'error',
  timeout: 4000
})

/**
 * Composable for managing global toast notifications.
 * Uses a shared state so it can be triggered from anywhere.
 */
export function useToast() {
  const showToast = (message, color = 'error', timeout = 4000) => {
    state.message = message
    state.color = color
    state.timeout = timeout
    state.show = true
  }

  const success = (message) => showToast(message, 'success')
  const error = (message) => showToast(message, 'error')
  const warning = (message) => showToast(message, 'warning')
  const info = (message) => showToast(message, 'info')

  const hide = () => {
    state.show = false
  }

  return {
    ...toRefs(state),
    showToast,
    success,
    error,
    warning,
    info,
    hide
  }
}
