import React from 'react'
import { connect } from 'react-redux'
import './Player.css'
import Card from '../components/Card.js'

class Player extends React.Component {
  componentDidMount() {

  }
  
  componentDidUpdate() {
    // console.log(this.props.player)
  }

  yourTurn = () => {
    return (this.props.activePlayer.id === this.props.player.id)
  }

  // don't need to account for turn anymore; actions are disabled if it's not your turn
  takeAction = (action) => {
    console.log(action)
    switch (action) {
      case 'Income':
        this.updateCoins(1)
        this.endTurn()
        break
      case 'Foreign Aid':
        this.updateCoins(2)
        this.endTurn()
        break
      default:
        console.error('Invalid player action')
    }
  }

  updatePlayer = () => {
    console.log(this.props.player.coins + 'coins')
    this.props.pubnub.publish({
      message: {
        type: 'updatePlayer',
        player: this.props.player
      },
      channel: this.props.gameChannel
    })
  }

  updateCoins = (amt) => {
    this.props.updateCoins(amt)
    this.props.updateTreasury(-amt)
    this.updatePlayer()
  }

  endTurn = () => {
    this.props.pubnub.publish({
      message: { type: 'endTurn' },
      channel: this.props.gameChannel
    })
  }

  render() {
    const player = this.props.player
    const actions = []
    for (const action in this.props.player.actions) {
      actions.push(this.props.player.actions[action])
    }
    return (
      <div className='player-container'>
        <div className='player-name-hand-coin-container'>
          <div className='player-name-coins-container'>
            <p className='player-name'>{player.username}</p>
            <p className='coins'>Coins: {player.coins}</p>
          </div>
          <div className='hand-container'>
            <p>Hand </p>
            <div className='hand'>
              {player.hand.map(card => <Card key={card.id} card={card} />)}
            </div>
          </div>
        </div>
        <div className='actions'>Actions: 
          {actions.map(action => 
            <div className='actions' key={action.action}>
              <button onClick={e => this.takeAction(e.target.value)} value={action.action} disabled={this.yourTurn() ? '' : 'disabled'}>{action.action}</button>
            </div>
          )}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    pubnub: state.connectionReducer.pubnub,
    gameChannel: state.connectionReducer.gameChannel,
    isHost: state.connectionReducer.isHost,
    players: state.connectionReducer.players,
    deck: state.gameReducer.deck,
    player: state.playerReducer,
    activePlayer: state.gameReducer.activePlayer,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    endTurn: (() => dispatch({type: 'endTurn'})),
    updateCoins: ((amt) => dispatch({type: 'updateCoins', amt: amt})),
    updateTreasury: ((amt) => dispatch({type: 'updateTreasury', amt: amt})),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Player)