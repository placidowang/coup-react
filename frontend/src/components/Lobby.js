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

    // when there is a new activePlayer message, do I need to toggle myTurn?
  }

  createLobby = () => {
    console.log('You are the host!')
    const roomId = Math.random().toString(36).slice(2,7).toUpperCase()

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
    console.log('You are not the host.')
    e.preventDefault()
    const roomId = e.target[0].value.toUpperCase()

    // check if there's already 5 players:
    this.props.pubnub.hereNow({channels: [`coup-lobby-${roomId}`]})
    .then(channel => {
      if (channel.totalOccupancy < 5) {
        this.subscribeToLobby(roomId)
      } else {
        console.error('Room is full!')
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

  addToPlayers = (player) => {
    this.props.addToPlayers(player)
    // console.log(this.props.players)
    this.setState({}) // necessary to rerender playerlist? why not just updating reducer? is it because it's pushing player into array?
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
    if (!this.props.isHost) {
      console.log('You are NOT the host!!')
      return
    } else {
      console.log('Starting game')

      // publish message for everyone to start game
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

        {!this.props.lobbyChannel &&
          <div>
            <p>Welcome, <span style={{color: 'red', fontSize: 40}}>{this.props.player.username}</span>.</p>
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
            <div className='player-list'>
            <p>Players: </p>
              {/* <p>{this.props.player.username + ' (You)'}</p> */}
              {this.props.players.map(player => <p key={player.id}>{player.username}</p>)}
            </div>

            <br/><button onClick={this.startGame} className='start'>START</button>
            <button onClick={() => this.testMsg('i am hostman')}>send him a message</button>
            <button onClick={()=>this.testMsg('hey host')}>msg</button>
            <button onClick={this.hereNow}>who here</button>

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