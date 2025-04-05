<template>
    <div class="login flex-center wh-full relative overflow-scroll">
      <!-- 登录页头部 -->
      <div class="flex-x-end absolute top-0 w-full p-4">
        <el-switch v-model="isDark" inline-prompt active-icon="Moon" inactive-icon="Sunny" @change="toggleTheme" />
        <lang-select class="ml-2 cursor-pointer" />
      </div>
      <!-- 登录页内容 -->
      <div class="flex-center relative pb-5">
        <h2>vue3-element-admin</h2>
        <el-dropdown class="absolute! right-0">
          <div class="cursor-pointer">
            <el-icon><arrow-down /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <el-tag>2.25.1</el-tag>
              </el-dropdown-item>
              <el-dropdown-item>超级管理员: root/123456</el-dropdown-item>
              <el-dropdown-item>系统管理员: admin/123456</el-dropdown-item>
              <el-dropdown-item>测试小游客: test/123456</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <el-form ref="loginFormRef" :model="loginFormData" :rules="loginRules" size="large">
        <el-form-item>
          <el-input v-model="loginFormData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="loginFormData.password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="loginFormData.captchaCode" placeholder="请输入验证码" />
        </el-form-item>
        <!-- 验证码 -->
        <el-form-item prop="captchaCode">
          <div flex>
            <el-input v-model.trim="loginFormData.captchaCode">
              <template #prefix>
                <div class="i-svg:captcha" />
              </template>
            </el-input>
            <div cursor-pointer h="[40px]" w="[120px]" flex-center ml-10px @click="getCaptcha">
              <el-icon v-if="codeLoading" class="is-loading">
                <Loading />
              </el-icon>
              <img v-else object-cover border-rd-4px p-1px shadow="[0_0_0_1px_var(--el-border-color)_inset]"
                :src="captchaBase64" alt="code" />
            </div>
          </div>
        </el-form-item>
        <div class="flex-x-between w-full">
          <el-checkbox v-model="loginFormData.rememberMe" label="记住我" />
          <el-link type="primary" :underline="false">
            忘记密码
          </el-link>
        </div>
  
        <!-- 登录按钮 -->
        <el-form-item>
          <el-button type="primary" class="w-full" @click="handleLoginSubmit">登录</el-button>
        </el-form-item>
      </el-form>
      <!-- 登录页底部 -->
      <el-text size="small" class="py-2.5! fixed bottom-0 text-center">
        Copyright © 2021 - 2025 youlai.tech All Rights Reserved.
        <a href="http://beian.miit.gov.cn/" target="_blank">皖ICP备20006496号-2</a>
      </el-text>
      <div flex-center gap-10px>
        <el-text size="default">没有账号？</el-text>
        <el-link type="primary" :underline="false" @click="toOtherForm('register')">
          立即注册
        </el-link>
      </div>
      <!-- 第三方登录 -->
      <el-divider>
        <el-text size="small">第三方登录</el-text>
      </el-divider>
      <div class="flex-center gap-x-5 w-full text-[var(--el-text-color-secondary)]">
        <CommonWrapper>
          <div text-20px class="i-svg:wechat" />
        </CommonWrapper>
        <CommonWrapper>
          <div text-20px cursor-pointer class="i-svg:qq" />
        </CommonWrapper>
        <CommonWrapper>
          <div text-20px cursor-pointer class="i-svg:github" />
        </CommonWrapper>
        <CommonWrapper>
          <div text-20px cursor-pointer class="i-svg:gitee" />
        </CommonWrapper>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import AuthAPI, { type LoginFormData } from "../../api/auth";
  import { ElMessage, type FormInstance } from 'element-plus';
  import { LocationQuery, RouteLocationRaw, useRoute, useRouter } from 'vue-router';
  import { useUserStore } from '../../store/modules/user';
  import CommonWrapper from '../../components/CommonWrapper/index.vue';
  
  const isDark = ref(false)
  const captchaBase64 = ref('')
  
  const loginFormData = ref<LoginFormData>({
    username: '',
    password: '',
    captchaKey: '',
    captchaCode: '',
    rememberMe: false,
  })
  
  const loginFormRef = ref<FormInstance>();
  const router = useRouter();
  const route = useRoute();
  // 获取验证码
  const codeLoading = ref(false);
  const loading = ref(false); // 按钮 loading 状态
  
  const loginRules = computed(() => {
    return {
      username: [
        {
          required: true,
          trigger: "change",
          message: "请输入用户名",
        },
      ],
      password: [
        {
          required: true,
          trigger: "change",
          message: "请输入密码",
        },
        {
          min: 6,
          message: "密码长度不能小于6位",
          trigger: "blur",
        },
      ],
      captchaKey: [
        {
          required: true,
          trigger: "change",
          message: "请输入验证码",
        },
      ],
    };
  });
  
  const toggleTheme = () => {
    isDark.value = !isDark.value
  }
  // 登录提交处理
  const handleLoginSubmit = async  () => {
    try {
      const valid = await loginFormRef.value?.validate();
      if (!valid) return;
      loading.value = true;
      await useUserStore().login(loginFormData.value);
      // TODO:获取用户信息
      // await useUserStore().getUserInfo();
      ElMessage.success("登录成功");
      // TODO:跳转没看懂
      const redirect = resolveRedirectTarget(route.query);
      await router.push(redirect);
    } catch (error: unknown) {
      getCaptcha();
      console.error("登录失败:", error);
    } finally {
      loading.value = false;
    }
  }
  
  const resolveRedirectTarget = (query: LocationQuery): RouteLocationRaw => {
    // 默认跳转路径
    const defaultPath = "/";
    // 获取原始重定向路径
    const rawRedirect = (query.redirect as string) || defaultPath;
    try {
      const resolved = router.resolve(rawRedirect);
      return {
        path: resolved.path,
        query: resolved.query,
      }
    }catch{
      return {
        path: defaultPath,
        query: {},
      }
    }
  }
  
  const getCaptcha = async () => {
    codeLoading.value = true;
    try {
      const res = await AuthAPI.getCaptcha();
      loginFormData.value.captchaKey = res.captchaKey;
      captchaBase64.value = res.captchaBase64;
    } catch (err) {
      console.error(err);
    } finally {
      codeLoading.value = false;
    }
  }
  
  const toOtherForm = (type: string) => {
    router.push({
      path: `/${type}`,
      query: {
        redirect: route.fullPath,
      },
    });
  };
  onMounted(() => {
    getCaptcha()
  })
  </script>
  <style lang="scss" scoped>
  .login {
    background: url("@/assets/images/login-bg.jpg") no-repeat center right;
  }
  
  html.dark {
    .login {
      background: url("@/assets/images/login-bg-dark.jpg") no-repeat center right;
  
      .el-card {
        background: transparent;
      }
    }
  }
  
  .el-form-item {
    margin-bottom: 20px;
  }
  
  :deep(.el-input) {
    height: 48px;
  
    .el-input__wrapper {
      padding: 1px 10px;
    }
  }
  </style>
  