import { Card } from '../types'
import './CardList.css'

interface CardListProps {
  cards: Card[]
  onPlayCard: (card: Card) => void
  onDeleteCard: (cardId: string) => void
}

function CardList({ cards, onPlayCard, onDeleteCard }: CardListProps) {
  if (cards.length === 0) {
    return (
      <div className="empty-state">
        <p>No cards created yet. Create your first card!</p>
      </div>
    )
  }

  return (
    <div className="card-list">
      {cards.map((card) => (
        <div key={card.id} className="card">
          <div className="card-header">
            <h3>{card.name}</h3>
            <button
              className="delete-card-btn"
              onClick={() => onDeleteCard(card.id)}
              title="Delete card"
            >
              ×
            </button>
          </div>

          {card.description && (
            <p className="card-description">{card.description}</p>
          )}

          <div className="card-actions">
            <h4>Actions:</h4>
            <ul>
              {card.actions.map((action) => (
                <li key={action.id}>
                  <span className="action-type">{action.type}</span>
                  <span className="action-value">({action.value})</span>
                  <span className="action-desc">- {action.description}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            className="play-card-btn"
            onClick={() => onPlayCard(card)}
          >
            Play Card
          </button>
        </div>
      ))}
    </div>
  )
}

export default CardList
