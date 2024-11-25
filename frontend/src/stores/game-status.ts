import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { type PublicField, type PublicGame } from '@common/game'
import { useRoomStore } from './room'
import { useUsernameStore } from './username'

export const useGameStore = defineStore('game', () => {
  const roomStore = useRoomStore()
  const usernameStore = useUsernameStore()

  const diamondCount = ref(0)

  const nextPlayer = ref<string>('')
  const winner = ref('')

  const stats = ref<Record<string, number>>({})
  const statsArray = computed(() => Object.entries(stats.value))

  const side = ref(0)
  const mapDisabled = computed(
    () => !roomStore.inGame || usernameStore.username !== nextPlayer.value,
  )

  const map = ref<PublicField[][]>([])

  const setGameStatus = (status: PublicGame): void => {
    diamondCount.value = status.diamondCount
    side.value = status.side
    map.value = status.map
  }

  return {
    diamondCount,
    mapDisabled,
    side,
    winner,
    map,
    stats,
    statsArray,
    nextPlayer,
    setGameStatus,
  }
})
