import { useState } from 'react'
import { GameMap, Player, CellType, Card, Action } from '../types'
import './GamePlay.css'

interface GamePlayProps {
  maps: GameMap[]
  cards: Card[]
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

function GamePlay({ maps, cards }: GamePlayProps) {
  const [selectedMap, setSelectedMap] = useState<GameMap | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [newPlayerName, setNewPlayerName] = useState('')
  const [gameStarted, setGameStarted] = useState(false)
  const [actionLog, setActionLog] = useState<string[]>([])
  const [pendingMovement, setPendingMovement] = useState<number | null>(null)
  const [validMoveSpaces, setValidMoveSpaces] = useState<{x: number, y: number}[]>([])

  // Calculate Manhattan distance for square grids
  const calculateSquareDistance = (x1: number, y1: number, x2: number, y2: number): number => {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2)
  }

  // Calculate hex distance for hexagonal grids with offset coordinates
  const calculateHexDistance = (x1: number, y1: number, x2: number, y2: number): number => {
    // Convert offset coordinates to cube coordinates for easier distance calculation
    const q1 = x1 - (y1 - (y1 & 1)) / 2
    const r1 = y1
    const q2 = x2 - (y2 - (y2 & 1)) / 2
    const r2 = y2

    return (Math.abs(q1 - q2) + Math.abs(q1 + r1 - q2 - r2) + Math.abs(r1 - r2)) / 2
  }

  // Get all valid spaces within movement range
  const getValidMoveSpaces = (player: Player, moveRange: number): {x: number, y: number}[] => {
    if (!selectedMap) return []

    const validSpaces: {x: number, y: number}[] = []
    const distanceFunc = selectedMap.gridType === 'square' ? calculateSquareDistance : calculateHexDistance

    for (let y = 0; y < selectedMap.height; y++) {
      for (let x = 0; x < selectedMap.width; x++) {
        const distance = distanceFunc(player.x, player.y, x, y)

        if (distance > 0 && distance <= moveRange) {
          const cell = selectedMap.cells.find(c => c.x === x && c.y === y)
          // Don't include blocked cells or current position
          if (!cell || cell.type !== 'blocked') {
            validSpaces.push({ x, y })
          }
        }
      }
    }

    return validSpaces
  }

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

    // If there's a pending movement from a card, check if this is a valid destination
    if (pendingMovement !== null) {
      const isValidMove = validMoveSpaces.some(space => space.x === x && space.y === y)

      if (!isValidMove) {
        alert(`Cannot move there! Movement range is ${pendingMovement}.`)
        return
      }

      // Execute the movement
      const currentPlayer = players[currentPlayerIndex]
      setActionLog(prev => [...prev, `${currentPlayer.name} moved from (${currentPlayer.x},${currentPlayer.y}) to (${x},${y})`])

      const updatedPlayers = players.map((player, idx) => {
        if (idx === currentPlayerIndex) {
          return { ...player, x, y }
        }
        return player
      })

      setPlayers(updatedPlayers)
      setPendingMovement(null)
      setValidMoveSpaces([])

      // Next player's turn
      setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length)
      return
    }

    // Regular free movement (not from a card)
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
    setActionLog([])
  }

  const executeCardAction = (action: Action, player: Player): { player: Player, requiresInput: boolean } => {
    if (!selectedMap) return { player, requiresInput: false }

    switch (action.type) {
      case 'move': {
        const moveValue = typeof action.value === 'number' ? action.value : parseInt(action.value as string) || 0
        const distance = Math.abs(moveValue)

        // Set up pending movement - player will click to choose destination
        const validSpaces = getValidMoveSpaces(player, distance)

        if (validSpaces.length === 0) {
          setActionLog(prev => [...prev, `${player.name} cannot move - no valid spaces!`])
          return { player, requiresInput: false }
        }

        setPendingMovement(distance)
        setValidMoveSpaces(validSpaces)
        setActionLog(prev => [...prev, `${player.name} can move up to ${distance} spaces. Click a highlighted space.`])
        return { player, requiresInput: true }
      }

      case 'attack':
        setActionLog(prev => [...prev, `${player.name} attacks for ${action.value} damage!`])
        break

      case 'heal':
        setActionLog(prev => [...prev, `${player.name} heals for ${action.value} HP!`])
        break

      case 'draw':
        setActionLog(prev => [...prev, `${player.name} draws ${action.value} cards!`])
        break

      case 'custom':
        setActionLog(prev => [...prev, `${player.name} uses ${action.description}!`])
        break
    }

    return { player, requiresInput: false }
  }

  const handlePlayCard = (card: Card) => {
    if (!gameStarted || players.length === 0) return

    // Don't allow playing cards if there's already a pending movement
    if (pendingMovement !== null) {
      alert('Complete the current movement action first!')
      return
    }

    const currentPlayer = players[currentPlayerIndex]
    let updatedPlayer = { ...currentPlayer }
    let requiresInput = false

    setActionLog(prev => [...prev, `--- ${currentPlayer.name} plays "${card.name}" ---`])

    // Execute all actions on the card
    for (const action of card.actions) {
      const result = executeCardAction(action, updatedPlayer)
      updatedPlayer = result.player

      // If any action requires input, stop and wait for player interaction
      if (result.requiresInput) {
        requiresInput = true
        break
      }
    }

    // Update the player in the array
    const updatedPlayers = players.map((player, idx) =>
      idx === currentPlayerIndex ? updatedPlayer : player
    )

    setPlayers(updatedPlayers)

    // Only advance turn if no input is required (movement cards wait for click)
    if (!requiresInput) {
      setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length)
    }
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
                  const isValidMoveSpace = validMoveSpaces.some(space => space.x === x && space.y === y)

                  return (
                    <div
                      key={`${x}-${y}`}
                      className={`game-cell ${gameStarted ? 'clickable' : ''} ${isValidMoveSpace ? 'valid-move' : ''}`}
                      style={{
                        backgroundColor: isValidMoveSpace
                          ? '#e3f2fd'
                          : (cell ? cellTypeColors[cell.type] : cellTypeColors.empty)
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
                    const isValidMoveSpace = validMoveSpaces.some(space => space.x === x && space.y === y)

                    return (
                      <div
                        key={`${x}-${y}`}
                        className="game-hex-cell"
                        onClick={() => handleCellClick(x, y)}
                        title={`(${x}, ${y})`}
                      >
                        <div
                          className={`game-hex-inner ${gameStarted ? 'clickable' : ''} ${isValidMoveSpace ? 'valid-move' : ''}`}
                          style={{
                            backgroundColor: isValidMoveSpace
                              ? '#e3f2fd'
                              : (cell ? cellTypeColors[cell.type] : cellTypeColors.empty)
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

              <div className="available-cards">
                <h4>Available Cards ({cards.length})</h4>
                {cards.length === 0 ? (
                  <p className="no-cards">No cards available. Create cards in the Cards tab!</p>
                ) : (
                  <div className="cards-grid">
                    {cards.map((card) => (
                      <div key={card.id} className="game-card" onClick={() => handlePlayCard(card)}>
                        <div className="game-card-name">{card.name}</div>
                        <div className="game-card-actions">
                          {card.actions.map((action) => (
                            <div key={action.id} className="game-card-action">
                              {action.type}: {action.value}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="action-log">
                <h4>Action Log</h4>
                <div className="log-entries">
                  {actionLog.length === 0 ? (
                    <p className="no-actions">No actions yet</p>
                  ) : (
                    actionLog.slice(-8).reverse().map((log, idx) => (
                      <div key={idx} className="log-entry">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="game-instructions">
                <h4>Instructions</h4>
                <ul>
                  <li>Click any cell to move the current player (free movement)</li>
                  <li>Click a card to play it on the current player</li>
                  <li>Movement cards highlight valid spaces - click to move</li>
                  <li>Cannot move to blocked cells</li>
                  <li>Turn passes after completing an action</li>
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
