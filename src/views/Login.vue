<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1 class="title">Cookbook AI</h1>
        <p class="subtitle">智能菜谱问答助手</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="loginForm.rememberMe">
            记住我
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>

        <div class="login-footer">
          <span>还没有账号？</span>
          <el-link type="primary" @click="goToRegister">立即注册</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: 'newuser',
  password: '123456',
  rememberMe: false
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return

    loading.value = true
    await userStore.login(loginForm)
    
    ElMessage.success('登录成功')
    
    // 跳转到之前的页面或首页
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (error) {
    console.error('登录失败:', error)
    // 错误提示已在 request.js 响应拦截器中统一处理，此处不需要重复提示
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;

  // 背景装饰
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: backgroundMove 20s linear infinite;
  }
}

@keyframes backgroundMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

.login-box {
  width: 100%;
  max-width: 440px;
  padding: 48px 40px;
  position: relative;
  z-index: 1;
  
  // 玻璃拟态效果
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.2),
    0 2px 8px rgba(0, 0, 0, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.4);
  
  // 高光效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(255, 255, 255, 0.6) 50%, 
      transparent
    );
    border-radius: 24px 24px 0 0;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 40px;

  .title {
    font-size: 32px;
    font-weight: 700;
    background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 12px 0;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 10px rgba(255, 255, 255, 0.3);
  }

  .subtitle {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.85);
    margin: 0;
    font-weight: 400;
  }
}

.login-form {
  // 输入框样式
  :deep(.el-form-item) {
    margin-bottom: 24px;
  }

  :deep(.el-input__wrapper) {
    padding: 14px 18px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 16px;
    box-shadow: 
      0 4px 12px rgba(0, 0, 0, 0.1),
      inset 0 1px 2px rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.9);
      border-color: rgba(255, 255, 255, 0.6);
      box-shadow: 
        0 6px 16px rgba(0, 0, 0, 0.15),
        inset 0 1px 2px rgba(255, 255, 255, 0.9);
    }

    &.is-focus {
      background: rgba(255, 255, 255, 0.95);
      border-color: rgba(255, 255, 255, 0.7);
      box-shadow: 
        0 8px 20px rgba(0, 0, 0, 0.2),
        inset 0 1px 2px rgba(255, 255, 255, 1),
        0 0 0 3px rgba(255, 255, 255, 0.15);
    }
  }

  :deep(.el-input__inner) {
    color: #333333;
    font-weight: 500;
    
    &::placeholder {
      color: rgba(0, 0, 0, 0.35);
      font-weight: 400;
    }
  }

  :deep(.el-input__prefix),
  :deep(.el-input__suffix) {
    color: rgba(0, 0, 0, 0.5);
  }

  // 复选框样式
  :deep(.el-checkbox) {
    .el-checkbox__label {
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
    }

    .el-checkbox__inner {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.4);
      border-radius: 6px;
    }

    &.is-checked .el-checkbox__inner {
      background: rgba(255, 255, 255, 0.9);
      border-color: rgba(255, 255, 255, 0.9);
    }
  }

  // 登录按钮
  .login-button {
    width: 100%;
    height: 52px;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.5px;
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%);
    border: 1px solid rgba(255, 255, 255, 0.5);
    color: #667eea;
    box-shadow: 
      0 6px 20px rgba(0, 0, 0, 0.2),
      inset 0 1px 2px rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 
        0 8px 24px rgba(0, 0, 0, 0.25),
        inset 0 1px 2px rgba(255, 255, 255, 0.9);
      background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.95) 100%);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.2),
        inset 0 1px 2px rgba(255, 255, 255, 0.8);
    }

    &.is-disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .login-footer {
    text-align: center;
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    margin-top: 24px;

    span {
      margin-right: 8px;
      font-weight: 400;
    }

    :deep(.el-link) {
      color: #ffffff;
      font-weight: 600;
      text-decoration: none;
      padding: 4px 8px;
      border-radius: 8px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }
}
</style>

