<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <h1 class="title">注册账号</h1>
        <p class="subtitle">加入 Cookbook AI</p>
      </div>

      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="register-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            size="large"
            prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            size="large"
            prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item prop="nickname">
          <el-input
            v-model="registerForm.nickname"
            placeholder="请输入昵称（可选）"
            size="large"
            prefix-icon="Avatar"
            clearable
          />
        </el-form-item>

        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱（可选）"
            size="large"
            prefix-icon="Message"
            clearable
          />
        </el-form-item>

        <el-form-item prop="registerCode">
          <el-input
            v-model="registerForm.registerCode"
            placeholder="请输入注册码"
            size="large"
            prefix-icon="Ticket"
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="register-button"
            :loading="loading"
            @click="handleRegister"
          >
            注 册
          </el-button>
        </el-form-item>

        <div class="register-footer">
          <span>已有账号？</span>
          <el-link type="primary" @click="goToLogin">立即登录</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { register, checkUsername } from '@/api/user'
import { validateRegisterCode as validateRegisterCodeAPI } from '@/api/registerCode'
import { ElMessage } from 'element-plus'

const router = useRouter()
const registerFormRef = ref(null)
const loading = ref(false)

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  email: '',
  registerCode: ''
})

// 自定义验证规则
const validateUsername = async (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入用户名'))
  } else if (value.length < 3 || value.length > 20) {
    callback(new Error('用户名长度在 3 到 20 个字符'))
  } else {
    try {
      const res = await checkUsername(value)
      if (res.code === 200 && res.data === false) {
        callback(new Error('用户名已存在'))
      } else {
        callback()
      }
    } catch (error) {
      callback()
    }
  }
}

const validatePassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (value.length < 6 || value.length > 20) {
    callback(new Error('密码长度在 6 到 20 个字符'))
  } else {
    if (registerForm.confirmPassword !== '') {
      registerFormRef.value.validateField('confirmPassword')
    }
    callback()
  }
}

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请确认密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const validateEmail = (rule, value, callback) => {
  if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    callback(new Error('请输入正确的邮箱格式'))
  } else {
    callback()
  }
}

const validateRegisterCodeRule = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入注册码'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [{ validator: validateUsername, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
  email: [{ validator: validateEmail, trigger: 'blur' }],
  registerCode: [{ validator: validateRegisterCodeRule, trigger: 'blur' }]
}

const handleRegister = async () => {
  try {
    const valid = await registerFormRef.value.validate()
    if (!valid) return

    loading.value = true
    
    // 第一步：先验证并删除注册码
    const validateRes = await validateRegisterCodeAPI({ code: registerForm.registerCode })
    if (validateRes.code !== 200 || validateRes.data !== true) {
      ElMessage.error('注册码无效或已过期')
      loading.value = false
      return
    }

    // 第二步：注册码验证成功并已删除，继续进行用户注册
    const res = await register({
      username: registerForm.username,
      password: registerForm.password,
      confirmPassword: registerForm.confirmPassword,
      nickname: registerForm.nickname || registerForm.username,
      email: registerForm.email
    })
    
    if (res.code === 200) {
      ElMessage.success('注册成功，请登录')
      router.push('/login')
    }
  } catch (error) {
    console.error('注册失败:', error)
    // 错误提示已在 request.js 响应拦截器中统一处理，此处不需要重复提示
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped lang="scss">
.register-container {
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

.register-box {
  width: 100%;
  max-width: 460px;
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

.register-header {
  text-align: center;
  margin-bottom: 36px;

  .title {
    font-size: 28px;
    font-weight: 700;
    background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 10px 0;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 10px rgba(255, 255, 255, 0.3);
  }

  .subtitle {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.85);
    margin: 0;
    font-weight: 400;
  }
}

.register-form {
  // 输入框样式
  :deep(.el-form-item) {
    margin-bottom: 20px;
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

  // 注册按钮
  .register-button {
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
    margin-top: 8px;

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

  .register-footer {
    text-align: center;
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    margin-top: 20px;

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

