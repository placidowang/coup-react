import React from 'react'
import { connect } from 'react-redux'
import Swal from 'sweetalert2'

class Lobby extends React.Component {
  componentDidMount() {

  }

  componentDidUpdate() {
    if (this.props.lobbyChannel) {
      this.props.pubnub.getMessage(this.props.lobbyChannel, (msg) => {
        switch (msg.message.type) {
          case 'startGame':
            Swal.close()
            this.playGame()
            break
          case 'log':
            console.log(msg.message.text)
            break
          case 'addToPlayers':
            this.props.isHost &&
              this.addToPlayers(msg.message.player)
            break
          case 'updatePlayers':
            this.updatePlayers(msg.message.players)
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
    const roomId = Math.random().toString(36).slice(2,6).toUpperCase()

    // try again if roomId already exists
    this.props.pubnub.hereNow({channels: [`coup-lobby-${roomId}`]})
    .then(channel => {
      if (channel.totalOccupancy === 0) {
        this.props.setHost()
        this.subscribeToLobby(roomId)
      } else {
        console.log('Trying a different roomId')
        this.createLobby()
      }
    })
  }

  joinLobby = (e) => {
    e.preventDefault()
    const roomId = e.target[0].value.toUpperCase()
    if (roomId.length === 0) {
      Swal.fire('Please enter a Room ID')
      return
    }

    this.props.pubnub.hereNow({channels: [`coup-lobby-${roomId}`]})
    .then(channel => {
      if (channel.totalOccupancy === 0) {
        console.error("Room doesn't exist!")
        Swal.fire("Room doesn't exist!")
      } else if (channel.totalOccupancy < 5) {
        console.log('You are not the host.')
        this.subscribeToLobby(roomId)
      } else {
        console.error('Room is full!')
        Swal.fire('Room is full!')
      }
    })
  }

  subscribeToLobby = (roomId) => {
    const lobbyChannel = `coup-lobby-${roomId}`

    // console.log(`Setting roomId to: ${roomId}`)
    this.props.setRoomId(roomId)
    this.props.joinLobby(lobbyChannel)

    console.log(`Joining lobbyChannel: ${lobbyChannel}`)
    this.props.pubnub.subscribe({
      channels: [lobbyChannel],
      withPresence: true
    })
    
    this.props.pubnub.publish({
      message: {
        type: 'addToPlayers',
        player: this.props.player
      },
      channel: lobbyChannel
    })
  }

  // async/await, just in case
  addToPlayers = async(player) => {
    await this.props.addToPlayers(player)
    // console.log(this.props.players)
    this.props.pubnub.publish({
      message: {
        type: 'updatePlayers',
        players: this.props.players
      },
      channel: this.props.lobbyChannel
    })
  }

  updatePlayers = (players) => {
    if (!this.props.isHost) {
      this.props.updatePlayers(players)
    }
  }

  startGame = () => {
    // this.props.pubnub.hereNow({channels: [this.props.lobbyChannel]})
    // .then(channel => {
      // console.log(channel)
      if (!this.props.isHost) {
        console.log('You are NOT the host!!')
        Swal.fire('Please wait for the host to start the game.')
      // } else if (channel.totalOccupancy > 1) {
      } else if (this.props.players.length > 1) {
        console.log('Starting game')

        // publish message for everyone to start game
        this.props.pubnub.publish({
          message: { type: 'startGame' },
          channel: this.props.lobbyChannel
        })
      } else {
        console.log('Please wait for at least one opponent.')
        Swal.fire('Please wait for at least one opponent.')
      }
    // })
  }

  playGame = () => {
    const gameChannel = `coup-game-${this.props.roomId}`

    this.props.joinGame(gameChannel)

    this.props.pubnub.subscribe({
      channels: [gameChannel],
      withPresence: true
    })

    console.log(`Joining gameChannel: ${this.props.gameChannel}`)
    console.log('Game start!!')

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
      channels: [this.props.lobbyChannel]
    })
    .then(console.log)
  }

  render() {
    // console.log('rendering: ' + this.props.players)
    // this.props.players.map(player => console.log(player.username))
    return(
      <div>
        <p>Welcome, <span style={{color: 'red', fontSize: 40}}>{this.props.player.username}</span>.</p>

        {!this.props.lobbyChannel &&
          <div>
            <button onClick={this.createLobby} className='createLobby'>Create Room</button>

            <form onSubmit={(e)=>this.joinLobby(e)}>
              <input type='text' placeholder='Enter Room ID'/>
              <button type='submit'>Join Room</button>
            </form>

          </div>
        }

        {this.props.lobbyChannel &&
          <div>
            <p>Room ID <br/>{this.props.roomId}</p>
            <div className='lobby-player-list-container'>
              {/* <p>{this.props.player.username + ' (You)'}</p> */}
              <div className='lobby-player-list'>
                <p className='lobby-player-list-title'>Players</p>
                {this.props.players.map(player => <p key={player.id}>{player.username}</p>)}
              </div>
            </div>

            <br/><button onClick={this.startGame} className='start'>START</button>
            {/* <button onClick={() => this.testMsg('i am hostman')}>send him a message</button> */}
            {/* <button onClick={()=>this.testMsg('hey host')}>msg</button> */}
            {/* <button onClick={this.hereNow}>who here</button> */}

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
    isHost: state.connectionReducer.isHost,
    player: state.playerReducer,
    players: state.gameReducer.players,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setRoomId: ((roomId) => dispatch({type: 'setRoomId', roomId: roomId})),
    setHost: (() => dispatch({type: 'setHost'})),
    joinLobby: ((lobbyChannel) => dispatch({type: 'joinLobby', lobbyChannel: lobbyChannel})),
    joinGame: ((gameChannel) => dispatch({type: 'joinGame', gameChannel: gameChannel})),
    addToPlayers: ((player) => dispatch({type: 'addToPlayers', player: player})),
    playGame: (() => dispatch({type: 'playGame'})),
    updatePlayers: ((players) => dispatch({type: 'updatePlayers', players: players})),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Lobby)