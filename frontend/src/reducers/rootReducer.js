import PubNubReact from 'pubnub-react';
import keys from '../PubNub-keys.js'

import playerReducer from './playerReducer.js'
import gameReducer from './gameReducer.js'
import {combineReducers} from 'redux'

const initialState = {
  players: [],
  pubnub: new PubNubReact({
    publishKey: keys.publishKey, 
    subscribeKey: keys.subscribeKey    
  }),
  lobbyId: '',
  gameId: '',

}

function connectionReducer(state = initialState, action) {
  switch(action.type) {
    default:
      return state
  }
}

const rootReducer = combineReducers({connectionReducer, playerReducer, gameReducer})
export default rootReducer