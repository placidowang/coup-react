import React from 'react'
import { connect } from 'react-redux'
import './Player.css'

class Player extends React.Component {
  componentDidMount() {
    // this.props.pubnub.getMessage(this.props.gameChannel, (msg) => {
    //   switch (msg.message.type) {

    //     case 'nextTurn':
    //       this.props.nextTurn()
    //       console.log(this.props.whosTurnIsIt)
    //       this.props.setActivePlayer()
    //       break
    //     case 'log':
    //       console.log(msg.message.text)
    //       break
    //     default:
    //       console.error('Unknown player message.')
    //       console.log(msg)
    //   }
    // })
  }
  componentDidUpdate() {
    // console.log(this.props.player)
  }

  takeAction = (action) => {
    console.log(action)
  }

  // nextTurn = () => {
  //   this.props.pubnub.publish({
  //     message: { type: 'nextTurn' },
  //     channel: this.props.gameChannel
  //   })
  // }

  render() {
    const player = this.props.player
    return (
      <div className='player-container'>
        <p className='player-name'>{player.username}</p>
        <p>Current hand: {player.hand.map(card => card.name).join(', ')}</p>
        <p>Coins: {player.coins}</p>
        <div>Actions: {player.actions.map(action => 
          <button onClick={e => this.takeAction(e.target.value)} value={action} key={action}>{action}</button>)}</div>
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

const mapDispatchToProps = (dispatch) => {
  return {
    nextTurn: (() => dispatch({type: 'nextTurn'})),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Player)