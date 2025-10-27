<template>
  <div class="message-item" :class="messageClass">
    <!-- 用户消息 -->
    <div v-if="message.role === 'user'" class="user-message">
      <div class="message-bubble">
        {{ message.content }}
      </div>
    </div>

    <!-- 助手消息 -->
    <div v-else class="assistant-message">
      <!-- Agent模式的思考过程 -->
      <div
        v-if="message.mode === 'agent' && (message.thinking || message.isStreaming)"
        class="thinking-section"
      >
        <div class="thinking-header">
          <el-icon class="thinking-icon" :class="{ 'completed': !message.isStreaming }">
            <Loading v-if="message.isStreaming" />
            <Check v-else />
          </el-icon>
          <span>{{ message.isStreaming ? '思考中...' : '思考完成' }}</span>
        </div>
        <div v-if="message.thinking" class="thinking-content">
          {{ message.thinking }}
        </div>
      </div>

      <!-- 回答内容 -->
      <div v-if="message.content || message.isStreaming" class="answer-section">
        <div class="message-content" v-html="formattedContent"></div>
        <div v-if="message.isStreaming" class="streaming-cursor">▊</div>
      </div>

      <!-- 错误提示 -->
      <div v-if="message.error" class="error-message">
        <el-icon><WarningFilled /></el-icon>
        <span>消息发送失败</span>
      </div>

      <!-- 时间戳 -->
      <div class="message-time">
        {{ formatTime(message.timestamp) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Loading, Check, WarningFilled } from '@element-plus/icons-vue'
import { formatTime } from '@/utils/common'
import { marked } from 'marked'
import hljs from 'highlight.js'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

// 配置 marked
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true
})

const messageClass = computed(() => ({
  [`message-${props.message.role}`]: true,
  'is-streaming': props.message.isStreaming
}))

const formattedContent = computed(() => {
  if (!props.message.content) return ''
  return marked(props.message.content)
})
</script>

<style scoped lang="scss">
.message-item {
  margin-bottom: 24px;
  animation: fadeIn 0.3s ease-in-out;

  &:last-child {
    margin-bottom: 0;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-message {
  display: flex;
  justify-content: flex-end;

  .message-bubble {
    max-width: 70%;
    padding: 12px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
    border-radius: 12px 12px 4px 12px;
    font-size: 14px;
    line-height: 1.6;
    word-break: break-word;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }
}

.assistant-message {
  .thinking-section {
    margin-bottom: 12px;
    padding: 12px 16px;
    background: var(--bg-tertiary);
    border-radius: 8px;
    border-left: 3px solid var(--text-secondary);

    .thinking-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--text-regular);
      margin-bottom: 8px;

      .thinking-icon {
        animation: rotate 1s linear infinite;

        &.completed {
          animation: none;
          color: var(--success-color);
        }
      }
    }

    .thinking-content {
      font-size: 13px;
      color: var(--text-regular);
      line-height: 1.6;
      white-space: pre-wrap;
    }
  }

  .answer-section {
    position: relative;
    padding: 16px;
    background: var(--bg-primary);
    border-radius: 8px;
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-sm);

    .message-content {
      font-size: 14px;
      line-height: 1.8;
      color: var(--text-primary);

      :deep(p) {
        margin: 0 0 12px 0;

        &:last-child {
          margin-bottom: 0;
        }
      }

      :deep(code) {
        padding: 2px 6px;
        background: var(--bg-tertiary);
        border-radius: 3px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        color: #e83e8c;
      }

      :deep(pre) {
        margin: 12px 0;
        padding: 12px;
        background: #282c34;
        border-radius: 6px;
        overflow-x: auto;

        code {
          padding: 0;
          background: transparent;
          color: #abb2bf;
          font-size: 13px;
        }
      }

      :deep(ul), :deep(ol) {
        margin: 12px 0;
        padding-left: 24px;
      }

      :deep(li) {
        margin: 4px 0;
      }

      :deep(blockquote) {
        margin: 12px 0;
        padding: 8px 12px;
        border-left: 3px solid var(--primary-color);
        background: var(--bg-tertiary);
        color: var(--text-regular);
      }

      :deep(table) {
        width: 100%;
        margin: 12px 0;
        border-collapse: collapse;

        th, td {
          padding: 8px 12px;
          border: 1px solid var(--border-color);
          text-align: left;
        }

        th {
          background: var(--bg-secondary);
          font-weight: 500;
        }
      }
    }

    .streaming-cursor {
      display: inline-block;
      animation: blink 1s infinite;
      color: var(--primary-color);
      margin-left: 2px;
    }
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #fef0f0;
    border: 1px solid #fde2e2;
    border-radius: 8px;
    color: var(--danger-color);
    font-size: 13px;
  }

  .message-time {
    margin-top: 8px;
    font-size: 12px;
    color: var(--text-secondary);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}
</style>

