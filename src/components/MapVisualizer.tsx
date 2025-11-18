import { useState } from 'react'
import { GameMap, MapCell, CellType } from '../types'
import './MapVisualizer.css'

interface MapVisualizerProps {
  maps: GameMap[]
}

const cellTypeColors: Record<CellType, string> = {
  empty: '#ffffff',
  blocked: '#34495e',
  special: '#f39c12',
  start: '#27ae60',
  end: '#e74c3c'
}

function MapVisualizer({ maps }: MapVisualizerProps) {
  const [selectedMap, setSelectedMap] = useState<GameMap | null>(null)

  const getCellAtPosition = (map: GameMap, x: number, y: number): MapCell | undefined => {
    return map.cells.find(cell => cell.x === x && cell.y === y)
  }

  const getMapStats = (map: GameMap) => {
    const stats: Record<CellType, number> = {
      empty: 0,
      blocked: 0,
      special: 0,
      start: 0,
      end: 0
    }

    map.cells.forEach(cell => {
      stats[cell.type]++
    })

    return stats
  }

  const renderMapPreview = (map: GameMap) => {
    const cellSize = Math.min(20, 200 / Math.max(map.width, map.height))

    return (
      <div
        className="map-preview"
        style={{
          gridTemplateColumns: `repeat(${map.width}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${map.height}, ${cellSize}px)`
        }}
      >
        {Array.from({ length: map.height }).map((_, y) =>
          Array.from({ length: map.width }).map((_, x) => {
            const cell = getCellAtPosition(map, x, y)
            return (
              <div
                key={`${x}-${y}`}
                className="preview-cell"
                style={{
                  backgroundColor: cell ? cellTypeColors[cell.type] : cellTypeColors.empty
                }}
              />
            )
          })
        )}
      </div>
    )
  }

  if (maps.length === 0) {
    return (
      <div className="map-visualizer">
        <h2>Map Visualizer</h2>
        <div className="empty-state">
          <p>No maps available. Create a map in the Maps tab first!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="map-visualizer">
      <h2>Map Visualizer</h2>

      {!selectedMap ? (
        <div className="map-gallery">
          <p className="gallery-subtitle">Select a map to visualize</p>
          <div className="map-cards">
            {maps.map((map) => {
              const stats = getMapStats(map)
              return (
                <div
                  key={map.id}
                  className="map-card"
                  onClick={() => setSelectedMap(map)}
                >
                  <div className="map-card-header">
                    <h3>{map.name}</h3>
                    <span className="map-dimensions">{map.width}×{map.height}</span>
                  </div>

                  {renderMapPreview(map)}

                  <div className="map-card-stats">
                    <div className="stat-row">
                      <span className="stat-label">Total Cells:</span>
                      <span className="stat-value">{map.width * map.height}</span>
                    </div>
                    {stats.start > 0 && (
                      <div className="stat-row">
                        <span className="stat-label">Start Points:</span>
                        <span className="stat-value">{stats.start}</span>
                      </div>
                    )}
                    {stats.end > 0 && (
                      <div className="stat-row">
                        <span className="stat-label">End Points:</span>
                        <span className="stat-value">{stats.end}</span>
                      </div>
                    )}
                    {stats.special > 0 && (
                      <div className="stat-row">
                        <span className="stat-label">Special Cells:</span>
                        <span className="stat-value">{stats.special}</span>
                      </div>
                    )}
                    {stats.blocked > 0 && (
                      <div className="stat-row">
                        <span className="stat-label">Blocked Cells:</span>
                        <span className="stat-value">{stats.blocked}</span>
                      </div>
                    )}
                  </div>

                  <button className="view-btn">View Map</button>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="map-detail">
          <div className="detail-header">
            <div>
              <h3>{selectedMap.name}</h3>
              <p className="detail-subtitle">
                {selectedMap.width}×{selectedMap.height} grid
              </p>
            </div>
            <button
              className="back-btn"
              onClick={() => setSelectedMap(null)}
            >
              ← Back to Gallery
            </button>
          </div>

          <div className="detail-content">
            <div className="detail-grid-container">
              <div
                className="detail-grid"
                style={{
                  gridTemplateColumns: `repeat(${selectedMap.width}, 50px)`,
                  gridTemplateRows: `repeat(${selectedMap.height}, 50px)`
                }}
              >
                {Array.from({ length: selectedMap.height }).map((_, y) =>
                  Array.from({ length: selectedMap.width }).map((_, x) => {
                    const cell = getCellAtPosition(selectedMap, x, y)
                    return (
                      <div
                        key={`${x}-${y}`}
                        className="detail-cell"
                        style={{
                          backgroundColor: cell ? cellTypeColors[cell.type] : cellTypeColors.empty
                        }}
                        title={`Position: (${x}, ${y}) - Type: ${cell?.type || 'empty'}`}
                      >
                        {cell?.type === 'start' && <span className="cell-marker">S</span>}
                        {cell?.type === 'end' && <span className="cell-marker">E</span>}
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <div className="detail-sidebar">
              <div className="info-panel">
                <h4>Map Information</h4>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">Name:</span>
                    <span className="info-value">{selectedMap.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Dimensions:</span>
                    <span className="info-value">{selectedMap.width} × {selectedMap.height}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Total Cells:</span>
                    <span className="info-value">{selectedMap.width * selectedMap.height}</span>
                  </div>
                </div>
              </div>

              <div className="stats-panel">
                <h4>Cell Distribution</h4>
                <div className="stats-list">
                  {Object.entries(getMapStats(selectedMap)).map(([type, count]) => (
                    <div key={type} className="stat-item">
                      <div className="stat-color-label">
                        <div
                          className="stat-color"
                          style={{ backgroundColor: cellTypeColors[type as CellType] }}
                        />
                        <span className="stat-type">{type}</span>
                      </div>
                      <span className="stat-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="legend-panel">
                <h4>Legend</h4>
                <div className="legend-list">
                  {(Object.keys(cellTypeColors) as CellType[]).map((type) => (
                    <div key={type} className="legend-item">
                      <div
                        className="legend-color"
                        style={{ backgroundColor: cellTypeColors[type] }}
                      />
                      <span className="legend-text">{type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MapVisualizer
