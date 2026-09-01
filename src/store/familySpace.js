import { reactive } from 'vue'
import { buildFamilyTree, buildStoriesFeed, buildMemoriesFeed, buildTimelineFeed, buildDocumentsFeed } from '../data/familyProfileExtras.js'

const TREE_VERSION = 6

function storageKey(email) {
  return `racines_space_${email}`
}

function load(email) {
  try {
    const raw = localStorage.getItem(storageKey(email))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function persist(email, space) {
  localStorage.setItem(storageKey(email), JSON.stringify(space))
}

function seedFromFamily(family, extras) {
  const members = buildFamilyTree(family)

  const photos = extras.archives.filter((a) => a.category === 'Photo').map((a) => ({ id: crypto.randomUUID(), src: a.image, caption: a.title, year: a.year }))
  const documents = buildDocumentsFeed(family, extras, members).map((d) => ({ id: crypto.randomUUID(), ...d }))
  const stories = buildStoriesFeed(family, extras, members).map((s) => ({ id: crypto.randomUUID(), ...s }))
  const memories = buildMemoriesFeed(family, extras, members).map((m) => ({ id: crypto.randomUUID(), ...m }))
  const videos = []
  const timeline = buildTimelineFeed(family, extras, members).map((t) => ({ id: crypto.randomUUID(), ...t }))

  return { members, photos, documents, stories, memories, videos, timeline, treeVersion: TREE_VERSION }
}

const cache = new Map()

export function useFamilySpace(email, family, extras) {
  if (!cache.has(email)) {
    const existing = load(email)
    let space
    if (!existing || existing.treeVersion !== TREE_VERSION) {
      const fresh = seedFromFamily(family, extras)
      space = existing
        ? { ...fresh, photos: existing.photos, videos: existing.videos }
        : fresh
    } else {
      space = existing
    }
    cache.set(email, reactive(space))
    persist(email, space)
  }
  const space = cache.get(email)

  function save() {
    persist(email, space)
  }

  function addMember(member) {
    const founderId = space.members[0]?.id ?? null
    space.members.push({
      id: crypto.randomUUID(),
      parentId: member.parentId ?? founderId,
      generation: (space.members[0]?.generation ?? 1) + 1,
      branch: 'incomplete',
      ...member,
    })
    save()
  }
  function updateMember(id, patch) {
    const member = space.members.find((m) => m.id === id)
    if (member) Object.assign(member, patch)
    save()
  }
  function addPhoto(photo) {
    space.photos.unshift({ id: crypto.randomUUID(), ...photo })
    save()
  }
  function addMemory(memory) {
    space.memories.unshift({ id: crypto.randomUUID(), ...memory })
    save()
  }
  function addDocument(doc) {
    space.documents.unshift({ id: crypto.randomUUID(), ...doc })
    save()
  }
  function addStory(story) {
    space.stories.unshift({ id: crypto.randomUUID(), ...story })
    save()
  }
  function addVideo(video) {
    space.videos.unshift({ id: crypto.randomUUID(), ...video })
    save()
  }
  function addTimelineEvent(event) {
    space.timeline.push({ id: crypto.randomUUID(), ...event })
    save()
  }
  function updateInCollection(collectionName, id, patch) {
    const item = space[collectionName].find((entry) => entry.id === id)
    if (item) Object.assign(item, patch)
    save()
  }
  function removeFromCollection(collectionName, id) {
    const idx = space[collectionName].findIndex((entry) => entry.id === id)
    if (idx !== -1) space[collectionName].splice(idx, 1)
    save()
  }
  function updateDocument(id, patch) { updateInCollection('documents', id, patch) }
  function removeDocument(id) { removeFromCollection('documents', id) }
  function updateTimelineEvent(id, patch) { updateInCollection('timeline', id, patch) }
  function removeTimelineEvent(id) { removeFromCollection('timeline', id) }

  return {
    space, addMember, updateMember, addPhoto, addMemory, addDocument, addStory, addVideo, addTimelineEvent,
    updateDocument, removeDocument, updateTimelineEvent, removeTimelineEvent,
  }
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
