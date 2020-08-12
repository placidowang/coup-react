const initialState = {
  players: [], // pubnub.hereNow?
  deck: [
    {
      "id": 1,
      "name": "Duke",
      "img_url": null,
      "action": "Tax",
      "effect": "Take 3 coins",
      "counteraction": "Blocks Foreign Aid",
      "description": "Take 3 coins from Treasury. Blocks Foreign Aid.",
      "isRevealed": false
    },
    {
      "id": 2,
      "name": "Assassin",
      "img_url": null,
      "action": "Assassinate",
      "effect": "Pay 3 coins - Choose player to lose influence",
      "counteraction": "",
      "description": "Pay 3 coins to assassinate another player.",
      "isRevealed": false
    },
    {
      "id": 3,
      "name": "Ambassador",
      "img_url": null,
      "action": "Exchange",
      "effect": "Exchange cards with Court Deck",
      "counteraction": "Blocks stealing",
      "description": "Exchange cards with Court Deck. Blocks stealing.",
      "isRevealed": false
    },
    {
      "id": 4,
      "name": "Captain",
      "img_url": null,
      "action": "Steal",
      "effect": "Take 2 coins from another player",
      "counteraction": "Blocks stealing",
      "description": "Steal 2 coins from another player. Blocks stealing.",
      "isRevealed": false
    },
    {
      "id": 5,
      "name": "Contessa",
      "img_url": null,
      "action": "",
      "effect": "",
      "counteraction": "Blocks assassination",
      "description": "Blocks assassination.",
      "isRevealed": false
    },
    {
      "id": 6,
      "name": "Duke",
      "img_url": null,
      "action": "Tax",
      "effect": "Take 3 coins",
      "counteraction": "Blocks Foreign Aid",
      "description": "Take 3 coins from Treasury. Blocks Foreign Aid.",
      "isRevealed": false
    },
    {
      "id": 7,
      "name": "Assassin",
      "img_url": null,
      "action": "Assassinate",
      "effect": "Pay 3 coins - Choose player to lose influence",
      "counteraction": "",
      "description": "Pay 3 coins to assassinate another player.",
      "isRevealed": false
    },
    {
      "id": 8,
      "name": "Ambassador",
      "img_url": null,
      "action": "Exchange",
      "effect": "Exchange cards with Court Deck",
      "counteraction": "Blocks stealing",
      "description": "Exchange cards with Court Deck. Blocks stealing.",
      "isRevealed": false
    },
    {
      "id": 9,
      "name": "Captain",
      "img_url": null,
      "action": "Steal",
      "effect": "Take 2 coins from another player",
      "counteraction": "Blocks stealing",
      "description": "Steal 2 coins from another player. Blocks stealing.",
      "isRevealed": false
    },
    {
      "id": 10,
      "name": "Contessa",
      "img_url": null,
      "action": "",
      "effect": "",
      "counteraction": "Blocks assassination",
      "description": "Blocks assassination.",
      "isRevealed": false
    },
    {
      "id": 11,
      "name": "Duke",
      "img_url": null,
      "action": "Tax",
      "effect": "Take 3 coins",
      "counteraction": "Blocks Foreign Aid",
      "description": "Take 3 coins from Treasury. Blocks Foreign Aid.",
      "isRevealed": false
    },
    {
      "id": 12,
      "name": "Assassin",
      "img_url": null,
      "action": "Assassinate",
      "effect": "Pay 3 coins - Choose player to lose influence",
      "counteraction": "",
      "description": "Pay 3 coins to assassinate another player.",
      "isRevealed": false
    },
    {
      "id": 13,
      "name": "Ambassador",
      "img_url": null,
      "action": "Exchange",
      "effect": "Exchange cards with Court Deck",
      "counteraction": "Blocks stealing",
      "description": "Exchange cards with Court Deck. Blocks stealing.",
      "isRevealed": false
    },
    {
      "id": 14,
      "name": "Captain",
      "img_url": null,
      "action": "Steal",
      "effect": "Take 2 coins from another player",
      "counteraction": "Blocks stealing",
      "description": "Steal 2 coins from another player. Blocks stealing.",
      "isRevealed": false
    },
    {
      "id": 15,
      "name": "Contessa",
      "img_url": null,
      "action": "",
      "effect": "",
      "counteraction": "Blocks assassination",
      "description": "Blocks assassination.",
      "isRevealed": false
    }
  ],
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