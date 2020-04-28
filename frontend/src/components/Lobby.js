import React from 'react'
import { connect } from 'react-redux'

class Lobby extends React.Component {
  createLobby = () => {
    const roomId = Math.random().toString(36).slice(2,7).toUpperCase()
    // const roomId = 'AAA'
    this.props.setRoomId(roomId)
    this.props.createLobby(`react-coup-${roomId}`)

    this.props.pubnub.subscribe({
      channels: [`react-coup-${roomId}`],
      withPresence: true
    })

    
  }

  joinLobby = (e) => {
    e.preventDefault()
    const roomId = e.target[0].value.toUpperCase()
    const lobbyChannel = `react-coup-${roomId}`

    this.props.setRoomId(roomId)
    this.props.joinLobby(lobbyChannel)

    this.props.pubnub.subscribe({
      channels: [lobbyChannel],
      withPresence: true
    })
  }

  startGame = () => {
    console.log('starting game')
    this.props.startGame()
  }

  componentDidUpdate() {
    // console.log(this.props.pubnub)
    // console.log(this.props.lobbyChannel)
    if (this.props.lobbyChannel) {
      // debugger
      this.props.pubnub.getMessage(this.props.lobbyChannel, (msg) => {
        console.log(msg.message.test)
      })
    }
  }

  componentWillUnmount() {
    this.props.pubnub.unsubscribe({
      channels: [this.props.lobbyChannel, this.props.gameChannel]
    })
  }
  
  testMsg = (msg) => {
    this.props.pubnub.publish({
      message: {
        test: msg
      },
      channel: this.props.lobbyChannel
    })

  }

  hereNow = () => {
    this.props.pubnub.hereNow({
      channels: [this.props.lobbyChannel]
    })
    .then(console.log)
  }

  render() {
    return(
      <div>
        {!this.props.lobbyChannel &&
          <div>
            <p>Welcome, <span style={{color: 'red', fontSize: 40}}>{this.props.username}</span>.</p>
            <button onClick={this.createLobby} className='createLobby'>Create Lobby</button>

            <form onSubmit={(e)=>this.joinLobby(e)}>
              <input type='text' placeholder='Enter Lobby ID'/>
              <button type='submit'>Join Lobby</button>
            </form>


          </div>
        }

        {this.props.lobbyChannel &&
          <div>
            <p>Room ID: <br/>{this.props.roomId}</p>
            <br/><button onClick={this.startGame}>BEGIN</button>

            <button onClick={() => this.testMsg('i am hostman')}>send him a message</button>

            <button onClick={()=>this.testMsg('hey host')}>msg</button>

            <button onClick={this.hereNow}> who here</button>

          </div>
        }
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    pubnub: state.connectionReducer.pubnub,
    roomId: state.connectionReducer.roomId,
    lobbyChannel: state.connectionReducer.lobbyChannel,

    username: state.playerReducer.username,
    isHost: state.connectionReducer.isHost
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setRoomId: ((roomId) => dispatch({type: 'setRoomId', roomId: roomId})),
    createLobby: ((lobbyChannel) => dispatch({type: 'createLobby', lobbyChannel: lobbyChannel})),
    joinLobby: ((lobbyChannel) => dispatch({type: 'joinLobby', lobbyChannel: lobbyChannel})),
    startGame: (() => dispatch({type: 'startGame'})),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Lobby)