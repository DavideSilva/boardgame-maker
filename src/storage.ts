import { Card, GameMap } from './types'

const STORAGE_KEYS = {
  CARDS: 'boardgame-maker-cards',
  MAPS: 'boardgame-maker-maps',
  VERSION: 'boardgame-maker-version'
}

const CURRENT_VERSION = '1.0.0'

interface GameData {
  version: string
  cards: Card[]
  maps: GameMap[]
  exportDate: string
}

// Save to localStorage
export const saveCards = (cards: Card[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards))
  } catch (error) {
    console.error('Failed to save cards:', error)
  }
}

export const saveMaps = (maps: GameMap[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.MAPS, JSON.stringify(maps))
  } catch (error) {
    console.error('Failed to save maps:', error)
  }
}

// Load from localStorage
export const loadCards = (): Card[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CARDS)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Failed to load cards:', error)
    return []
  }
}

export const loadMaps = (): GameMap[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MAPS)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Failed to load maps:', error)
    return []
  }
}

// Export to JSON file
export const exportGameData = (cards: Card[], maps: GameMap[]): void => {
  const gameData: GameData = {
    version: CURRENT_VERSION,
    cards,
    maps,
    exportDate: new Date().toISOString()
  }

  const dataStr = JSON.stringify(gameData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)

  const link = document.createElement('a')
  link.href = url
  link.download = `boardgame-maker-${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Import from JSON file
export const importGameData = (file: File): Promise<{ cards: Card[], maps: GameMap[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const gameData: GameData = JSON.parse(content)

        // Validate structure
        if (!gameData.cards || !gameData.maps) {
          throw new Error('Invalid game data format')
        }

        resolve({
          cards: gameData.cards,
          maps: gameData.maps
        })
      } catch (error) {
        reject(new Error('Failed to parse game data: ' + (error as Error).message))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}

// Clear all data
export const clearAllData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CARDS)
    localStorage.removeItem(STORAGE_KEYS.MAPS)
  } catch (error) {
    console.error('Failed to clear data:', error)
  }
}

// Get storage info
export const getStorageInfo = () => {
  const cards = loadCards()
  const maps = loadMaps()

  return {
    cardsCount: cards.length,
    mapsCount: maps.length,
    version: CURRENT_VERSION
  }
}
