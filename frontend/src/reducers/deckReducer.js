let initialState = {
  deck: []
}

export default function deckReducer(state = initialState, action) {
  switch(action.type) {
    case 'initializeDeck':
      return {
        deck: action.cards
      }
    case 'shuffle':
      return state
    default:
      return state
  }
}