import request from '@/utils/request'
import { tokenManager } from '@/utils/storage'
import { EventSourcePolyfill } from 'event-source-polyfill'

/**
 * ============================================
 * 普通 HTTP 请求接口
 * ============================================
 */

/**
 * 普通聊天（Ask模式）
 * @param {string} message - 用户消息
 */
export function simpleChat(message) {
  return request({
    url: '/chat/simple',
    method: 'get',
    params: { message }
  })
}

/**
 * 记忆对话
 * @param {string} conversationId - 会话ID
 * @param {string} message - 用户消息
 */
export function chatWithMemory(conversationId, message) {
  return request({
    url: '/chat/memory',
    method: 'get',
    params: { conversationId, message }
  })
}

/**
 * Agent对话
 * @param {string} conversationId - 会话ID
 * @param {string} message - 用户消息
 */
export function agentChat(conversationId, message) {
  return request({
    url: '/agent/yicook',
    method: 'get',
    params: { conversationId, message }
  })
}

/**
 * 清除会话记忆
 * @param {string} conversationId - 会话ID
 */
export function clearMemory(conversationId) {
  return request({
    url: `/chat/memory/${conversationId}`,
    method: 'delete'
  })
}

/**
 * 获取会话列表
 */
export function getConversationList() {
  return request({
    url: '/chat/memory/list',
    method: 'get'
  })
}

/**
 * ============================================
 * SSE 流式传输接口（使用 EventSourcePolyfill）
 * ============================================
 */

/**
 * 使用 SSE 方式进行聊天（统一封装）
 * @param {Object} config - 配置对象
 * @param {string} config.url - SSE 接口路径
 * @param {string} config.conversationId - 会话ID
 * @param {string} config.message - 用户消息
 * @param {Function} onThinking - 接收思考过程的回调函数
 * @param {Function} onContent - 接收内容的回调函数
 * @returns {Promise} Promise 对象
 */
export const chatWithSSE = ({ url, conversationId, message }, onThinking, onContent) => {
  return new Promise((resolve, reject) => {
    const baseURL = import.meta.env.VITE_APP_BASE_API
    const token = tokenManager.getToken()

    // Token 验证
    if (!token) {
      console.error('❌ [SSE] Token 不存在')
      reject(new Error('未授权，请重新登录'))
      return
    }

    // 构建请求参数（将 Token 添加到 URL 参数中）
    const params = new URLSearchParams({
      conversationId,
      message,
      Authorization: token  // 通过 URL 参数传递 Token
    })

    // 创建 EventSource 连接
    const fullUrl = `${baseURL}${url}?${params.toString()}`
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔗 [SSE] 建立连接')
    console.log('   接口:', url)
    console.log('   会话ID:', conversationId)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    let eventSource = null
    let timeoutId = null
    let hasReceivedData = false

    try {
      // 使用 EventSourcePolyfill 支持跨域和更好的兼容性
      eventSource = new EventSourcePolyfill(fullUrl, {
        heartbeatTimeout: 120000,  // 心跳超时 2 分钟
        withCredentials: true      // 支持跨域携带凭证
      })

      // 超时处理（180秒，与后端设置一致）
      timeoutId = setTimeout(() => {
        console.warn('⏰ [SSE] 请求超时')
        cleanup()
        reject(new Error('请求超时'))
      }, 180000)

      // 清理资源
      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        if (eventSource && eventSource.readyState !== EventSourcePolyfill.CLOSED) {
          eventSource.close()
        }
      }

      // 监听连接打开
      eventSource.onopen = () => {
        console.log('✅ [SSE] 连接已建立')
      }

      // 处理消息的通用函数
      const processMessage = (data, type = 'content') => {
        try {
          // 检查是否是结束标记
          if (data === '[DONE]' || data === '') {
            return
          }

          hasReceivedData = true

          // 重置超时计时器（收到消息说明连接正常）
          if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => {
              console.warn('⏰ [SSE] 接收超时')
              cleanup()
              reject(new Error('接收超时'))
            }, 180000)
          }

          // 尝试解析 JSON 数据
          try {
            const jsonData = JSON.parse(data)
            const content = jsonData.content || jsonData.data || data
            
            if (type === 'thinking') {
              onThinking?.(content)
            } else {
              onContent?.(content)
            }
          } catch {
            // 如果不是 JSON，直接当作文本内容
            if (type === 'thinking') {
              onThinking?.(data)
            } else {
              onContent?.(data)
            }
          }
        } catch (error) {
          console.error('❌ [SSE] 处理消息时出错:', error)
        }
      }

      // 监听默认消息事件（兼容旧版本）
      eventSource.onmessage = (event) => {
        processMessage(event.data, 'content')
      }

      // 监听自定义事件：thinking（思考过程）
      eventSource.addEventListener('thinking', (event) => {
        console.log('💭 [SSE] 收到思考过程')
        processMessage(event.data, 'thinking')
      })

      // 监听自定义事件：content（总结内容）
      eventSource.addEventListener('content', (event) => {
        console.log('📝 [SSE] 收到总结内容')
        processMessage(event.data, 'content')
      })

      // 错误处理
      eventSource.onerror = (error) => {
        console.log('⚠️ [SSE] onerror 触发')
        console.log('   ReadyState:', eventSource.readyState)
        console.log('   已接收数据:', hasReceivedData)

        cleanup()

        // 判断是正常关闭还是真正的错误
        // readyState === 2 (CLOSED) 且已接收数据，说明是正常完成
        if (eventSource.readyState === EventSourcePolyfill.CLOSED && hasReceivedData) {
          console.log('✅ [SSE] 流式传输完成')
          resolve()
        } else if (eventSource.readyState === EventSourcePolyfill.CLOSED && !hasReceivedData) {
          console.error('❌ [SSE] 连接被关闭，未接收到任何数据')
          reject(new Error('连接被关闭'))
        } else {
          console.error('❌ [SSE] 连接错误')
          reject(new Error('连接失败，请检查网络或稍后重试'))
        }
      }

      // 返回一个可以手动关闭的对象（可选）
      return {
        close: () => {
          console.log('🔒 [SSE] 手动关闭连接')
          cleanup()
          resolve()
        }
      }

    } catch (error) {
      console.error('❌ [SSE] 创建连接失败:', error)
      if (timeoutId) clearTimeout(timeoutId)
      reject(error)
    }
  })
}

/**
 * ============================================
 * SSE 流式接口封装（具体业务方法）
 * ============================================
 */

/**
 * 普通聊天（Ask模式）- SSE 流式
 * @param {string} message - 用户消息
 * @param {Function} onThinking - 思考过程回调
 * @param {Function} onContent - 内容回调
 * @returns {Promise}
 */
export function simpleChatStream(message, onThinking, onContent) {
  return chatWithSSE(
    {
      url: '/chat/simple/stream/sse',
      conversationId: 'simple',  // 简单模式使用固定的会话ID
      message
    },
    onThinking,
    onContent
  )
}

/**
 * 记忆对话 - SSE 流式
 * @param {string} conversationId - 会话ID
 * @param {string} message - 用户消息
 * @param {Function} onThinking - 思考过程回调
 * @param {Function} onContent - 内容回调
 * @returns {Promise}
 */
export function chatWithMemoryStream(conversationId, message, onThinking, onContent) {
  return chatWithSSE(
    {
      url: '/chat/memory/stream/sse',
      conversationId,
      message
    },
    onThinking,
    onContent
  )
}

/**
 * Agent对话 - SSE 流式
 * @param {string} conversationId - 会话ID
 * @param {string} message - 用户消息
 * @param {Function} onThinking - 思考过程回调
 * @param {Function} onContent - 内容回调
 * @returns {Promise}
 */
export function agentChatStream(conversationId, message, onThinking, onContent) {
  return chatWithSSE(
    {
      url: '/agent/yicook/stream/sse',
      conversationId,
      message
    },
    onThinking,
    onContent
  )
}
