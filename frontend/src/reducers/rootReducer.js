import playerReducer from './playerReducer.js'
import gameReducer from './gameReducer.js'
import {combineReducers} from 'redux'

const initialState = {
  pubnub: null,
  roomId: '',
  lobbyChannel: '',
  gameChannel: '',
  isHost: false,
  isPlaying: false,
  // isPlaying: true,  // probably don't use this anymore, game requires channel connection
}

function connectionReducer(state = initialState, action) {
  switch (action.type) {
    case 'initPubnub':
      return {...state,
        pubnub: action.pubnub
      }
    case 'setRoomId':
      return {...state,
        roomId: action.roomId
      }
    case 'setHost':
      return {...state,
        isHost: true,
      }
    case 'joinLobby':
      return {...state,
        lobbyChannel: action.lobbyChannel
      }
    case 'joinGame':
      return {...state,
        gameChannel: action.gameChannel
      }
    case 'playGame':
      return {...state,
        isPlaying: true
      }
    default:
      return state
  }
}

const rootReducer = combineReducers({connectionReducer, playerReducer, gameReducer})
export default rootReducer