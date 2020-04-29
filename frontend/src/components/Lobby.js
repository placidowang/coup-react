import React from 'react'
import { connect } from 'react-redux'

class Lobby extends React.Component {
  componentDidMount() {

  }

  componentDidUpdate() {
    if (this.props.lobbyChannel) {
      this.props.pubnub.getMessage(this.props.lobbyChannel, (msg) => {
        switch (msg.message.type) {
          case 'startGame':
            console.log('Game start!!')
            this.playGame()
            break
          case 'log':
            console.log(msg.message.text)
            break
          default:
            console.error('Unknown lobby message.')
            console.log(msg)
        }
      })
    }
  }

  createLobby = () => {
    console.log('You are the host!')
    const roomId = Math.random().toString(36).slice(2,7).toUpperCase()

    this.props.setHost()
    this.subscribeToLobby(roomId)
  }

  joinLobby = (e) => {
    console.log('You are not the host.')
    e.preventDefault()
    const roomId = e.target[0].value.toUpperCase()

    this.subscribeToLobby(roomId)
  }

  subscribeToLobby = (roomId) => {
    const lobbyChannel = `coup-lobby-${roomId}`

    this.props.setRoomId(roomId)
    this.props.joinLobby(lobbyChannel)

    console.log(`Joining lobbyChannel: ${lobbyChannel}`)
    this.props.pubnub.subscribe({
      channels: [lobbyChannel],
      withPresence: true
    })
  }

  startGame = () => {
    if (!this.props.isHost) {
      console.log('You are NOT the host!!')
      return
    } else {
      console.log('Starting game')

      // publish order for everyone to start game
      this.props.pubnub.publish({
        message: { type: 'startGame' },
        channel: this.props.lobbyChannel
      })

    }
  }

  playGame = () => {
    const gameChannel = `coup-game-${this.props.roomId}`

    this.props.joinGame(gameChannel)

    this.props.pubnub.subscribe({
      channels: [gameChannel],
      withPresence: true
    })

    console.log(`Joining gameChannel: ${this.props.gameChannel}`)

    this.props.playGame()
  }

  testMsg = (msg) => {
    this.props.pubnub.publish({
      message: {type: 'log', text: msg},
      channel: this.props.lobbyChannel
    })
  }

  hereNow = () => {
    this.props.pubnub.hereNow({
      channel: this.props.lobbyChannel
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
    gameChannel: state.connectionReducer.gameChannel,
    username: state.playerReducer.username,
    isHost: state.connectionReducer.isHost
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setRoomId: ((roomId) => dispatch({type: 'setRoomId', roomId: roomId})),
    setHost: (() => dispatch({type: 'setHost'})),
    joinLobby: ((lobbyChannel) => dispatch({type: 'joinLobby', lobbyChannel: lobbyChannel})),
    joinGame: ((gameChannel) => dispatch({type: 'joinGame', gameChannel: gameChannel})),
    playGame: (() => dispatch({type: 'playGame'})),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Lobby)