<script setup>
import { ref } from 'vue'
import { fileToDataUrl } from '../store/familySpace.js'

const props = defineProps({
  type: { type: String, required: true }, // member | photo | document | anecdote | video | event | edit-member
  initial: { type: Object, default: null },
})
const emit = defineEmits(['close', 'submit'])

const titles = {
  member: 'Ajouter un membre',
  photo: 'Ajouter une photo',
  document: 'Ajouter un document',
  anecdote: 'Ajouter une anecdote',
  video: 'Ajouter une vidéo',
  event: 'Ajouter un événement',
  'edit-member': 'Modifier les informations',
}

const init = props.initial ?? {}
const name = ref(init.name ?? '')
const years = ref(init.years ?? '')
const place = ref(init.place ?? init.birthPlace ?? '')
const profession = ref(init.profession ?? '')
const spouse = ref(init.spouseInfo?.name ?? init.spouse ?? '')
const bio = ref(init.bio ?? '')
const caption = ref('')
const title = ref('')
const author = ref('')
const text = ref('')
const period = ref('')
const docType = ref('Document')
const file = ref(null)
const fileName = ref('')
const submitting = ref(false)
const error = ref('')

function onFile(e) {
  file.value = e.target.files[0] ?? null
  fileName.value = file.value?.name ?? ''
}

async function submit() {
  error.value = ''
  submitting.value = true
  try {
    if (props.type === 'member') {
      if (!name.value.trim()) { error.value = 'Le nom est requis.'; return }
      const photo = file.value ? await fileToDataUrl(file.value) : null
      emit('submit', { name: name.value, years: years.value || '—', place: place.value || '—', photo })
    } else if (props.type === 'edit-member') {
      if (!name.value.trim()) { error.value = 'Le nom est requis.'; return }
      const photo = file.value ? await fileToDataUrl(file.value) : init.photo
      emit('submit', {
        name: name.value, years: years.value || '—', place: place.value || '—',
        profession: profession.value || null, spouse: spouse.value || null, bio: bio.value || init.bio, photo,
      })
    } else if (props.type === 'photo') {
      if (!file.value) { error.value = 'Choisissez une photo.'; return }
      const src = await fileToDataUrl(file.value)
      emit('submit', { src, caption: caption.value || 'Photo de famille', year: new Date().getFullYear() })
    } else if (props.type === 'document') {
      if (!file.value) { error.value = 'Choisissez un fichier.'; return }
      const src = await fileToDataUrl(file.value)
      emit('submit', { src, title: title.value || fileName.value, year: new Date().getFullYear(), type: docType.value })
    } else if (props.type === 'anecdote') {
      if (!title.value.trim() || !text.value.trim()) { error.value = 'Titre et texte sont requis.'; return }
      const audio = file.value ? await fileToDataUrl(file.value) : null
      emit('submit', { title: title.value, author: author.value || 'Vous', text: text.value, audio })
    } else if (props.type === 'video') {
      if (!file.value) { error.value = 'Choisissez une vidéo.'; return }
      const src = await fileToDataUrl(file.value)
      emit('submit', { src, title: title.value || fileName.value })
    } else if (props.type === 'event') {
      if (!period.value.trim() || !text.value.trim()) { error.value = 'Date et description sont requises.'; return }
      emit('submit', { period: period.value, text: text.value })
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-head">
        <h3>{{ titles[type] }}</h3>
        <button type="button" class="modal-close" @click="$emit('close')">✕</button>
      </div>

      <form class="modal-form" @submit.prevent="submit">
        <template v-if="type === 'member'">
          <label class="login-label">Nom complet</label>
          <input class="login-input" v-model="name" type="text" placeholder="Ex. Adjovi Houédji">
          <label class="login-label">Années (naissance - décès)</label>
          <input class="login-input" v-model="years" type="text" placeholder="Ex. 1955 - présent">
          <label class="login-label">Lieu</label>
          <input class="login-input" v-model="place" type="text" placeholder="Ex. Cotonou">
          <label class="login-label">Photo (optionnel)</label>
          <input class="login-input" type="file" accept="image/*" @change="onFile">
        </template>

        <template v-else-if="type === 'edit-member'">
          <label class="login-label">Nom complet</label>
          <input class="login-input" v-model="name" type="text">
          <label class="login-label">Années (naissance - décès)</label>
          <input class="login-input" v-model="years" type="text" placeholder="Ex. 1955 - présent">
          <label class="login-label">Lieu</label>
          <input class="login-input" v-model="place" type="text">
          <label class="login-label">Profession</label>
          <input class="login-input" v-model="profession" type="text">
          <label class="login-label">Conjoint(e)</label>
          <input class="login-input" v-model="spouse" type="text" placeholder="Laisser vide si aucun">
          <label class="login-label">À propos</label>
          <textarea class="login-input" v-model="bio" rows="3"></textarea>
          <label class="login-label">Nouvelle photo (optionnel)</label>
          <input class="login-input" type="file" accept="image/*" @change="onFile">
        </template>

        <template v-else-if="type === 'photo'">
          <label class="login-label">Photo</label>
          <input class="login-input" type="file" accept="image/*" @change="onFile" required>
          <label class="login-label">Légende</label>
          <input class="login-input" v-model="caption" type="text" placeholder="Ex. Réunion familiale à Cotonou">
        </template>

        <template v-else-if="type === 'document'">
          <label class="login-label">Fichier (image du document)</label>
          <input class="login-input" type="file" accept="image/*" @change="onFile" required>
          <label class="login-label">Titre</label>
          <input class="login-input" v-model="title" type="text" placeholder="Ex. Acte de naissance">
          <label class="login-label">Type</label>
          <select class="login-input" v-model="docType">
            <option>Photo</option>
            <option>Lettre</option>
            <option>Acte</option>
            <option>Document</option>
            <option>Objet</option>
          </select>
        </template>

        <template v-else-if="type === 'anecdote'">
          <label class="login-label">Titre</label>
          <input class="login-input" v-model="title" type="text" placeholder="Ex. Le départ de Grand-père vers Cotonou">
          <label class="login-label">Racontée par</label>
          <input class="login-input" v-model="author" type="text" placeholder="Ex. Mathieu Houédji">
          <label class="login-label">Récit</label>
          <textarea class="login-input" v-model="text" rows="4" placeholder="Racontez le souvenir…"></textarea>
          <label class="login-label">Enregistrement audio (optionnel)</label>
          <input class="login-input" type="file" accept="audio/*" @change="onFile">
        </template>

        <template v-else-if="type === 'video'">
          <label class="login-label">Fichier vidéo</label>
          <input class="login-input" type="file" accept="video/*" @change="onFile" required>
          <label class="login-label">Titre</label>
          <input class="login-input" v-model="title" type="text" placeholder="Ex. Témoignage de Maman Victoire">
        </template>

        <template v-else-if="type === 'event'">
          <label class="login-label">Date ou période</label>
          <input class="login-input" v-model="period" type="text" placeholder="Ex. 1995 ou Années 2000">
          <label class="login-label">Description</label>
          <textarea class="login-input" v-model="text" rows="3" placeholder="Que s'est-il passé ?"></textarea>
        </template>

        <p v-if="error" class="login-error">{{ error }}</p>

        <button class="btn btn-yellow login-submit" type="submit" :disabled="submitting">
          {{ submitting ? 'Enregistrement…' : (type === 'edit-member' ? 'Enregistrer' : 'Ajouter') }}
        </button>
      </form>
    </div>
  </div>
</template>
