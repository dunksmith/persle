import Vue from 'vue'
import Router from 'vue-router'
import Persle from '@/components/Persle'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Persle',
      component: Persle
    },
  ]
})
