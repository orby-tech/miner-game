import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const generateRandomUsername = () => {
  // generate a random username which should be a color and an animal
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange']
  const animals = ['dog', 'cat', 'bird', 'fish', 'rabbit', 'turtle']
  const randomColor = colors[Math.floor(Math.random() * colors.length)]
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)]
  return `${randomColor}-${randomAnimal}`
}

export const useUsernameStore = defineStore('username', () => {
  // localstorage human readable key
  const username = ref(
    localStorage.getItem('username') ||
      (() => {
        const newUsername = generateRandomUsername()

        localStorage.setItem('username', newUsername)

        return newUsername
      })(),
  )

  // computed property that returns the username
  const getUsername = computed(() => username.value)

  return { username, getUsername }
})
