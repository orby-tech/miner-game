<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { useUsernameStore } from './stores/username'
import { useWsStore } from './stores/ws'
import { onMounted, watch } from 'vue'
import type { ClientEvents } from '@common/events'

const usernameStore = useUsernameStore()
const wsStore = useWsStore()
const route = useRoute()

// Connect to the WebSocket server on mount
onMounted(async () => {
  await wsStore.initWs()
  wsStore.send([
    {
      'user:present': {
        userName: usernameStore.username,
      },
    },
  ] as ClientEvents[])
})

// onChange username notify the server
watch(
  () => usernameStore.username,
  (newUsername) => {
    wsStore.send([
      {
        'user:present': {
          userName: newUsername,
        },
      },
    ] as ClientEvents[])
  },
)

// Notify the server that room is changed
watch(
  () => route.params.roomId || usernameStore.username,
  (newRoomId) => {
    if (!usernameStore.username) {
      return
    }
    wsStore.send([
      {
        'room:join': {
          roomId: newRoomId.toString(), // TODO: Add check for undefined and array
          userName: usernameStore.username.toString(),
        },
      },
    ] as ClientEvents[])
  },
)
</script>

<template>
  <header class="flex justify-between">
    <h1>Mainer</h1>
    <p>Welcome, {{ usernameStore.username }}!</p>
    <p>Room ID: {{ route.params.roomId }}</p>
  </header>
  <RouterView />
</template>

<style scoped></style>
