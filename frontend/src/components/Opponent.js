import React from 'react'
import { connect } from 'react-redux'

class Opponent extends React.Component {
  getId = (id) => {
    console.log(id)
    return id
  }

  render() {
    return(
      // <button onClick={(e) => this.logId(e.target.value)} value={this.props.opponent.id} className='opponent'>
      <div onClick={() => this.getId(this.props.opponent.id)}className='opponent'>
        <p className='opponent-name'>{this.props.opponent.username}</p>
        <p>Coins: {this.props.opponent.coins}</p>
        <p>Hand: {this.props.opponent.hand.length}</p>
      </div>
      // </button>
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