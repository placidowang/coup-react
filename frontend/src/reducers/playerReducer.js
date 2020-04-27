const initialState = {
  id: NaN,
  // username: 'LORD DINGO',
  username: '',
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