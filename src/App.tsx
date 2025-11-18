import { useState, useEffect } from 'react'
import { Card, GameMap } from './types'
import CardCreator from './components/CardCreator'
import CardList from './components/CardList'
import MapEditor from './components/MapEditor'
import MapVisualizer from './components/MapVisualizer'
import GamePlay from './components/GamePlay'
import { loadCards, loadMaps, saveCards, saveMaps, exportGameData, importGameData, clearAllData } from './storage'
import './App.css'

function App() {
  const [cards, setCards] = useState<Card[]>([])
  const [maps, setMaps] = useState<GameMap[]>([])
  const [activeTab, setActiveTab] = useState<'cards' | 'maps' | 'visualizer' | 'play' | 'settings'>('cards')

  // Load data from localStorage on mount
  useEffect(() => {
    const savedCards = loadCards()
    const savedMaps = loadMaps()
    setCards(savedCards)
    setMaps(savedMaps)
  }, [])

  // Auto-save cards whenever they change
  useEffect(() => {
    if (cards.length > 0 || localStorage.getItem('boardgame-maker-cards')) {
      saveCards(cards)
    }
  }, [cards])

  // Auto-save maps whenever they change
  useEffect(() => {
    if (maps.length > 0 || localStorage.getItem('boardgame-maker-maps')) {
      saveMaps(maps)
    }
  }, [maps])

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

  const handleExportData = () => {
    exportGameData(cards, maps)
  }

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const data = await importGameData(file)

      const confirmImport = window.confirm(
        `Import ${data.cards.length} cards and ${data.maps.length} maps?\n\nThis will replace your current data.`
      )

      if (confirmImport) {
        setCards(data.cards)
        setMaps(data.maps)
        alert('Data imported successfully!')
      }
    } catch (error) {
      alert('Failed to import data: ' + (error as Error).message)
    }

    // Reset file input
    event.target.value = ''
  }

  const handleClearData = () => {
    const confirm = window.confirm(
      'Are you sure you want to delete all cards and maps?\n\nThis action cannot be undone!'
    )

    if (confirm) {
      clearAllData()
      setCards([])
      setMaps([])
      alert('All data cleared!')
    }
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
          <button
            className={activeTab === 'play' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('play')}
          >
            Play Game
          </button>
          <button
            className={activeTab === 'settings' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('settings')}
          >
            Settings
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

        {activeTab === 'play' && (
          <div className="maps-section">
            <GamePlay maps={maps} cards={cards} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-section">
            <h2>Settings & Data Management</h2>

            <div className="settings-panel">
              <div className="settings-group">
                <h3>Data Overview</h3>
                <div className="data-stats">
                  <div className="stat-item">
                    <span className="stat-label">Cards:</span>
                    <span className="stat-value">{cards.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Maps:</span>
                    <span className="stat-value">{maps.length}</span>
                  </div>
                </div>
                <p className="info-text">Your data is automatically saved to your browser's local storage.</p>
              </div>

              <div className="settings-group">
                <h3>Export Data</h3>
                <p className="info-text">Download all your cards and maps as a JSON file for backup or sharing.</p>
                <button className="export-btn" onClick={handleExportData}>
                  Export All Data
                </button>
              </div>

              <div className="settings-group">
                <h3>Import Data</h3>
                <p className="info-text">Load cards and maps from a previously exported JSON file.</p>
                <label className="import-btn">
                  Import Data
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <div className="settings-group danger-zone">
                <h3>Danger Zone</h3>
                <p className="info-text">Permanently delete all your cards and maps. This cannot be undone!</p>
                <button className="clear-btn" onClick={handleClearData}>
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
