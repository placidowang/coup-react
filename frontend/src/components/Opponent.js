import React from 'react'
import { connect } from 'react-redux'

class Opponent extends React.Component {
  render() {
    return(
      <div className='opponent'>
        <p>{this.props.opponent.username}</p>
        <p>Coins: {this.props.opponent.coins}</p>
        <p>Hand: {this.props.opponent.hand.length}</p>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    player: state.playerReducer,
    players: state.gameReducer.players,
  }
}

export default connect(mapStateToProps)(Opponent)