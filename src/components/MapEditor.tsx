import { useState } from 'react'
import { GameMap, MapCell, CellType, GridType } from '../types'
import './MapEditor.css'

interface MapEditorProps {
  maps: GameMap[]
  onSaveMap: (map: GameMap) => void
  onDeleteMap: (mapId: string) => void
}

const cellTypes: CellType[] = ['empty', 'blocked', 'special', 'start', 'end']

const cellTypeColors: Record<CellType, string> = {
  empty: '#ffffff',
  blocked: '#34495e',
  special: '#f39c12',
  start: '#27ae60',
  end: '#e74c3c'
}

function MapEditor({ maps, onSaveMap, onDeleteMap }: MapEditorProps) {
  const [mapName, setMapName] = useState('')
  const [width, setWidth] = useState(8)
  const [height, setHeight] = useState(8)
  const [gridType, setGridType] = useState<GridType>('square')
  const [selectedCellType, setSelectedCellType] = useState<CellType>('empty')
  const [currentMap, setCurrentMap] = useState<GameMap | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const initializeMap = () => {
    const cells: MapCell[] = []
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        cells.push({ x, y, type: 'empty' })
      }
    }

    const newMap: GameMap = {
      id: currentMap?.id || Date.now().toString(),
      name: mapName || 'Untitled Map',
      width,
      height,
      gridType,
      cells
    }

    setCurrentMap(newMap)
    setIsEditing(true)
  }

  const handleCellClick = (x: number, y: number) => {
    if (!currentMap) return

    const newCells = currentMap.cells.map(cell =>
      cell.x === x && cell.y === y
        ? { ...cell, type: selectedCellType }
        : cell
    )

    setCurrentMap({
      ...currentMap,
      cells: newCells
    })
  }

  const handleSave = () => {
    if (!currentMap) return

    if (!mapName.trim()) {
      alert('Please enter a map name')
      return
    }

    const mapToSave = {
      ...currentMap,
      name: mapName
    }

    onSaveMap(mapToSave)
    setCurrentMap(null)
    setMapName('')
    setIsEditing(false)
  }

  const handleCancel = () => {
    setCurrentMap(null)
    setMapName('')
    setIsEditing(false)
  }

  const handleLoadMap = (map: GameMap) => {
    setCurrentMap(map)
    setMapName(map.name)
    setWidth(map.width)
    setHeight(map.height)
    setGridType(map.gridType)
    setIsEditing(true)
  }

  const getCellAtPosition = (x: number, y: number): MapCell | undefined => {
    return currentMap?.cells.find(cell => cell.x === x && cell.y === y)
  }

  return (
    <div className="map-editor">
      <h2>Map Editor</h2>

      {!isEditing ? (
        <div className="map-setup">
          <div className="form-group">
            <label>Map Name</label>
            <input
              type="text"
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              placeholder="Enter map name"
            />
          </div>

          <div className="form-group">
            <label>Grid Type</label>
            <select
              value={gridType}
              onChange={(e) => setGridType(e.target.value as GridType)}
            >
              <option value="square">Square Grid</option>
              <option value="hexagonal">Hexagonal Grid</option>
            </select>
          </div>

          <div className="dimensions">
            <div className="form-group">
              <label>Width</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Math.max(3, Math.min(20, parseInt(e.target.value) || 8)))}
                min="3"
                max="20"
              />
            </div>

            <div className="form-group">
              <label>Height</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Math.max(3, Math.min(20, parseInt(e.target.value) || 8)))}
                min="3"
                max="20"
              />
            </div>
          </div>

          <button className="create-map-btn" onClick={initializeMap}>
            Create New Map
          </button>

          {maps.length > 0 && (
            <div className="saved-maps">
              <h3>Saved Maps ({maps.length})</h3>
              <div className="maps-list">
                {maps.map((map) => (
                  <div key={map.id} className="map-item">
                    <div className="map-info">
                      <strong>{map.name}</strong>
                      <span className="map-size">{map.width}×{map.height}</span>
                    </div>
                    <div className="map-actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleLoadMap(map)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => onDeleteMap(map.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="map-canvas">
          <div className="editor-header">
            <h3>Editing: {mapName || 'Untitled Map'}</h3>
            <div className="editor-actions">
              <button className="save-btn" onClick={handleSave}>
                Save Map
              </button>
              <button className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>

          <div className="cell-type-selector">
            <label>Select Cell Type:</label>
            <div className="cell-types">
              {cellTypes.map((type) => (
                <button
                  key={type}
                  className={`cell-type-btn ${selectedCellType === type ? 'active' : ''}`}
                  onClick={() => setSelectedCellType(type)}
                  style={{
                    backgroundColor: cellTypeColors[type],
                    color: type === 'empty' ? '#333' : '#fff'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid-container">
            {currentMap?.gridType === 'square' ? (
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${currentMap.width}, 40px)`,
                  gridTemplateRows: `repeat(${currentMap.height}, 40px)`
                }}
              >
                {Array.from({ length: currentMap.height }).map((_, y) =>
                  Array.from({ length: currentMap.width }).map((_, x) => {
                    const cell = getCellAtPosition(x, y)
                    return (
                      <div
                        key={`${x}-${y}`}
                        className="grid-cell"
                        style={{
                          backgroundColor: cell ? cellTypeColors[cell.type] : cellTypeColors.empty
                        }}
                        onClick={() => handleCellClick(x, y)}
                        title={`${x}, ${y} - ${cell?.type || 'empty'}`}
                      >
                        {cell?.type === 'start' && 'S'}
                        {cell?.type === 'end' && 'E'}
                      </div>
                    )
                  })
                )}
              </div>
            ) : (
              <div className="hex-grid">
                {currentMap && Array.from({ length: currentMap.height }).map((_, y) => (
                  <div key={y} className="hex-row" style={{ marginLeft: y % 2 === 1 ? '27px' : '0' }}>
                    {Array.from({ length: currentMap.width }).map((_, x) => {
                      const cell = getCellAtPosition(x, y)
                      return (
                        <div
                          key={`${x}-${y}`}
                          className="hex-cell"
                          onClick={() => handleCellClick(x, y)}
                          title={`${x}, ${y} - ${cell?.type || 'empty'}`}
                        >
                          <div
                            className="hex-inner"
                            style={{
                              backgroundColor: cell ? cellTypeColors[cell.type] : cellTypeColors.empty
                            }}
                          >
                            {cell?.type === 'start' && <span className="hex-marker">S</span>}
                            {cell?.type === 'end' && <span className="hex-marker">E</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="legend">
            <h4>Legend:</h4>
            <div className="legend-items">
              {cellTypes.map((type) => (
                <div key={type} className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: cellTypeColors[type] }}
                  />
                  <span>{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MapEditor
