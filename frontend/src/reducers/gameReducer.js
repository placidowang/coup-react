const initialState = {
  deck: [],
  isPlaying: false,

}

export default function gameReducer(state = initialState, action) {
  switch(action.type) {
    case 'initializeDeck':
      return {
        ...state,
        deck: action.cards
      }
    case 'startGame':
      return {
        ...state,
        isPlaying: true
      }
    case 'shuffleDeck':
      return {
        ...state,
        deck: action.shuffledDeck
      }
    default:
      return state
  }
}