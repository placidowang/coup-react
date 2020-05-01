import React from 'react'
import { connect } from 'react-redux'
import './Player.css'

class Player extends React.Component {
  componentDidUpdate() {
    // console.log(this.props.player)
  }

  render() {
    return (
      <div className='player-container'>
        <p className='player-name'>{this.props.username}</p>
        <p>Current hand: </p>
        <p>Coins: {this.props.coins}</p>
        <p>Actions: {this.props.actions.join(', ')}</p>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    pubnub: state.connectionReducer.pubnub,
    gameChannel: state.connectionReducer.gameChannel,
    isHost: state.connectionReducer.isHost,
    username: state.playerReducer.username,
    hand: state.playerReducer.hand,
    coins: state.playerReducer.coins,
    actions: state.playerReducer.actions,
    players: state.connectionReducer.players,
    deck: state.gameReducer.deck,
    player: state.playerReducer,
  }
}

export default connect(mapStateToProps)(Player)