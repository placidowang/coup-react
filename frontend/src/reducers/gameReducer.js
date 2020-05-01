const initialState = {
  players: [], // pubnub.hereNow?
  deck: [],
  activePlayer: {},
  whosTurnIsIt: 0,
  gameOver: false,
}

export default function gameReducer(state = initialState, action) {
  switch (action.type) {
    case 'initializeDeck':
      return {
        ...state,
        deck: action.cards
      }
    case 'updateDeck':
      return {
        ...state,
        deck: action.updatedDeck
      }
    case 'addToPlayers':
      state.players.push(action.player)
      return state
    case 'updatePlayers':
      return {
        ...state,
        players: action.players
      }
    case 'setActivePlayer':
      return {
        ...state,
        activePlayer: state.players[state.whosTurnIsIt]
      }
    case 'nextTurn':
      return {
        ...state,
        whosTurnIsIt: (state.whosTurnIsIt + 1) % state.players.length
      }
    default:
      return state
  }
}