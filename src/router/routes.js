
const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/IndexPage.vue") }],
  },
  {
    path: '/popup',
    component: () => import("layouts/PopupLayout.vue"),
    children: [{path: "", component: () => import("pages/Popup.vue")}],
  },
  {
    path: '/IndexBackup',
    component: () => import("layouts/MainLayout.vue"),
    children: [{path: "", component: () => import("pages/IndexPage_backup.vue")}],
  },
  {
    path: "/Test",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/TestPages.vue") }],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
