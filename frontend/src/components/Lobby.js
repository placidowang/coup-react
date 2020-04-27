import React from 'react'
import { connect } from 'react-redux'

class Lobby extends React.Component {
  createLobby = () => {

  }

  joinLobby = () => {

  }

  startGame = () => {
    console.log('starting game')
    this.props.startGame()
  }

  render() {
    return(
      <div>
        {/* create lobby button */}
        {/* join lobby button */}
        <button onClick={this.startGame}>BEGIN</button>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    pubnub: state.connectionReducer.pubnub,
    username: state.playerReducer.username,
    // isPlaying: state.gameReducer.isPlaying,

  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    startGame: (() => dispatch({type: 'startGame'}))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Lobby)