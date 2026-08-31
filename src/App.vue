<script setup>
import { useRoute } from 'vue-router'
import TheHeader from './components/TheHeader.vue'
import TheFooter from './components/TheFooter.vue'
import DashboardHeader from './components/DashboardHeader.vue'

const route = useRoute()
</script>

<template>
  <template v-if="route.meta.layout === 'dashboard'">
    <DashboardHeader />
    <main>
      <RouterView />
    </main>
  </template>
  <template v-else>
    <TheHeader />
    <main>
      <RouterView />
    </main>
    <TheFooter />
  </template>
</template>
