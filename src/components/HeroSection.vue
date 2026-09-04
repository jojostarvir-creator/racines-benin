<script setup>
import { ref } from 'vue'

const lightboxOpen = ref(false)
const VIDEO_SRC = 'https://videos.pexels.com/video-files/33660358/14301889_3840_2160_24fps.mp4'
const POSTER = 'https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=1800&q=85'
</script>

<template>
  <section class="hero hero-fullbleed">
    <div class="container hero-split">
      <div class="hero-copy hero-copy-left">
        <h1>Et si vous découvriez<br><span class="accent">l'histoire</span> de votre famille&nbsp;?</h1>
        <p class="lead">Explorez les histoires, les origines et les traditions des familles béninoises. Une expérience pensée comme un croisement entre documentaire, encyclopédie, arbre généalogique et carte du patrimoine.</p>
        <div class="hero-actions">
          <a class="btn btn-yellow" href="#familles">Explorer les familles →</a>
          <a class="btn btn-light" href="#contribuer">Raconter mon histoire</a>
        </div>
        <div class="hero-note">
          <div><strong>Histoires vivantes</strong>Récits, archives et témoignages</div>
          <div><strong>12 territoires</strong>Un patrimoine à parcourir</div>
        </div>
      </div>

      <button type="button" class="hero-video-card" @click="lightboxOpen = true" aria-label="Voir le film d'ouverture">
        <video class="hero-video-preview" :poster="POSTER" autoplay muted loop playsinline aria-hidden="true">
          <source :src="VIDEO_SRC" type="video/mp4">
        </video>
        <span class="hero-video-scrim"></span>
        <span class="hero-video-play"></span>
        <span class="hero-video-caption">Voir le film d'ouverture · 01:42</span>
      </button>
    </div>

    <div v-if="lightboxOpen" class="modal-backdrop" @click.self="lightboxOpen = false">
      <div class="video-lightbox hero-video-lightbox">
        <button type="button" class="modal-close video-lightbox-close" @click="lightboxOpen = false">✕</button>
        <video class="hero-video-full" controls autoplay playsinline :poster="POSTER">
          <source :src="VIDEO_SRC" type="video/mp4">
        </video>
        <div class="video-lightbox-caption">
          <strong>Le film d'ouverture de Béninto</strong>
          <small>01:42</small>
        </div>
      </div>
    </div>
  </section>
</template>
