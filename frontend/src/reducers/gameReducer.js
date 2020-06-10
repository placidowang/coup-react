const initialState = {
  players: [], // pubnub.hereNow?
  deck: [],
  treasury: 50,
  activePlayer: {},
  whosTurnIsIt: 0,
}

export default function gameReducer(state = initialState, action) {
  switch (action.type) {
    case 'initializeDeck':
      return {...state,
        deck: action.cards
      }
    case 'updateDeck':
      return {
        ...state,
        deck: action.updatedDeck
      }
    case 'updatePlayer':
      const i = state.players.indexOf(state.players.find(player => player.id === action.player.id))
      const updatedPlayers = [...state.players]
      updatedPlayers[i] = action.player
      return {...state,
        players: updatedPlayers
      }
    case 'changeTreasury':
      return {...state,
        treasury: state.treasury + action.amt
      }
    case 'updateTreasury':
      return {...state,
        treasury: action.treasury
      }
    case 'addToPlayers':
      const newPlayers = [...state.players]
      newPlayers.push(action.player)
      return {...state,
        players: newPlayers
      }
    case 'updatePlayers':
      return {...state,
        players: action.players
      }
    case 'setActivePlayer':
      return {...state,
        activePlayer: state.players[state.whosTurnIsIt]
      }
    case 'endTurn':
      do {
        state.whosTurnIsIt = (state.whosTurnIsIt + 1) % state.players.length
      }
      while (state.players[state.whosTurnIsIt].gameOver === true)
      return state
    default:
      return state
  }
}