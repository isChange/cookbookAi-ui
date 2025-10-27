import { defineStore } from 'pinia'
import { login, logout, getCurrentUserInfo } from '@/api/auth'
import { tokenManager } from '@/utils/storage'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    token: tokenManager.getToken() || null,
    isLogin: false
  }),

  getters: {
    // 获取用户名
    username: (state) => state.userInfo?.username || '',
    // 获取昵称
    nickname: (state) => state.userInfo?.nickname || state.userInfo?.username || '游客',
    // 获取头像
    avatar: (state) => state.userInfo?.avatar || '',
    // 获取用户角色
    role: (state) => state.userInfo?.role || 'FREE',
    // 是否是管理员
    isAdmin: (state) => state.userInfo?.role === 'ADMIN'
  },

  actions: {
    /**
     * 用户登录
     */
    async login(loginForm) {
      try {
        const res = await login(loginForm)
        if (res.code === 200 && res.data) {
          this.token = res.data.token
          this.userInfo = res.data.userInfo
          this.isLogin = true
          tokenManager.setToken(res.data.token)
          return res.data
        }
        throw new Error(res.message || '登录失败')
      } catch (error) {
        console.error('登录失败:', error)
        throw error
      }
    },

    /**
     * 用户登出
     */
    async logout() {
      try {
        await logout()
      } catch (error) {
        console.error('登出失败:', error)
      } finally {
        this.token = null
        this.userInfo = null
        this.isLogin = false
        tokenManager.removeToken()
      }
    },

    /**
     * 获取用户信息
     */
    async getUserInfo() {
      try {
        const res = await getCurrentUserInfo()
        if (res.code === 200 && res.data) {
          this.userInfo = res.data
          this.isLogin = true
          return res.data
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        // 如果获取失败，清除token
        this.token = null
        this.isLogin = false
        tokenManager.removeToken()
        throw error
      }
    },

    /**
     * 更新用户信息
     */
    updateUserInfo(userInfo) {
      this.userInfo = { ...this.userInfo, ...userInfo }
    }
  }
})

