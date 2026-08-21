<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getFamilyBySlug } from '../data/familyDirectory.js'
import { departmentData } from '../data/departments.js'

const route = useRoute()
const family = computed(() => getFamilyBySlug(route.params.slug))
const deptStories = computed(() => departmentData[family.value?.department]?.stories ?? [])
</script>

<template>
  <section v-if="family" class="section family-section">
    <div class="container">
      <RouterLink to="/recherche" class="back-link">← Chercher une autre famille</RouterLink>

      <article class="feature family-feature">
        <div class="feature-img">
          <img :src="family.image" :alt="`Famille ${family.name}`">
        </div>
        <div class="feature-body">
          <div class="eyebrow">Bienvenue</div>
          <h3>Famille {{ family.name }}</h3>
          <div class="origin">{{ family.tagline }}</div>
          <p class="desc">{{ family.description }}</p>
          <div class="meta">
            <div><small>Localité</small><strong>{{ family.locality }}</strong></div>
            <div><small>Origine</small><strong>{{ family.origin }}</strong></div>
            <div><small>Durée</small><strong>{{ family.duration }}</strong></div>
          </div>
          <div class="family-stats">
            <div><b>{{ family.generations }}</b><span>Générations retracées</span></div>
            <div><b>{{ family.members }}</b><span>Membres recensés</span></div>
          </div>
        </div>
      </article>

      <div class="family-timeline">
        <h2>Fil de la mémoire</h2>
        <div class="timeline-list">
          <div class="timeline-item" v-for="(event, i) in family.timeline" :key="i">
            <div class="timeline-dot"></div>
            <div>
              <small>{{ event[0] }}</small>
              <p>{{ event[1] }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="deptStories.length" class="family-related">
        <h2>Autres récits de {{ family.department }}</h2>
        <div class="dept-stories family-related-list">
          <RouterLink class="dept-story" v-for="story in deptStories" :key="story[0]" to="/recherche">
            <img :src="story[2]" :alt="story[0]">
            <div>
              <small>{{ story[1] }}</small>
              <h4>{{ story[0] }}</h4>
              <p>Découvrir le récit →</p>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>

  <section v-else class="section">
    <div class="container login-wrap">
      <div class="login-card">
        <div class="eyebrow">Famille introuvable</div>
        <h2>Cette famille n'existe pas dans notre base.</h2>
        <RouterLink class="btn btn-yellow login-submit" to="/recherche">Réessayer une recherche →</RouterLink>
      </div>
    </div>
  </section>
</template>
