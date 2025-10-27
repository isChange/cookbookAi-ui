<template>
  <el-dialog
    v-model="appStore.settingsDialogVisible"
    title="设置"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-tabs v-model="activeTab">
      <!-- 基本设置 -->
      <el-tab-pane label="基本设置" name="basic">
        <el-form :model="settingsForm" label-width="100px">
          <el-form-item label="主题">
            <el-radio-group v-model="settingsForm.theme" @change="handleThemeChange">
              <el-radio label="light">浅色</el-radio>
              <el-radio label="dark">深色</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="语言">
            <el-select v-model="settingsForm.language" @change="handleLanguageChange">
              <el-option label="简体中文" value="zh-CN" />
              <el-option label="English" value="en-US" />
            </el-select>
          </el-form-item>

          <el-form-item label="默认模式">
            <el-radio-group v-model="settingsForm.defaultMode" @change="handleDefaultModeChange">
              <el-radio label="ask">Ask 模式</el-radio>
              <el-radio label="agent">Agent 模式</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 注册码管理 -->
      <el-tab-pane label="注册码管理" name="registerCode">
        <div class="register-code-panel">
          <!-- 生成注册码 -->
          <div class="generate-section">
            <el-form :model="generateForm" label-width="100px">
              <el-form-item label="备注信息">
                <el-input 
                  v-model="generateForm.remark" 
                  placeholder="请输入备注（可选）"
                  maxlength="50"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item label="生成数量">
                <el-input-number 
                  v-model="generateForm.count" 
                  :min="1" 
                  :max="10"
                  placeholder="生成数量"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleGenerateCode" :loading="generating">
                  生成注册码
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <el-divider />

          <!-- 我的注册码列表 -->
          <div class="codes-list-section">
            <div class="section-header">
              <h4>我的注册码</h4>
              <el-button 
                size="small" 
                @click="handleRefreshCodes"
                :loading="loadingCodes"
                :icon="RefreshIcon"
              >
                刷新
              </el-button>
            </div>

            <el-table 
              :data="myCodesList" 
              v-loading="loadingCodes"
              style="width: 100%; margin-top: 16px;"
              empty-text="暂无注册码"
            >
              <el-table-column prop="code" label="注册码" min-width="200">
                <template #default="{ row }">
                  <div class="code-cell">
                    <span>{{ row }}</span>
                    <el-button 
                      size="small" 
                      text 
                      @click="handleCopyCode(row)"
                      :icon="CopyDocumentIcon"
                    >
                      复制
                    </el-button>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" align="center">
                <template #default="{ row }">
                  <el-button 
                    size="small" 
                    type="danger" 
                    text
                    @click="handleDeleteCode(row)"
                  >
                    删除
                  </el-button>
                  <el-button 
                    size="small" 
                    text
                    @click="handleViewCodeInfo(row)"
                  >
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-tab-pane>

      <!-- 账号设置 -->
      <el-tab-pane label="账号设置" name="account">
        <el-form :model="accountForm" :rules="accountRules" ref="accountFormRef" label-width="100px">
          <el-form-item label="当前用户">
            <el-input v-model="userStore.username" disabled />
          </el-form-item>

          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="accountForm.nickname" placeholder="请输入昵称" />
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <el-input v-model="accountForm.email" placeholder="请输入邮箱" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleUpdateProfile">
              保存信息
            </el-button>
          </el-form-item>

          <el-divider />

          <el-form-item label="修改密码">
            <el-button @click="showPasswordDialog = true">
              修改密码
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 关于 -->
      <el-tab-pane label="关于" name="about">
        <div class="about-content">
          <div class="about-item">
            <h3>Cookbook AI</h3>
            <p>版本: 1.0.0</p>
          </div>
          
          <div class="about-item">
            <h4>技术栈</h4>
            <p>Vue 3 + Element Plus + Pinia</p>
          </div>

          <div class="about-item">
            <h4>功能特性</h4>
            <ul>
              <li>智能对话 - 支持 Agent 和 Ask 两种模式</li>
              <li>会话管理 - 多会话切换和历史记录</li>
              <li>流式响应 - SSE 实时流式输出</li>
              <li>用户系统 - 完整的用户认证和管理</li>
            </ul>
          </div>

          <div class="about-item">
            <el-button type="primary" link @click="handleFeedback">
              反馈建议
            </el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="showPasswordDialog"
      title="修改密码"
      width="400px"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form
        :model="passwordForm"
        :rules="passwordRules"
        ref="passwordFormRef"
        label-width="80px"
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            show-password
            placeholder="请输入旧密码"
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
            placeholder="请确认新密码"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="handleChangePassword">
          确定
        </el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, h } from 'vue'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { useChatStore } from '@/stores/chat'
import { updateUserInfo, changePassword } from '@/api/user'
import { 
  generateRegisterCode, 
  getMyRegisterCodes, 
  removeRegisterCode,
  getRegisterCodeInfo 
} from '@/api/registerCode'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh as RefreshIcon, CopyDocument as CopyDocumentIcon } from '@element-plus/icons-vue'

const appStore = useAppStore()
const userStore = useUserStore()
const chatStore = useChatStore()

const activeTab = ref('basic')
const showPasswordDialog = ref(false)
const accountFormRef = ref(null)
const passwordFormRef = ref(null)

// 注册码相关状态
const generating = ref(false)
const loadingCodes = ref(false)
const myCodesList = ref([])

// 生成注册码表单
const generateForm = reactive({
  remark: '',
  count: 1
})

// 设置表单
const settingsForm = reactive({
  theme: appStore.theme,
  language: appStore.language,
  defaultMode: chatStore.chatMode
})

// 账号表单
const accountForm = reactive({
  nickname: userStore.userInfo?.nickname || '',
  email: userStore.userInfo?.email || ''
})

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 监听用户信息变化
watch(() => userStore.userInfo, (newVal) => {
  if (newVal) {
    accountForm.nickname = newVal.nickname || ''
    accountForm.email = newVal.email || ''
  }
}, { immediate: true })

// 账号表单验证规则
const accountRules = {
  nickname: [
    { max: 20, message: '昵称长度不能超过 20 个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

// 密码表单验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 主题切换
const handleThemeChange = (theme) => {
  appStore.setTheme(theme)
  ElMessage.success('主题已更新')
}

// 语言切换
const handleLanguageChange = (language) => {
  appStore.setLanguage(language)
  ElMessage.success('语言已更新')
}

// 默认模式切换
const handleDefaultModeChange = (mode) => {
  chatStore.setChatMode(mode)
  ElMessage.success('默认模式已更新')
}

// 更新个人信息
const handleUpdateProfile = async () => {
  try {
    const valid = await accountFormRef.value.validate()
    if (!valid) return

    const res = await updateUserInfo(accountForm)
    if (res.code === 200) {
      userStore.updateUserInfo(res.data)
      ElMessage.success('信息更新成功')
    }
  } catch (error) {
    console.error('更新失败:', error)
    // 错误提示已在 request.js 响应拦截器中统一处理，此处不需要重复提示
  }
}

// 修改密码
const handleChangePassword = async () => {
  try {
    const valid = await passwordFormRef.value.validate()
    if (!valid) return

    const res = await changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword
    })
    
    if (res.code === 200) {
      ElMessage.success('密码修改成功，请重新登录')
      showPasswordDialog.value = false
      // 重置表单
      passwordForm.oldPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
      // 登出
      setTimeout(() => {
        userStore.logout()
        location.reload()
      }, 1500)
    }
  } catch (error) {
    console.error('修改密码失败:', error)
    // 错误提示已在 request.js 响应拦截器中统一处理，此处不需要重复提示
  }
}

// 反馈建议
const handleFeedback = () => {
  ElMessage.info('反馈功能开发中，敬请期待')
}

// 生成注册码
const handleGenerateCode = async () => {
  try {
    generating.value = true
    const res = await generateRegisterCode({
      remark: generateForm.remark || '',
      count: generateForm.count
    })
    
    if (res.code === 200) {
      ElMessage.success('注册码生成成功')
      
      // 显示生成的注册码
      const codes = res.data.codes || [res.data.code]
      const codeText = codes.join('\n')
      
      ElMessageBox.alert(
        h('div', { style: 'word-break: break-all; white-space: pre-wrap;' }, codeText),
        '生成成功',
        {
          confirmButtonText: '复制',
          callback: () => {
            navigator.clipboard.writeText(codeText)
            ElMessage.success('已复制到剪贴板')
          }
        }
      )
      
      // 清空表单
      generateForm.remark = ''
      generateForm.count = 1
      
      // 刷新列表
      handleRefreshCodes()
    }
  } catch (error) {
    console.error('生成注册码失败:', error)
    // 错误提示已在 request.js 响应拦截器中统一处理，此处不需要重复提示
  } finally {
    generating.value = false
  }
}

// 刷新注册码列表
const handleRefreshCodes = async () => {
  try {
    loadingCodes.value = true
    const res = await getMyRegisterCodes()
    
    if (res.code === 200) {
      myCodesList.value = res.data || []
    }
  } catch (error) {
    console.error('获取注册码列表失败:', error)
    // 错误提示已在 request.js 响应拦截器中统一处理，此处不需要重复提示
  } finally {
    loadingCodes.value = false
  }
}

// 复制注册码
const handleCopyCode = (code) => {
  navigator.clipboard.writeText(code)
  ElMessage.success('已复制到剪贴板')
}

// 删除注册码
const handleDeleteCode = async (code) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个注册码吗？删除后将无法恢复。',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const res = await removeRegisterCode(code)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      handleRefreshCodes()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除注册码失败:', error)
      // 错误提示已在 request.js 响应拦截器中统一处理，此处不需要重复提示
    }
  }
}

// 查看注册码详情
const handleViewCodeInfo = async (code) => {
  try {
    const res = await getRegisterCodeInfo(code)
    if (res.code === 200 && res.data) {
      const info = res.data
      const expireTime = info.expireTime ? Math.floor(info.expireTime / 1000) : 0
      const hours = Math.floor(expireTime / 3600)
      const minutes = Math.floor((expireTime % 3600) / 60)
      
      ElMessageBox.alert(
        h('div', [
          h('p', `注册码: ${code}`),
          h('p', `备注: ${info.remark || '无'}`),
          h('p', `剩余有效时间: ${hours}小时${minutes}分钟`),
          h('p', `状态: ${info.used ? '已使用' : '未使用'}`)
        ]),
        '注册码详情',
        {
          confirmButtonText: '关闭'
        }
      )
    }
  } catch (error) {
    console.error('获取注册码详情失败:', error)
    // 错误提示已在 request.js 响应拦截器中统一处理，此处不需要重复提示
  }
}

// 监听标签切换，自动加载注册码列表
watch(activeTab, (newTab) => {
  if (newTab === 'registerCode') {
    handleRefreshCodes()
  }
})
</script>

<style scoped lang="scss">
:deep(.el-dialog__body) {
  padding: 20px;
}

.register-code-panel {
  .generate-section {
    padding: 16px;
    background: var(--el-fill-color-light);
    border-radius: 8px;
  }

  .codes-list-section {
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
        color: var(--text-primary);
      }
    }

    .code-cell {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      span {
        font-family: 'Courier New', monospace;
        font-size: 13px;
      }
    }
  }
}

.about-content {
  padding: 20px 0;

  .about-item {
    margin-bottom: 24px;

    h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    h4 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 500;
      color: var(--text-primary);
    }

    p {
      margin: 0;
      color: var(--text-regular);
      font-size: 14px;
    }

    ul {
      margin: 8px 0;
      padding-left: 20px;
      color: var(--text-regular);
      font-size: 14px;

      li {
        margin: 4px 0;
      }
    }
  }
}
</style>

