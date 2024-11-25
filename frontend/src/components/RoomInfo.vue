<script lang="ts" setup>
import { useRoomStore } from '@/stores/room'
import { useRoute } from 'vue-router'

const roomStore = useRoomStore()
const route = useRoute()
</script>

<template>
  <div class="w-40 flex-col">
    <div class="w-40">
      <h1 class="text-3xl">Room Info</h1>
      <p>Room ID: {{ route.params.roomId }}</p>

      <div>
        <h2 class="text-xl">Players:</h2>
        <ul>
          <li v-for="player in roomStore.players" :key="player">
            {{ player }}
          </li>

          <li v-if="roomStore.players.length === 0">No players in the room</li>
        </ul>
      </div>
    </div>

    <section class="w-40">
      <h2 class="text-2xl">Room stats</h2>
      <p v-for="player in roomStore.statsArray" :key="player[1]">
        {{ player[0] }}: {{ player[1] }}
      </p>
    </section>
  </div>
</template>
