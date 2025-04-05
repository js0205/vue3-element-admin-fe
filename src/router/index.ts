import { createRouter, createWebHistory } from 'vue-router';


export const Layout = () => import('@/layout/index.vue');

//所有权限通用路由表 
//如首页和登录页和一些不用权限的公用页面
const constantRoutes = [
  { 
    path: '/login', 
    component: () => import('@/views/login/index.vue') 
  },
];

//异步挂载的路由
//动态需要根据权限加载的路由表 
const asyncRoutes = [
    {
        path: '/',
        component: Layout,
        redirect: '/dashboard',
        children: [
            { path: 'dashboard', component: () => import('@/views/dashboard/index.vue') },
        ]
    }
];

const routes = [...constantRoutes, ...asyncRoutes];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
