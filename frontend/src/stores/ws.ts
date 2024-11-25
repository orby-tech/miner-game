import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ClientEvents, ServerEvents } from '@common/events'
import { useToast } from 'vue-toast-notification'
import { useUsernameStore } from './username'
import { useRoomStore } from './room'
import { useGameStore } from './game-status'

export const useWsStore = defineStore('ws', () => {
  // localstorage human readable key
  const $toast = useToast()
  const usernameStore = useUsernameStore()
  const roomStore = useRoomStore()
  const gameStore = useGameStore()

  const ws = ref<WebSocket | null>(null)

  let initTimeoutSub: ReturnType<typeof setTimeout> | null = null

  const initWs = async (): Promise<void> => {
    if (initTimeoutSub) {
      clearTimeout(initTimeoutSub)
    }

    return new Promise((resolve) => {
      ws.value = new WebSocket(import.meta.env.VITE_WS_URL as string)
      ws.value.onopen = () => {
        resolve()
        console.log('ws opened')
      }
      ws.value.onclose = () => {
        console.log('ws closed')

        if (initTimeoutSub) {
          clearTimeout(initTimeoutSub)
        }

        initTimeoutSub = setTimeout(() => {
          initWs()
        }, 1000)
      }
      ws.value.onerror = () => {
        console.log('ws error')

        if (initTimeoutSub) {
          clearTimeout(initTimeoutSub)
        }

        initTimeoutSub = setTimeout(() => {
          initWs()
        }, 1000)
      }
      ws.value.onmessage = (event) => {
        try {
          console.log('ws message', event.data)
          const events = JSON.parse(event.data) as ServerEvents[]

          for (const event of events) {
            console.log('Event:', event)
            const eventKey = Object.keys(event)[0] as keyof ServerEvents

            // TODO: replace switch with a map
            switch (eventKey) {
              case 'room:population': {
                roomStore.setRoomPopulation(event[eventKey].users)
                break
              }
              case 'room:joined': {
                $toast.info(
                  `${event[eventKey].userName === usernameStore.username ? 'You' : `User ${event[eventKey].userName}`} joined room ${event[eventKey].roomId}`,
                )
                roomStore.addUser(event[eventKey].userName)
                break
              }
              case 'room:left': {
                console.log('Room left event')

                // TODO: handle room left event
                break
              }
              case 'game:status': {
                gameStore.setGameStatus(event[eventKey])

                break
              }
              case 'game:started': {
                $toast.success('Game started!')
                break
              }
              case 'game:finished': {
                console.log('Game finished event')

                if (event[eventKey].winner === usernameStore.username) {
                  $toast.success('You won!')
                } else {
                  $toast.error(`Player ${event[eventKey].winner} won!`)
                }

                gameStore.winner = event[eventKey].winner
                break
              }
              case 'game:next': {
                console.log('Game next event')
                gameStore.nextPlayer = event[eventKey].nextPlayer
                gameStore.winner = ''

                if (event[eventKey].nextPlayer === usernameStore.username) {
                  $toast.success('Your turn!')
                } else {
                  $toast.info(`Next turn: ${event[eventKey].nextPlayer}`)
                }
                break
              }
              case 'game:diamond-found': {
                $toast.success(`${event[eventKey].userName} found a diamond!`)

                break
              }
              case 'game:stats': {
                gameStore.stats = event[eventKey].stats
                break
              }
              case 'room:stats': {
                roomStore.stats = event[eventKey].stats
                break
              }

              default: {
                throw new Error(`Unknown event: ${eventKey}`)
              }
            }
          }
        } catch (e) {
          console.error('Error parsing message:', e)
        }
      }
    })
  }

  const send = (events: ClientEvents[]) => {
    if (ws.value) {
      ws.value.send(JSON.stringify(events))
    }
  }

  return { ws, initWs, send }
})
