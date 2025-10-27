<template>
  <el-dialog
    v-model="visible"
    title="个人信息"
    width="600px"
    :before-close="handleClose"
  >
    <div class="profile-content">
      <!-- 用户基本信息 -->
      <el-descriptions :column="1" border>
        <el-descriptions-item label="用户ID">
          {{ tokenInfo?.userId || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="用户名">
          {{ tokenInfo?.username || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="昵称">
          {{ tokenInfo?.nickname || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="角色">
          <el-tag :type="getRoleType(tokenInfo?.role)">
            {{ getRoleText(tokenInfo?.role) }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <!-- Token 使用率仪表盘 -->
      <div class="token-dashboard">
        <h3 class="dashboard-title">Token 使用情况</h3>
        <div ref="chartRef" class="chart-container"></div>
        <div class="token-details">
          <div class="token-item">
            <span class="label">已使用:</span>
            <span class="value">{{ formatNumber(tokenInfo?.usedToken) }}</span>
          </div>
          <div class="token-item">
            <span class="label">总额度:</span>
            <span class="value">{{ formatNumber(tokenInfo?.totalToken) }}</span>
          </div>
          <div class="token-item">
            <span class="label">剩余:</span>
            <span class="value remaining">{{ formatNumber(remainingToken) }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { getUserTokenInfo } from '@/api/user'
import { ElMessage } from 'element-plus'

const visible = ref(false)
const chartRef = ref(null)
const tokenInfo = ref(null)
let chartInstance = null

// 计算剩余 Token
const remainingToken = computed(() => {
  if (!tokenInfo.value) return 0
  const used = parseInt(tokenInfo.value.usedToken) || 0
  const total = parseInt(tokenInfo.value.totalToken) || 0
  return total - used
})

// 计算使用率
const usageRate = computed(() => {
  if (!tokenInfo.value) return 0
  const used = parseInt(tokenInfo.value.usedToken) || 0
  const total = parseInt(tokenInfo.value.totalToken) || 0
  if (total === 0) return 0
  return ((used / total) * 100).toFixed(2)
})

// 格式化数字
const formatNumber = (num) => {
  if (!num) return '0'
  return parseInt(num).toLocaleString()
}

// 获取角色类型
const getRoleType = (role) => {
  const typeMap = {
    'ADMIN': 'danger',
    'VIP_USER': 'success',
    'FREE_USER': 'info'
  }
  return typeMap[role] || 'info'
}

// 获取角色文本
const getRoleText = (role) => {
  const textMap = {
    'ADMIN': '管理员',
    'VIP_USER': 'VIP用户',
    'FREE_USER': '免费用户'
  }
  return textMap[role] || '用户'
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  
  // 销毁旧实例
  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(chartRef.value)
  
  const option = {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        center: ['50%', '75%'],
        radius: '90%',
        splitNumber: 10,
        axisLine: {
          lineStyle: {
            width: 30,
            color: [
              [0.3, '#67C23A'],
              [0.7, '#E6A23C'],
              [1, '#F56C6C']
            ]
          }
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '12%',
          width: 20,
          offsetCenter: [0, '-60%'],
          itemStyle: {
            color: 'auto'
          }
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: 'auto',
            width: 2
          }
        },
        splitLine: {
          length: 20,
          lineStyle: {
            color: 'auto',
            width: 5
          }
        },
        axisLabel: {
          color: '#464646',
          fontSize: 14,
          distance: -60,
          formatter: function (value) {
            return value + '%'
          }
        },
        title: {
          offsetCenter: [0, '-20%'],
          fontSize: 18,
          color: '#464646'
        },
        detail: {
          fontSize: 32,
          offsetCenter: [0, '0%'],
          valueAnimation: true,
          formatter: function (value) {
            return value.toFixed(2) + '%'
          },
          color: 'auto'
        },
        data: [
          {
            value: parseFloat(usageRate.value),
            name: 'Token 使用率'
          }
        ]
      }
    ]
  }

  chartInstance.setOption(option)
}

// 更新图表数据
const updateChart = () => {
  if (chartInstance) {
    chartInstance.setOption({
      series: [
        {
          data: [
            {
              value: parseFloat(usageRate.value),
              name: 'Token 使用率'
            }
          ]
        }
      ]
    })
  }
}

// 获取 Token 信息
const fetchTokenInfo = async () => {
  try {
    const response = await getUserTokenInfo()
    if (response.code === 200) {
      tokenInfo.value = response.data
      await nextTick()
      if (visible.value) {
        initChart()
      }
    } else {
      ElMessage.error(response.message || '获取Token信息失败')
    }
  } catch (error) {
    ElMessage.error('获取Token信息失败')
    console.error('获取Token信息失败:', error)
  }
}

// 打开对话框
const open = async () => {
  visible.value = true
  await fetchTokenInfo()
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
}

// 监听对话框显示状态
watch(visible, async (newVal) => {
  if (newVal) {
    await nextTick()
    initChart()
  }
})

// 监听使用率变化
watch(usageRate, () => {
  if (visible.value && chartInstance) {
    updateChart()
  }
})

// 组件卸载时销毁图表
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
})

defineExpose({
  open
})
</script>

<style scoped lang="scss">
.profile-content {
  padding: 10px 0;

  .token-dashboard {
    margin-top: 24px;

    .dashboard-title {
      font-size: 16px;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 16px;
      padding-left: 8px;
      border-left: 3px solid var(--el-color-primary);
    }

    .chart-container {
      width: 100%;
      height: 300px;
      margin-bottom: 20px;
    }

    .token-details {
      display: flex;
      justify-content: space-around;
      padding: 20px;
      background: var(--bg-secondary, #f5f7fa);
      border-radius: 8px;

      .token-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;

        .label {
          font-size: 14px;
          color: var(--text-secondary, #909399);
        }

        .value {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary, #303133);

          &.remaining {
            color: var(--el-color-success);
          }
        }
      }
    }
  }
}
</style>

