const initialState = {
  id: NaN,
  // username: 'LORD DINGO',
  username: '',
  hand: [],
  coins: 2,
  actions: ['Income', 'Foreign Aid', 'Coup', 'Tax', 'Assassinate', 'Exchange', 'Steal']
}

export default function playerReducer(state = initialState, action) {
  switch(action.type) {
    case 'setUsername':
      return {
        ...state,
        username: action.username
      }
    default:
      return state
  }
}