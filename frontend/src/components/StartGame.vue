<script setup lang="ts">
import { useGameStore } from '@/stores/game-status'
import { computed, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'

const router = useRouter()
const route = useRoute()
const $toast = useToast()

const gameStore = useGameStore()

const countOfDiamonds = ref(1)

const sizeOfTheField = ref(1)

const startGameDisabled = computed(() => {
  return countOfDiamonds.value === 0 || sizeOfTheField.value === 0
})

const maxCountOfDiamonds = computed(() => {
  return sizeOfTheField.value ** 2
})

const startGame = async () => {
  console.log('Game started!')

  let roomId = route.params.roomId

  if (!roomId) {
    console.log('Room ID is not provided!')

    roomId = Math.random().toString(36).substring(7)

    // Redirect to the same route with the room ID

    router.push({
      name: 'room',
      params: {
        roomId: roomId,
      },
    })

    // Copy the url to the clipboard
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`)

    $toast.success('URL copied to the clipboard!')

    roomId = roomId
  }

  setTimeout(() => {
    fetch(`${import.meta.env.VITE_API_URL}/room/${roomId}/gen-new-game`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        diamondCount: countOfDiamonds.value,
        side: sizeOfTheField.value,
      }),
    })
  }, 100)
}

// if countOfDiamonds more than maxCountOfDiamonds, set countOfDiamonds to maxCountOfDiamonds
watchEffect(() => {
  if (countOfDiamonds.value > maxCountOfDiamonds.value) {
    countOfDiamonds.value = maxCountOfDiamonds.value
  }
})

// if no room ID provided, redirect to the main page
if (!route.params.roomId) {
  router.push({
    name: 'home',
  })
}

watchEffect(() => {
  if (gameStore.diamondCount) {
    countOfDiamonds.value = gameStore.diamondCount
  }

  if (gameStore.side) {
    sizeOfTheField.value = gameStore.side
  }
})
</script>

<template>
  <main class="w-full h-full flex flex-col justify-center items-center">
    <div class="w-fit flex flex-col">
      <label
        for="countOfDiamonds"
        class="text-purple-700 dark:text-purple-300 font-medium text-sm mb-2"
      >
        Count of diamonds
      </label>

      <input
        type="number"
        id="countOfDiamonds"
        min="1"
        :max="maxCountOfDiamonds"
        step="2"
        v-model="countOfDiamonds"
        class="border-2 border-purple-700 rounded-full px-5 py-2.5 text-center mb-2 focus:outline-none focus:ring-4 focus:ring-purple-300 dark:border-purple-600 dark:focus:ring-purple-900"
        placeholder="Count of diamonds"
      />

      <label
        for="sizeOfTheField"
        class="text-purple-700 dark:text-purple-300 font-medium text-sm mb-2"
      >
        Size of the field
      </label>

      <input
        type="number"
        id="sizeOfTheField"
        min="1"
        max="6"
        v-model="sizeOfTheField"
        class="border-2 border-purple-700 rounded-full px-5 py-2.5 text-center mb-2 focus:outline-none focus:ring-4 focus:ring-purple-300 dark:border-purple-600 dark:focus:ring-purple-900"
        placeholder="Size of the field"
      />

      <button
        type="button"
        @click="startGame"
        :disabled="startGameDisabled"
        class="text-white bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
      >
        Start game!
      </button>
    </div>
  </main>
</template>
