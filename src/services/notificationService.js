export const notificationService = {
  isSupported() {
    return 'Notification' in window
  },

  getPermission() {
    if (!this.isSupported()) {
      return 'unsupported'
    }

    return Notification.permission
  },

  async requestPermission() {
    if (!this.isSupported()) {
      return 'unsupported'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    return Notification.requestPermission()
  },

  async sendTestNotification(title = 'Manwha Tracker', body = 'Notifications activées') {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return false
    }

    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico'
    })

    return true
  }
}