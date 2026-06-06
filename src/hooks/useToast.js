import { useApp } from '../context/AppContext'

export function useToast() {
  const { toasts, addToast, removeToast } = useApp()
  return { toasts, addToast, removeToast }
}
