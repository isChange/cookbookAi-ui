import request from '@/utils/request'

/**
 * 用户登录
 * @param {Object} data - 登录信息
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @param {boolean} data.rememberMe - 记住我
 */
export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

/**
 * 用户登出
 */
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

/**
 * 获取当前登录用户信息
 */
export function getCurrentUserInfo() {
  return request({
    url: '/auth/current',
    method: 'get'
  })
}

/**
 * 检查登录状态
 */
export function checkLogin() {
  return request({
    url: '/auth/check',
    method: 'get'
  })
}

/**
 * 获取Token信息
 */
export function getTokenInfo() {
  return request({
    url: '/auth/token/info',
    method: 'get'
  })
}

