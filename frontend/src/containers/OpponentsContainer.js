import React from 'react'
import { connect } from 'react-redux'
import Opponent from '../components/Opponent.js'
import './Opponents.css'


class OpponentsContainer extends React.Component {
  
  
  render() {
    const opponents = this.props.players.filter(player => player.id !== this.props.player.id)
    return(
      <div className='opponents-container'>
        <p className='opponents-title'>Opponents</p>
        <div className='opponents'>
          {opponents.map(opponent =>
              <Opponent key={opponent.id} opponent={opponent} />
          )}
        </div>
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

export default connect(mapStateToProps)(OpponentsContainer)