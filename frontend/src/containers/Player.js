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
        if (this.props.treasury >= 1) {
          this.updateCoins(1)
          // await this.props.changeTreasury(-amt)
          this.updateTreasury(-1)
          this.endTurn()
        } else {
          console.error('Not enough coins in Treasury')
        }
        break
      case 'Foreign Aid':
        if (this.props.treasury >= 2) {
          this.alertPlayers(`Oh SHIT, ${this.props.player.username} is trying to Foreign Aid!!!`)
          this.updateCoins(2)
          this.updateTreasury(-2)
          this.endTurn()
        } else {
          console.error('Not enough coins in Treasury')
        }
        break
      case 'Tax':
        if (this.props.treasury >= 3) {
          this.updateCoins(3)
          this.updateTreasury(-3)
          this.endTurn()
        } else {
          console.error('Not enough coins in Treasury')
        }
        break
      case 'Coup':
        this.targetPlayer()
        break

      default:
        console.error('Invalid player action')
    }
  }

  updatePlayer = () => {
    // console.log(this.props.player.coins + 'coins')
    this.props.pubnub.publish({
      message: {
        type: 'updatePlayer',
        player: this.props.player
      },
      channel: this.props.gameChannel
    })
  }

  updateTreasury = (amt) => {
    // console.log(this.props.treasury)
    this.props.pubnub.publish({
      message: {
        type: 'updateTreasury',
        treasury: this.props.treasury + amt
      },
      channel: this.props.gameChannel
    })
  }

  updateCoins = async(amt) => {
    await this.props.updateCoins(amt)
    this.updatePlayer()
  }

  targetPlayer = () => {

  }

  alertPlayers = (msg) => {
    this.props.pubnub.publish({
      message: {
        type: 'alert',
        fromPlayerId: this.props.player.id,
        message: msg
      },
      channel: this.props.gameChannel
    })
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
    treasury: state.gameReducer.treasury,
    player: state.playerReducer,
    activePlayer: state.gameReducer.activePlayer,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    endTurn: (() => dispatch({type: 'endTurn'})),
    updateCoins: ((amt) => dispatch({type: 'updateCoins', amt: amt})),
    changeTreasury: ((amt) => dispatch({type: 'changeTreasury', amt: amt})),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Player)