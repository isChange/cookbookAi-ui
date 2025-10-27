<template>
  <div class="chat-panel">
    <!-- 头部 -->
    <div class="chat-header">
      <div class="header-left">
        <el-button
          :icon="Menu"
          circle
          @click="chatStore.toggleSidebar"
        />
        <span class="chat-title">{{ currentTitle }}</span>
      </div>
    </div>

    <!-- 消息列表 -->
    <div ref="messageListRef" class="message-list">
      <!-- 加载状态 -->
      <div v-if="chatStore.loading" class="loading-state">
        <el-icon class="loading-icon" :size="40">
          <Loading />
        </el-icon>
        <p>正在加载历史消息...</p>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="messages.length === 0" class="empty-state">
        <el-empty description="开始新对话吧">
          <template #image>
            <el-icon :size="100" color="#409EFF">
              <ChatDotRound />
            </el-icon>
          </template>
        </el-empty>
      </div>
      
      <!-- 消息列表 -->
      <div v-else class="messages">
        <MessageItem
          v-for="msg in messages"
          :key="msg.id"
          :message="msg"
        />
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <div class="input-container">
        <el-input
          v-model="inputMessage"
          type="textarea"
          :rows="3"
          placeholder="输入你的问题..."
          :disabled="loading"
          @keydown.enter.exact.prevent="handleSend"
        />
        <div class="input-actions">
          <div class="left-actions">
            <el-button-group class="mode-switcher">
              <el-button
                :type="chatStore.chatMode === 'ask' ? 'primary' : ''"
                size="default"
                @click="chatStore.setChatMode('ask')"
              >
                Ask
              </el-button>
              <el-button
                :type="chatStore.chatMode === 'agent' ? 'primary' : ''"
                size="default"
                @click="chatStore.setChatMode('agent')"
              >
                Agent
              </el-button>
            </el-button-group>
            <span class="tip">按 Enter 发送，Shift + Enter 换行</span>
          </div>
          <el-button
            type="primary"
            :icon="Promotion"
            :loading="loading"
            :disabled="!inputMessage.trim()"
            @click="handleSend"
          >
            发送
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import { simpleChatStream, chatWithMemoryStream, agentChatStream } from '@/api/chat'
import { checkToken } from '@/api/user'
import MessageItem from './MessageItem.vue'
import { Menu, Promotion, ChatDotRound, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const chatStore = useChatStore()
const messageListRef = ref(null)
const inputMessage = ref('')
const loading = ref(false)

const messages = computed(() => chatStore.currentMessages)
const currentTitle = computed(() => {
  return chatStore.currentConversation?.title || '新对话'
})

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

// 监听消息变化，自动滚动到底部
watch(messages, () => {
  scrollToBottom()
}, { deep: true })

// 监听会话切换，自动滚动到底部
watch(() => chatStore.currentConversationId, () => {
  scrollToBottom()
})

// 发送消息
const handleSend = async () => {
  if (!inputMessage.value.trim() || loading.value) return

  const userMessage = inputMessage.value.trim()
  inputMessage.value = ''
  loading.value = true

  try {
    // 验证Token是否可用
    const tokenCheckResult = await checkToken()
    if (!tokenCheckResult.data) {
      ElMessage.error('Token已用完，无法继续对话')
      loading.value = false
      return
    }
  } catch (error) {
    console.error('Token验证失败:', error)
    ElMessage.error('Token验证失败，请重新登录')
    loading.value = false
    return
  }

  // 添加用户消息
  chatStore.addMessage(chatStore.currentConversationId, {
    role: 'user',
    content: userMessage
  })

  // 创建助手消息
  const assistantMessageId = Date.now().toString()
  chatStore.addMessage(chatStore.currentConversationId, {
    id: assistantMessageId,
    role: 'assistant',
    content: '',
    thinking: '',
    isStreaming: true,
    mode: chatStore.chatMode
  })

  scrollToBottom()

  try {
    let fullContent = ''
    let fullThinking = ''

    // ✅ 思考过程回调
    const onThinking = (chunk) => {
      fullThinking += chunk
      chatStore.updateMessage(chatStore.currentConversationId, assistantMessageId, {
        thinking: fullThinking
      })
      scrollToBottom()
    }

    // ✅ 内容回调
    const onContent = (chunk) => {
      fullContent += chunk
      chatStore.updateMessage(chatStore.currentConversationId, assistantMessageId, {
        content: fullContent
      })
      scrollToBottom()
    }

    // 根据模式选择不同的API（使用 await 等待 Promise 完成）
    if (chatStore.chatMode === 'agent') {
      await agentChatStream(
        chatStore.currentConversationId,
        userMessage,
        onThinking,
        onContent
      )
    } else {
      // ask模式使用记忆对话
      await chatWithMemoryStream(
        chatStore.currentConversationId,
        userMessage,
        onThinking,
        onContent
      )
    }

    // ✅ 流式传输完成
    chatStore.updateMessage(chatStore.currentConversationId, assistantMessageId, {
      isStreaming: false
    })
    loading.value = false

  } catch (error) {
    console.error('流式请求错误:', error)
    
    // ❌ 流式传输失败
    chatStore.updateMessage(chatStore.currentConversationId, assistantMessageId, {
      isStreaming: false,
      error: true
    })
    
    ElMessage.error('消息发送失败，请稍后重试')
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-primary);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-primary);

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .chat-title {
      font-size: 16px;
      font-weight: 500;
      color: var(--text-primary);
    }
  }
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: var(--bg-secondary);

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-secondary);

    .loading-icon {
      animation: rotate 1s linear infinite;
      margin-bottom: 16px;
    }

    p {
      font-size: 14px;
      margin: 0;
    }
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .messages {
    max-width: 900px;
    margin: 0 auto;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-dark);
    border-radius: 3px;

    &:hover {
      background: var(--text-placeholder);
    }
  }
}

.input-area {
  padding: 20px 24px;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);

  .input-container {
    max-width: 900px;
    margin: 0 auto;

    :deep(.el-textarea__inner) {
      resize: none;
      border-radius: 8px;
      font-size: 14px;
      line-height: 1.6;
    }

    .input-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;

      .left-actions {
        display: flex;
        align-items: center;
        gap: 16px;

        .mode-switcher {
          :deep(.el-button) {
            padding: 8px 20px;
          }
        }

        .tip {
          font-size: 12px;
          color: var(--text-secondary);
        }
      }
    }
  }
}
</style>

