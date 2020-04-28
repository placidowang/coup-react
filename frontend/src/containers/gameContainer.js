import React from 'react';
import { connect } from 'react-redux'
import Game from '../components/Game';
// import '../components/Game.css';
// import Board from '../components/Board';
// import Swal from "sweetalert2";  
// import shortid  from 'shortid';
import Lobby from '../components/Lobby.js'

class GameContainer extends React.Component {

  // Check that the player is connected to a channel


  render() {  
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
    username: state.playerReducer.username,
    isPlaying: state.gameReducer.isPlaying,

  }
}

const mapDispatchToProps = (dispatch) => {
  return {

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GameContainer)