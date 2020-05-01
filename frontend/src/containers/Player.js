import React from 'react'
import { connect } from 'react-redux'
import './Player.css'

class Player extends React.Component {
  componentDidUpdate() {
    // console.log(this.props.player)
  }

  render() {
    const player = this.props.player
    return (
      <div className='player-container'>
        <p className='player-name'>{player.username}</p>
        <p>Current hand: {player.hand.map(card => card.name).join(', ')}</p>
        <p>Coins: {player.coins}</p>
        <p>Actions: {player.actions.join(', ')}</p>
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
  }
}

export default connect(mapStateToProps)(Player)