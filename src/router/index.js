import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import(/* webpackChunkName: "home" */ '../views/Home.vue')
    },
    {
        path: '/account/:id',
        name: 'Home',
        component: () => import(/* webpackChunkName: "account" */ '../views/AccountShow.vue')
    },
    {
        path: '/tx/:id',
        name: 'Home',
        component: () => import(/* webpackChunkName: "transaction" */ '../views/TransactionShow.vue')
    },
    {
        path: "*",
        redirect: "/"
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router
