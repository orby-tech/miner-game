<script setup lang="ts">
import { useGameStore } from '@/stores/game-status'
import { useRoomStore } from '@/stores/room'
import GameField from './GameField.vue'

const roomStore = useRoomStore()
const gameStore = useGameStore()
</script>

<template>
  <div class="flex flex-col">
    <section class="flex flex-col">
      <div>
        <h1 class="text-2xl">Game</h1>
      </div>

      <div class="flex flex-row">
        <div v-for="(row, colIndex) in gameStore.map" :key="colIndex">
          <div v-for="(cell, rowIndex) in row" :key="rowIndex" class="p-0 m-0 w-10 h-10">
            <GameField
              :x="colIndex"
              :y="rowIndex"
              :cell-type="cell.type"
              :cell-value="cell.value"
            />
          </div>
        </div>

        <div v-if="gameStore.map.length === 0">
          <p>Game not started yet</p>
        </div>
      </div>

      <div v-if="roomStore.players.length === 2">Next player: {{ gameStore.nextPlayer }}</div>
      <div v-else>Waiting for the second player...</div>
    </section>

    <section class="w-40">
      <h2 class="text-2xl">Game stats</h2>
      <p v-for="player in gameStore.statsArray" :key="player[1]">
        {{ player[0] }}: {{ player[1] }}
      </p>
    </section>

    <section v-if="gameStore.winner">Winner: {{ gameStore.winner }}</section>
  </div>
</template>
