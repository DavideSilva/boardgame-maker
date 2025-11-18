import { useState } from 'react'
import { GameMap, Player, CellType } from '../types'
import './GamePlay.css'

interface GamePlayProps {
  maps: GameMap[]
}

const cellTypeColors: Record<CellType, string> = {
  empty: '#ffffff',
  blocked: '#34495e',
  special: '#f39c12',
  start: '#27ae60',
  end: '#e74c3c'
}

const playerColors = [
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12',
  '#9b59b6', '#1abc9c', '#e67e22', '#34495e'
]

function GamePlay({ maps }: GamePlayProps) {
  const [selectedMap, setSelectedMap] = useState<GameMap | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [newPlayerName, setNewPlayerName] = useState('')
  const [gameStarted, setGameStarted] = useState(false)

  const handleStartGame = (map: GameMap) => {
    setSelectedMap(map)
    setPlayers([])
    setCurrentPlayerIndex(0)
    setGameStarted(false)
  }

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) {
      alert('Please enter a player name')
      return
    }

    if (!selectedMap) return

    // Find a start position or default to (0, 0)
    const startCell = selectedMap.cells.find(c => c.type === 'start')
    const startX = startCell?.x ?? 0
    const startY = startCell?.y ?? 0

    const newPlayer: Player = {
      id: Date.now().toString(),
      name: newPlayerName,
      color: playerColors[players.length % playerColors.length],
      x: startX,
      y: startY
    }

    setPlayers([...players, newPlayer])
    setNewPlayerName('')
  }

  const handleRemovePlayer = (playerId: string) => {
    setPlayers(players.filter(p => p.id !== playerId))
    if (currentPlayerIndex >= players.length - 1) {
      setCurrentPlayerIndex(0)
    }
  }

  const handleCellClick = (x: number, y: number) => {
    if (!gameStarted || players.length === 0 || !selectedMap) return

    const cell = selectedMap.cells.find(c => c.x === x && c.y === y)

    // Can't move to blocked cells
    if (cell?.type === 'blocked') {
      alert('Cannot move to a blocked cell!')
      return
    }

    // Move current player to clicked position
    const updatedPlayers = players.map((player, idx) => {
      if (idx === currentPlayerIndex) {
        return { ...player, x, y }
      }
      return player
    })

    setPlayers(updatedPlayers)

    // Next player's turn
    setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length)
  }

  const handleBeginGame = () => {
    if (players.length === 0) {
      alert('Add at least one player to start the game!')
      return
    }
    setGameStarted(true)
  }

  const handleEndGame = () => {
    setGameStarted(false)
    setSelectedMap(null)
    setPlayers([])
    setCurrentPlayerIndex(0)
  }

  const getCellAtPosition = (x: number, y: number) => {
    return selectedMap?.cells.find(cell => cell.x === x && cell.y === y)
  }

  const getPlayersAtPosition = (x: number, y: number) => {
    return players.filter(p => p.x === x && p.y === y)
  }

  if (!selectedMap) {
    return (
      <div className="game-play">
        <h2>Game Play</h2>

        {maps.length === 0 ? (
          <div className="empty-state">
            <p>No maps available. Create a map first!</p>
          </div>
        ) : (
          <div className="map-selection">
            <p className="selection-subtitle">Select a map to start playing</p>
            <div className="map-selection-grid">
              {maps.map((map) => (
                <div
                  key={map.id}
                  className="map-selection-card"
                  onClick={() => handleStartGame(map)}
                >
                  <h3>{map.name}</h3>
                  <div className="map-selection-info">
                    <span className="map-dimension">{map.width}×{map.height}</span>
                    <span className="map-grid-badge">{map.gridType}</span>
                  </div>
                  <button className="select-map-btn">Select Map</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="game-play">
      <div className="game-header">
        <div>
          <h2>Playing: {selectedMap.name}</h2>
          <p className="game-status">
            {gameStarted ? (
              <>
                <span className="status-badge playing">Game In Progress</span>
                {players.length > 0 && (
                  <span className="current-turn">
                    Current Turn: <strong style={{ color: players[currentPlayerIndex].color }}>
                      {players[currentPlayerIndex].name}
                    </strong>
                  </span>
                )}
              </>
            ) : (
              <span className="status-badge setup">Setup Phase</span>
            )}
          </p>
        </div>
        <button className="end-game-btn" onClick={handleEndGame}>
          End Game
        </button>
      </div>

      <div className="game-content">
        <div className="game-board">
          {selectedMap.gridType === 'square' ? (
            <div
              className="game-grid"
              style={{
                gridTemplateColumns: `repeat(${selectedMap.width}, 60px)`,
                gridTemplateRows: `repeat(${selectedMap.height}, 60px)`
              }}
            >
              {Array.from({ length: selectedMap.height }).map((_, y) =>
                Array.from({ length: selectedMap.width }).map((_, x) => {
                  const cell = getCellAtPosition(x, y)
                  const cellPlayers = getPlayersAtPosition(x, y)

                  return (
                    <div
                      key={`${x}-${y}`}
                      className={`game-cell ${gameStarted ? 'clickable' : ''}`}
                      style={{
                        backgroundColor: cell ? cellTypeColors[cell.type] : cellTypeColors.empty
                      }}
                      onClick={() => handleCellClick(x, y)}
                      title={`(${x}, ${y})`}
                    >
                      {cell?.type === 'start' && <span className="cell-label">S</span>}
                      {cell?.type === 'end' && <span className="cell-label">E</span>}

                      {cellPlayers.length > 0 && (
                        <div className="player-markers">
                          {cellPlayers.map((player, idx) => (
                            <div
                              key={player.id}
                              className="player-marker"
                              style={{
                                backgroundColor: player.color,
                                transform: `translate(${idx * 4}px, ${idx * 4}px)`
                              }}
                              title={player.name}
                            >
                              {player.name.charAt(0).toUpperCase()}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          ) : (
            <div className="game-hex-grid">
              {Array.from({ length: selectedMap.height }).map((_, y) => (
                <div
                  key={y}
                  className="game-hex-row"
                  style={{ marginLeft: y % 2 === 1 ? '40px' : '0' }}
                >
                  {Array.from({ length: selectedMap.width }).map((_, x) => {
                    const cell = getCellAtPosition(x, y)
                    const cellPlayers = getPlayersAtPosition(x, y)

                    return (
                      <div
                        key={`${x}-${y}`}
                        className="game-hex-cell"
                        onClick={() => handleCellClick(x, y)}
                        title={`(${x}, ${y})`}
                      >
                        <div
                          className={`game-hex-inner ${gameStarted ? 'clickable' : ''}`}
                          style={{
                            backgroundColor: cell ? cellTypeColors[cell.type] : cellTypeColors.empty
                          }}
                        >
                          {cell?.type === 'start' && <span className="hex-label">S</span>}
                          {cell?.type === 'end' && <span className="hex-label">E</span>}

                          {cellPlayers.length > 0 && (
                            <div className="player-markers">
                              {cellPlayers.map((player, idx) => (
                                <div
                                  key={player.id}
                                  className="player-marker"
                                  style={{
                                    backgroundColor: player.color,
                                    transform: `translate(${idx * 3}px, ${idx * 3}px)`
                                  }}
                                  title={player.name}
                                >
                                  {player.name.charAt(0).toUpperCase()}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="game-sidebar">
          {!gameStarted ? (
            <div className="player-setup">
              <h3>Player Setup</h3>

              <div className="add-player-form">
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="Enter player name"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
                />
                <button className="add-player-btn" onClick={handleAddPlayer}>
                  Add Player
                </button>
              </div>

              <div className="players-list">
                <h4>Players ({players.length})</h4>
                {players.length === 0 ? (
                  <p className="no-players">No players added yet</p>
                ) : (
                  players.map((player) => (
                    <div key={player.id} className="player-item">
                      <div className="player-info">
                        <div
                          className="player-color-badge"
                          style={{ backgroundColor: player.color }}
                        />
                        <span className="player-name">{player.name}</span>
                        <span className="player-position">({player.x}, {player.y})</span>
                      </div>
                      <button
                        className="remove-player-btn"
                        onClick={() => handleRemovePlayer(player.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>

              {players.length > 0 && (
                <button className="start-game-btn" onClick={handleBeginGame}>
                  Start Game
                </button>
              )}
            </div>
          ) : (
            <div className="game-info">
              <h3>Game Info</h3>

              <div className="turn-info">
                <h4>Current Turn</h4>
                <div className="current-player-card">
                  <div
                    className="player-color-badge large"
                    style={{ backgroundColor: players[currentPlayerIndex].color }}
                  />
                  <div>
                    <div className="current-player-name">{players[currentPlayerIndex].name}</div>
                    <div className="current-player-pos">
                      Position: ({players[currentPlayerIndex].x}, {players[currentPlayerIndex].y})
                    </div>
                  </div>
                </div>
              </div>

              <div className="all-players">
                <h4>All Players</h4>
                {players.map((player, idx) => (
                  <div
                    key={player.id}
                    className={`player-item ${idx === currentPlayerIndex ? 'active' : ''}`}
                  >
                    <div className="player-info">
                      <div
                        className="player-color-badge"
                        style={{ backgroundColor: player.color }}
                      />
                      <span className="player-name">{player.name}</span>
                      <span className="player-position">({player.x}, {player.y})</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="game-instructions">
                <h4>Instructions</h4>
                <ul>
                  <li>Click any cell to move the current player</li>
                  <li>Cannot move to blocked cells</li>
                  <li>Turn automatically passes after each move</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GamePlay
