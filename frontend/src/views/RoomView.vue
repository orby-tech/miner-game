<script setup lang="ts">
import RoomInfo from '@/components/RoomInfo.vue'
import StartGame from '@/components/StartGame.vue'
import Game from '@/components/GameMap.vue'
</script>

<template>
  <main class="w-full h-full flex flex-row justify-center items-center">
    <Game />
    <StartGame />
    <RoomInfo />
  </main>
</template>
