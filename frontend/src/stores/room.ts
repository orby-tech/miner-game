import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useUsernameStore } from './username'
import { useRoute } from 'vue-router'

export const useRoomStore = defineStore('room', () => {
  // localstorage human readable key

  const route = useRoute()

  const usernameStore = useUsernameStore()

  const roomId = computed(() => route.params.roomId as string)
  const stats = ref<Record<string, number>>({})
  const statsArray = computed(() => Object.entries(stats.value))

  const players = ref<string[]>([])

  const inGame = computed(() => players.value.includes(usernameStore.username))

  const addUser = (userName: string) => {
    players.value = [...new Set([...players.value, userName])]
  }

  const removeUser = (userName: string) => {
    players.value = players.value.filter((name) => name !== userName)
  }

  const setRoomPopulation = (users: string[]) => {
    players.value = users
  }

  return {
    players,
    inGame,
    roomId,
    stats,
    statsArray,
    addUser,
    removeUser,
    setRoomPopulation,
  }
})
