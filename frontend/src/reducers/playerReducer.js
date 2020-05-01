const initialState = {
  id: NaN,
  username: 'LORD DINGO',
  // username: '',
  hand: [],
  coins: 2,
  actions: ['Income', 'Foreign Aid', 'Coup', 'Tax', 'Assassinate', 'Exchange', 'Steal'],
  myTurn: false,
}

export default function playerReducer(state = initialState, action) {
  switch(action.type) {
    case 'setId':
      return {
        ...state,
        id: action.id
      }
    case 'setUsername':
      return {
        ...state,
        username: action.username
      }
    default:
      return state
  }
}