import React from 'react';
import { connect } from 'react-redux'
import Game from '../components/Game';
import Lobby from '../components/Lobby.js'

class GameContainer extends React.Component {
  render() {
    console.log(this.props.isPlaying ? 'game' : 'lobby')
    return (  
      <div>
        {!this.props.isPlaying &&
          <div>
            <Lobby />
          </div>
        }

        {this.props.isPlaying &&
          <Game />
        }
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    pubnub: state.connectionReducer.pubnub,
    isPlaying: state.connectionReducer.isPlaying,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GameContainer)