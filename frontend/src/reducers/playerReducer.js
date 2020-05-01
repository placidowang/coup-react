const initialState = {
  id: NaN,
  username: Math.random().toString(36).slice(2,10),
  // username: '',
  hand: [],
  coins: 2,
  actions: ['Income', 'Foreign Aid', 'Coup', 'Tax', 'Assassinate', 'Exchange', 'Steal'],
  myTurn: false,
}

export default function playerReducer(state = initialState, action) {
  switch (action.type) {
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
    // case 'drawCard':
    //   state.hand.push(action.card)
    //   return state
    case 'addCardsToHand':
      return {
        ...state,
        hand: [...state.hand, ...action.cards]
      }
    default:
      return state
  }
}