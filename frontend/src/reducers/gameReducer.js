const initialState = {
  deck: [],
  isPlaying: false,
  // isPlaying: true,

}

export default function gameReducer(state = initialState, action) {
  switch(action.type) {
    case 'initializeDeck':
      return {
        ...state,
        deck: action.cards
      }
    case 'playGame':
      return {
        ...state,
        isPlaying: true
      }
    case 'updateDeck':
      return {
        ...state,
        deck: action.updatedDeck
      }
    default:
      return state
  }
}