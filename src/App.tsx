import { useState } from 'react'
import { Card, GameMap } from './types'
import CardCreator from './components/CardCreator'
import CardList from './components/CardList'
import MapEditor from './components/MapEditor'
import MapVisualizer from './components/MapVisualizer'
import './App.css'

function App() {
  const [cards, setCards] = useState<Card[]>([])
  const [maps, setMaps] = useState<GameMap[]>([])
  const [activeTab, setActiveTab] = useState<'cards' | 'maps' | 'visualizer'>('cards')

  const handleAddCard = (card: Card) => {
    setCards([...cards, card])
  }

  const handleDeleteCard = (cardId: string) => {
    setCards(cards.filter(c => c.id !== cardId))
  }

  const handlePlayCard = (card: Card) => {
    console.log('Playing card:', card)
    alert(`Playing card: ${card.name}\nActions: ${card.actions.map(a => `${a.type}: ${a.value}`).join(', ')}`)
  }

  const handleSaveMap = (map: GameMap) => {
    const existingIndex = maps.findIndex(m => m.id === map.id)
    if (existingIndex >= 0) {
      const newMaps = [...maps]
      newMaps[existingIndex] = map
      setMaps(newMaps)
    } else {
      setMaps([...maps, map])
    }
  }

  const handleDeleteMap = (mapId: string) => {
    setMaps(maps.filter(m => m.id !== mapId))
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Board Game Maker</h1>
        <div className="tabs">
          <button
            className={activeTab === 'cards' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('cards')}
          >
            Cards
          </button>
          <button
            className={activeTab === 'maps' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('maps')}
          >
            Map Editor
          </button>
          <button
            className={activeTab === 'visualizer' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('visualizer')}
          >
            Map Visualizer
          </button>
        </div>
      </header>

      <main className="app-main">
        {activeTab === 'cards' && (
          <div className="cards-section">
            <div className="creator-panel">
              <h2>Create Card</h2>
              <CardCreator onAddCard={handleAddCard} />
            </div>
            <div className="list-panel">
              <h2>Your Cards ({cards.length})</h2>
              <CardList
                cards={cards}
                onPlayCard={handlePlayCard}
                onDeleteCard={handleDeleteCard}
              />
            </div>
          </div>
        )}

        {activeTab === 'maps' && (
          <div className="maps-section">
            <MapEditor
              maps={maps}
              onSaveMap={handleSaveMap}
              onDeleteMap={handleDeleteMap}
            />
          </div>
        )}

        {activeTab === 'visualizer' && (
          <div className="maps-section">
            <MapVisualizer maps={maps} />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
