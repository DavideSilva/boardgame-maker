import { useState } from 'react'
import { Card, Action, ActionType } from '../types'
import './CardCreator.css'

interface CardCreatorProps {
  onAddCard: (card: Card) => void
}

const actionTypes: ActionType[] = ['move', 'attack', 'draw', 'heal', 'custom']

function CardCreator({ onAddCard }: CardCreatorProps) {
  const [cardName, setCardName] = useState('')
  const [cardDescription, setCardDescription] = useState('')
  const [actions, setActions] = useState<Action[]>([])
  const [currentAction, setCurrentAction] = useState<Partial<Action>>({
    type: 'move',
    value: 0,
    description: ''
  })

  const handleAddAction = () => {
    if (!currentAction.type || !currentAction.description) {
      alert('Please fill in action type and description')
      return
    }

    const newAction: Action = {
      id: Date.now().toString(),
      type: currentAction.type as ActionType,
      value: currentAction.value || 0,
      description: currentAction.description
    }

    setActions([...actions, newAction])
    setCurrentAction({
      type: 'move',
      value: 0,
      description: ''
    })
  }

  const handleRemoveAction = (actionId: string) => {
    setActions(actions.filter(a => a.id !== actionId))
  }

  const handleCreateCard = () => {
    if (!cardName.trim()) {
      alert('Please enter a card name')
      return
    }

    if (actions.length === 0) {
      alert('Please add at least one action')
      return
    }

    const newCard: Card = {
      id: Date.now().toString(),
      name: cardName,
      description: cardDescription,
      actions: actions
    }

    onAddCard(newCard)

    // Reset form
    setCardName('')
    setCardDescription('')
    setActions([])
  }

  return (
    <div className="card-creator">
      <div className="form-group">
        <label>Card Name *</label>
        <input
          type="text"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          placeholder="Enter card name"
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          value={cardDescription}
          onChange={(e) => setCardDescription(e.target.value)}
          placeholder="Enter card description"
          rows={2}
        />
      </div>

      <div className="actions-section">
        <h3>Actions</h3>

        <div className="action-form">
          <div className="form-group">
            <label>Action Type</label>
            <select
              value={currentAction.type}
              onChange={(e) => setCurrentAction({ ...currentAction, type: e.target.value as ActionType })}
            >
              {actionTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Value</label>
            <input
              type="text"
              value={currentAction.value}
              onChange={(e) => setCurrentAction({ ...currentAction, value: e.target.value })}
              placeholder="e.g., 3 or 'forward'"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <input
              type="text"
              value={currentAction.description}
              onChange={(e) => setCurrentAction({ ...currentAction, description: e.target.value })}
              placeholder="Describe the action"
            />
          </div>

          <button className="add-action-btn" onClick={handleAddAction}>
            Add Action
          </button>
        </div>

        <div className="actions-list">
          {actions.map((action) => (
            <div key={action.id} className="action-item">
              <div className="action-info">
                <strong>{action.type}</strong> ({action.value})
                <div className="action-desc">{action.description}</div>
              </div>
              <button
                className="remove-btn"
                onClick={() => handleRemoveAction(action.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        className="create-card-btn"
        onClick={handleCreateCard}
        disabled={!cardName || actions.length === 0}
      >
        Create Card
      </button>
    </div>
  )
}

export default CardCreator
