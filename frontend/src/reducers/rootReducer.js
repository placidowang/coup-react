import playerReducer from './playerReducer.js'
import gameReducer from './gameReducer.js'
import {combineReducers} from 'redux'

const initialState = {
  players: [], // pubnub.hereNow?
  pubnub: null,
  roomId: '',
  lobbyChannel: '',
  gameChannel: '',
  isHost: false,
}

function connectionReducer(state = initialState, action) {
  switch(action.type) {
    case 'initPubnub':
      return {
        ...state,
        pubnub: action.pubnub
      }
    case 'setRoomId':
      console.log(`Setting roomId to: ${action.roomId}`)
      return {
        ...state,
        roomId: action.roomId
      }
    case 'setHost':
      return {
        ...state,
        isHost: true,
      }
    case 'joinLobby':
      return {
        ...state,
        lobbyChannel: action.lobbyChannel
      }
    case 'joinGame':
      return {
        ...state,
        gameChannel: action.gameChannel
      }
    default:
      return state
  }
}

const rootReducer = combineReducers({connectionReducer, playerReducer, gameReducer})
export default rootReducer