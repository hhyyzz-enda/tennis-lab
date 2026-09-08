import { createRouter, createWebHistory } from 'vue-router'

const TOPBAR_SCROLL_OFFSET = 90

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/my-tennis',
      name: 'my-tennis',
      component: () => import('../views/MyTennisView.vue')
    },
    {
      path: '/my-tennis/profile',
      name: 'my-tennis-profile',
      component: () => import('../views/MyTennisProfileView.vue')
    },
    {
      path: '/my-tennis/courses',
      name: 'my-tennis-courses',
      component: () => import('../views/MyTennisCoursesView.vue')
    },
    {
      path: '/ai-training-plan',
      name: 'ai-training-plan',
      component: () => import('../views/AiTrainingPlanView.vue')
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/AuthView.vue')
    },
    {
      path: '/tennis-origins',
      name: 'tennis-origins',
      component: () => import('../views/TennisOriginsView.vue')
    },
    {
      path: '/tennis-ai',
      name: 'tennis-ai-intro',
      component: () => import('../views/TennisAiIntroView.vue')
    },
    {
      path: '/tennis-ai/courses',
      name: 'tennis-ai-courses',
      component: () => import('../views/TennisAiCoursesView.vue')
    },
    {
      path: '/tennis-ai/courses/:slug',
      name: 'tennis-ai-course-detail',
      component: () => import('../views/TennisAiCourseDetailView.vue')
    },
    {
      path: '/tennis-resources',
      name: 'tennis-resources',
      component: () => import('../views/TennisResourcesView.vue')
    },
    {
      path: '/tennis-forum',
      name: 'tennis-forum',
      component: () => import('../views/TennisForumView.vue')
    },
    {
      path: '/tennis-forum/:id',
      name: 'tennis-forum-detail',
      component: () => import('../views/TennisForumDetailView.vue')
    },
    {
      path: '/premium-courses',
      name: 'premium-courses',
      component: () => import('../views/PremiumCoursesView.vue')
    },
    {
      path: '/premium-courses/:id',
      name: 'premium-course-detail',
      component: () => import('../views/PremiumCourseDetailView.vue')
    },
    {
      path: '/external-courses',
      name: 'external-courses',
      component: () => import('../views/ExternalCoursesView.vue')
    },
    {
      path: '/developing-letter',
      name: 'developing-letter',
      component: () => import('../views/DevelopingLetterView.vue')
    },
    {
      path: '/training-feedback/coaches',
      name: 'training-coaches',
      component: () => import('../views/TrainingCoachesView.vue')
    },
    {
      path: '/training-feedback/coaches/:id',
      name: 'training-coach-detail',
      component: () => import('../views/TrainingCoachDetailView.vue')
    },
    {
      path: '/messages',
      name: 'chat-messages',
      component: () => import('../views/ChatMessagesView.vue')
    },
    {
      path: '/messages/:contactId',
      name: 'chat-conversation',
      component: () => import('../views/ChatMessagesView.vue')
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      return {
        el: to.hash,
        top: TOPBAR_SCROLL_OFFSET,
        behavior: 'smooth'
      }
    }

    return { top: 0 }
  }
})

export default router
