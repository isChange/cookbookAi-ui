import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 180000, // 3分钟超时
  withCredentials: true // 支持跨域携带 Cookie
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // Sa-Token 使用 Cookie 方式，axios 会自动携带
    // 这里保留 localStorage 的 token 作为备用
    const token = localStorage.getItem('token')
    if (token) {
      // 后端配置了从 Cookie 读取，所以主要依赖 Cookie
      // 但也设置 Header 作为备用
      config.headers['Authorization'] = token
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    
    // 如果返回的是流数据，直接返回
    if (response.config.responseType === 'stream') {
      return response
    }

    // 判断响应是否成功
    if (res.code !== undefined && res.code !== 200) {
      ElMessage({
        message: res.message || '请求失败',
        type: 'error',
        duration: 3000
      })

      // 401: 未授权，跳转登录页
      if (res.code === 401) {
        localStorage.removeItem('token')
        router.push('/login')
      }

      return Promise.reject(new Error(res.message || '请求失败'))
    }

    return res
  },
  error => {
    console.error('响应错误:', error)
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          ElMessage.error('未授权，请重新登录')
          localStorage.removeItem('token')
          router.push('/login')
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error(data?.message || '请求失败')
      }
    } else if (error.request) {
      ElMessage.error('网络连接失败，请检查网络')
    } else {
      ElMessage.error('请求配置错误')
    }

    return Promise.reject(error)
  }
)

export default service

