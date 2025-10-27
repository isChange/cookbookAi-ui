import { defineStore } from 'pinia'
import { generateUUID } from '@/utils/common'
import { getConversationList, clearMemory } from '@/api/chat'

export const useChatStore = defineStore('chat', {
  state: () => ({
    // 当前会话ID
    currentConversationId: null,
    // 会话列表
    conversations: [],
    // 当前聊天模式：'agent' | 'ask'
    chatMode: 'agent',
    // 侧边栏是否折叠
    sidebarCollapsed: false,
    // 当前会话的消息列表
    messages: {},
    // 是否正在加载
    loading: false
  }),

  getters: {
    // 获取当前会话的消息
    currentMessages: (state) => {
      return state.messages[state.currentConversationId] || []
    },
    
    // 获取当前会话信息
    currentConversation: (state) => {
      return state.conversations.find(c => c.id === state.currentConversationId)
    },
    
    // 根据 conversationId 获取会话标题（第一条用户消息）
    getConversationTitle: (state) => (conversationId) => {
      const messages = state.messages[conversationId]
      if (messages && messages.length > 0) {
        const userMessages = messages.filter(m => m.role === 'user')
        if (userMessages.length > 0) {
          const firstUserMsg = userMessages[0].content
          return firstUserMsg.slice(0, 30) + (firstUserMsg.length > 30 ? '...' : '')
        }
      }
      return conversationId.slice(0, 8) // 默认显示 ID 前8位
    }
  },

  actions: {
    /**
     * 创建新会话
     */
    createConversation(title = '新对话') {
      const id = generateUUID()
      const conversation = {
        id,
        title,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      }
      this.conversations.unshift(conversation)
      this.currentConversationId = id
      this.messages[id] = []
      return conversation
    },

    /**
     * 切换会话
     */
    async switchConversation(conversationId) {
      this.currentConversationId = conversationId
      
      // 如果本地没有该会话的消息，从后端加载
      if (!this.messages[conversationId] || this.messages[conversationId].length === 0) {
        await this.loadConversationHistory(conversationId)
      }
    },

    /**
     * 从后端加载指定会话的历史消息
     * 注意：目前从 localStorage 恢复历史消息
     */
    async loadConversationHistory(conversationId) {
      try {
        this.setLoading(true)
        
        // 从本地存储获取会话列表，解析出该会话的消息
        const res = await getConversationList()
        
        if (res.code === 200 && res.data) {
          // 过滤出该会话的所有消息记录
          const conversationMessages = res.data
            .filter(item => item.conversationId === conversationId)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            .map(item => ({
              id: `${item.conversationId}-${item.timestamp}`,
              role: item.type === 'USER' ? 'user' : 'assistant',
              content: item.content,
              timestamp: item.timestamp
            }))
          
          // 将消息加载到本地
          this.messages[conversationId] = conversationMessages
          
          // 更新会话标题（使用第一条用户消息）
          const conversation = this.conversations.find(c => c.id === conversationId)
          if (conversation && conversationMessages.length > 0) {
            const userMessages = conversationMessages.filter(m => m.role === 'user')
            if (userMessages.length > 0) {
              const firstUserMsg = userMessages[0].content
              conversation.title = firstUserMsg.slice(0, 30) + (firstUserMsg.length > 30 ? '...' : '')
            }
          }
        }
      } catch (error) {
        console.error('加载会话历史失败:', error)
        // 如果加载失败，初始化为空数组
        if (!this.messages[conversationId]) {
          this.messages[conversationId] = []
        }
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * 删除会话
     */
    async deleteConversation(conversationId) {
      try {
        // 调用后端API清除会话记忆
        await clearMemory(conversationId)
        
        // 从列表中删除
        const index = this.conversations.findIndex(c => c.id === conversationId)
        if (index > -1) {
          this.conversations.splice(index, 1)
        }
        
        // 删除消息
        delete this.messages[conversationId]
        
        // 如果删除的是当前会话，切换到第一个会话或创建新会话
        if (this.currentConversationId === conversationId) {
          if (this.conversations.length > 0) {
            this.currentConversationId = this.conversations[0].id
          } else {
            this.createConversation()
          }
        }
      } catch (error) {
        console.error('删除会话失败:', error)
        throw error
      }
    },

    /**
     * 重命名会话
     */
    renameConversation(conversationId, newTitle) {
      const conversation = this.conversations.find(c => c.id === conversationId)
      if (conversation) {
        conversation.title = newTitle
        conversation.updateTime = new Date().toISOString()
      }
    },

    /**
     * 添加消息
     */
    addMessage(conversationId, message) {
      if (!this.messages[conversationId]) {
        this.messages[conversationId] = []
      }
      this.messages[conversationId].push({
        id: generateUUID(),
        ...message,
        timestamp: new Date().toISOString()
      })
      
      // 更新会话时间和标题
      const conversation = this.conversations.find(c => c.id === conversationId)
      if (conversation) {
        conversation.updateTime = new Date().toISOString()
        
        // 如果是用户消息，检查是否需要更新会话标题
        if (message.role === 'user') {
          // 找出当前会话的第一条用户消息
          const userMessages = this.messages[conversationId].filter(m => m.role === 'user')
          // 如果这是第一条用户消息，或者标题还是默认的，则更新标题
          if (userMessages.length === 1 || conversation.title === '新对话' || conversation.title.length === 8) {
            const firstUserMessage = userMessages[0].content
            conversation.title = firstUserMessage.slice(0, 30) + (firstUserMessage.length > 30 ? '...' : '')
          }
        }
      }
    },

    /**
     * 更新消息
     */
    updateMessage(conversationId, messageId, updates) {
      const messages = this.messages[conversationId]
      if (messages) {
        const message = messages.find(m => m.id === messageId)
        if (message) {
          Object.assign(message, updates)
        }
      }
    },

    /**
     * 切换聊天模式
     */
    setChatMode(mode) {
      this.chatMode = mode
    },

    /**
     * 切换侧边栏折叠状态
     */
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    /**
     * 设置加载状态
     */
    setLoading(loading) {
      this.loading = loading
    },

    /**
     * 加载会话列表
     */
    async loadConversations() {
      try {
        const res = await getConversationList()
        if (res.code === 200 && res.data) {
          // 按 conversationId 去重和分组
          const conversationMap = new Map()
          
          res.data.forEach(item => {
            const convId = item.conversationId
            if (!conversationMap.has(convId)) {
              conversationMap.set(convId, {
                id: convId,
                createTime: item.createTime,
                updateTime: item.updateTime || item.createTime
              })
            } else {
              // 如果已存在，更新时间为最新的
              const existing = conversationMap.get(convId)
              if (new Date(item.updateTime) > new Date(existing.updateTime)) {
                existing.updateTime = item.updateTime
              }
            }
          })
          
          // 转换为数组并设置标题
          this.conversations = Array.from(conversationMap.values()).map(conv => {
            // 如果本地有该会话的消息，使用第一条用户消息作为标题
            let title = '新对话'
            if (this.messages[conv.id] && this.messages[conv.id].length > 0) {
              const userMessages = this.messages[conv.id].filter(m => m.role === 'user')
              if (userMessages.length > 0) {
                const firstUserMsg = userMessages[0].content
                title = firstUserMsg.slice(0, 30) + (firstUserMsg.length > 30 ? '...' : '')
              }
            } else {
              // 没有本地消息，使用 conversationId 的前8位
              title = conv.id.slice(0, 8)
            }
            
            return {
              ...conv,
              title
            }
          })
          
          // 按更新时间倒序排序（最新的在前）
          this.conversations.sort((a, b) => 
            new Date(b.updateTime) - new Date(a.updateTime)
          )
          
          // 如果没有当前会话，创建一个新的
          if (!this.currentConversationId && this.conversations.length === 0) {
            this.createConversation()
          } else if (!this.currentConversationId && this.conversations.length > 0) {
            this.currentConversationId = this.conversations[0].id
          }
        }
      } catch (error) {
        console.error('加载会话列表失败:', error)
        // 如果加载失败，至少创建一个默认会话
        if (this.conversations.length === 0) {
          this.createConversation()
        }
      }
    },

    /**
     * 清空所有会话
     */
    clearAll() {
      this.conversations = []
      this.messages = {}
      this.createConversation()
    }
  },

  // 持久化配置
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'chat-store',
        storage: localStorage,
        paths: ['conversations', 'messages', 'chatMode', 'sidebarCollapsed', 'currentConversationId']
      }
    ]
  }
})

