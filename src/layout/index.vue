<template>
    <div @click="logout">Layout</div>
</template>

<script setup lang="ts">
import AuthAPI from '@/api/auth';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/store/modules/user';

const router = useRouter();
const route = useRoute();
const logout = async () => {
    try {
       await ElMessageBox.confirm("确定注销并退出系统吗？", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
            lockScroll: false,
        })
        await useUserStore().logout();
        await router.push(`/login?redirect=${route.fullPath}`);
    }catch (error) {
        ElMessage.error(error.message);
    }
}
</script>
<style scoped>

</style>