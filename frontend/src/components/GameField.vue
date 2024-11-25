<script setup lang="ts">
import { useGameStore } from '@/stores/game-status'
import { useRoomStore } from '@/stores/room'
import { useUsernameStore } from '@/stores/username'
import { useWsStore } from '@/stores/ws'
import type { ClientEvents } from '@common/events'
import { PublicFieldType } from '@common/game'

const props = defineProps(['x', 'y', 'cellType', 'cellValue'])

const roomStore = useRoomStore()
const usernameStore = useUsernameStore()
const gameStore = useGameStore()
const wsStore = useWsStore()

const onFieldClick = () => {
  console.log('fieldClicked')

  wsStore.send([
    {
      'game:open': {
        roomId: roomStore.roomId,
        x: props.x,
        y: props.y,
        userName: usernameStore.username,
      },
    },
  ] as ClientEvents[])
}
</script>

<template>
  <button
    v-if="props.cellType === PublicFieldType.Hidden"
    class="w-10 h-10 bg-gray-200 border border-gray-300 p-0"
    :disabled="gameStore.mapDisabled"
    @click="onFieldClick"
  ></button>
  <div
    v-else-if="props.cellType === PublicFieldType.Diamond"
    class="w-10 h-10 bg-green-500 border border-gray-300 p-0"
  ></div>
  <div
    v-else-if="props.cellType === PublicFieldType.Empty"
    class="w-10 h-10 bg-red-500 border border-gray-300 p-0 flex flex-col justify-center items-center"
  >
    <p>{{ props.cellValue }}</p>
  </div>
</template>
