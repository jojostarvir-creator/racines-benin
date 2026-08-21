<script setup>
import { computed } from 'vue'
import { slugify } from '../data/familyDirectory.js'

const props = defineProps({
  family: { type: Object, required: true }
})

const to = computed(() => `/famille/${slugify(props.family.name)}`)
</script>

<template>
  <RouterLink :to="to" class="card">
    <div class="card-img">
      <img :src="family.img" :alt="family.alt">
      <span class="badge">{{ family.badge }}</span>
    </div>
    <div class="card-body">
      <div class="origin">{{ family.origin }}</div>
      <h3>{{ family.name }}</h3>
      <p>{{ family.desc }}</p>
    </div>
  </RouterLink>
</template>
