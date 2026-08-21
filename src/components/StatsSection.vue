<script setup>
const stats = [
  { value: '312', label: 'Familles documentées' },
  { value: '1 840', label: 'Récits oraux collectés' },
  { value: '9', label: 'Générations retracées en moyenne' },
  { value: '54', label: 'Communes couvertes' },
]
</script>

<template>
  <section class="section" id="statistiques">
    <div class="container">
      <div class="stats">
        <div class="stat" v-for="stat in stats" :key="stat.label">
          <b>{{ stat.value }}</b><span>{{ stat.label }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
