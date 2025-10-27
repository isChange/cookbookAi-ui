/**
 * localStorage 封装
 */

const STORAGE_PREFIX = 'cookbook_'

export const storage = {
  set(key, value) {
    try {
      const data = JSON.stringify(value)
      localStorage.setItem(STORAGE_PREFIX + key, data)
    } catch (error) {
      console.error('Storage set error:', error)
    }
  },

  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(STORAGE_PREFIX + key)
      return data ? JSON.parse(data) : defaultValue
    } catch (error) {
      console.error('Storage get error:', error)
      return defaultValue
    }
  },

  remove(key) {
    localStorage.removeItem(STORAGE_PREFIX + key)
  },

  clear() {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  }
}

// Token 管理
export const tokenManager = {
  setToken(token) {
    localStorage.setItem('token', token)
  },

  getToken() {
    return localStorage.getItem('token')
  },

  removeToken() {
    localStorage.removeItem('token')
  },

  hasToken() {
    return !!this.getToken()
  }
}

