import React from 'react';
import Swal from 'sweetalert2/dist/sweetalert2.js'
import { connect } from 'react-redux'
import Player from '../containers/Player.js'
import OpponentsContainer from '../containers/OpponentsContainer.js'
import './Game.css'

class Game extends React.Component {
  componentDidMount(){
    if (this.props.isHost) {
      fetch('http://localhost:3000/deck')
      .then(r => r.json())
      .then(deckData => {
        this.initializeGame(deckData)
      })
    }

    // if (this.props.gameChannel) {
      this.props.pubnub.getMessage(this.props.gameChannel, (msg) => {
        switch (msg.message.type) {
          case 'updateDeck':
            this.props.updateDeck(msg.message.updatedDeck)
            break
          case 'updatePlayer':
            this.props.updatePlayer(msg.message.player)
            break
          case 'changeTreasury':
            this.props.changeTreasury(msg.message.amt)
            break
          case 'updateTreasury':
            this.props.updateTreasury(msg.message.treasury)
            break
          case 'addCardsToHand':
            this.props.setActivePlayer()
            if (msg.message.playerId === this.props.player.id) {
              this.props.addCardsToHand(msg.message.cards)
            }
            break
          case 'endTurn':
            this.props.endTurn()
            console.log(this.props.whosTurnIsIt)
            this.props.setActivePlayer()
            break
          case 'alert':
            if (this.props.player.id !== msg.message.fromPlayerId) {
              // alert(msg.message.message)
              // let timerInterval
              Swal.fire({
                title: `Oh SHIT, ${msg.message.message}`,
                timer: 5000,
                timerProgressBar: true,
                showCancelButton: true,
                // cancelButtonColor: '#B0B0B0',
                cancelButtonText: 'Let him get away with it... this time',
                confirmButtonText: 'CHALLENGE the bastard.',
                html: "<span class='swal2-text'><b></b></span>",
                onBeforeOpen: () => {
                  // Swal.showLoading()
                  setInterval(() => {
                    const content = Swal.getContent()
                    if (content) {
                      const b = content.querySelector('b')
                      // if (b) {
                      if (b && Swal.getTimerLeft()) {
                        const timeLeft = Swal.getTimerLeft() >= 1000
                          ? parseInt(Swal.getTimerLeft().toString().slice(0,1)) + 1
                          : 1
                        b.textContent = timeLeft
                        // b.textContent = Swal.getTimerLeft()
                      }
                    }
                  }, 100)
                },
                // onClose: () => {
                //   clearInterval(timerInterval)
                // }
              })
              .then(r => {
                if (r.value) {
                  console.log('send challenge to: ' + msg.message.fromPlayerId)
                  this.props.pubnub.publish({
                    message: {
                      type: 'challenge',
                      challengedPlayerId: msg.message.fromPlayerId,
                      challengerPlayerId: this.props.player.id
                    },
                    channel: this.props.gameChannel
                  })
                } else {
                  console.log("Where's your honor??")
                }
              })
            } else {
              Swal.fire({
                title: 'Waiting for other players.',
                allowOutsideClick: false,
                showConfirmButton: false,
                timer: 5000,
                timerProgressBar: true,
              })
            }
            break
          case 'challenge':
            // console.log(this.props.player.id)
            // console.log(msg)
            // console.log(msg.message.challengedPlayerId + ' has been challenged!')
            if (this.props.player.id === msg.message.challengedPlayerId) {
              Swal.close()
              Swal.fire({
                title: "You've been challenged!!",
                showCancelButton: true,
                cancelButtonText: 'Back down',
                confirmButtonText: 'Oh YEAH??'
              })
            } else if (this.props.player.id === msg.message.challengerPlayerId) {
              console.log("You have challenged the player!")
              Swal.fire('You have challenged the player!')
            } else {
              console.log("Player has been challenged.")
              Swal.close()
            }
            break
          case 'log':
            console.log(msg.message.text)
            break
          default:
            console.error('Unknown game message.')
            console.log(msg)
        }
      })
    // }

    // initiate treasury for every player
    this.props.changeTreasury(-(this.props.players.length * 2))
  }
  
  componentDidUpdate() {
    // console.log(this.props.deck)

  }

  initializeGame = (deckData) => {
    const deck = deckData.cards.map(card => ({...card, isRevealed: false}))
    const shuffledDeck = this.shuffleDeck(deck)
    this.distributeCards(shuffledDeck)
  }

  shuffleDeck = (deck = [...this.props.deck]) => {
    for (let i = deck.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]]
    }

    this.updateDeck(deck)
    return deck
  }

  updateDeck = (deck) => {
    this.props.pubnub.publish({
      message: { type: 'updateDeck', updatedDeck: deck },
      channel: this.props.gameChannel
    })
  }

  // consider sending message for everyone to draw 2 cards
  distributeCards = (deck) => {
    for (const player of this.props.players) {
      const card1 = deck.shift()
      const card2 = deck.shift()

      this.props.pubnub.publish({
        message: {
          type: 'addCardsToHand',
          playerId: player.id,
          cards: [card1, card2]
        },
        channel: this.props.gameChannel
      })
    }

    this.updateDeck(deck)
  }

  // ehhhhhhhhh
  // drawCard = () => {
  //   const card = this.props.deck[0]
  //   console.log('drew ' + card)
  //   this.props.drawCard(card)
  //   this.props.removeCardFromDeck()
  // }

  // need this in case players aren't automatically synced, which they probably won't be
  // currently being used in Player.js
  updatePlayer = () => {

  }

  endTurn = () => {
    this.props.pubnub.publish({
      message: { type: 'endTurn' },
      channel: this.props.gameChannel
    })
  }


  
  testMsg = (msg) => {
    this.props.pubnub.publish({
      message: {type: 'log', text: msg},
      channel: this.props.gameChannel
    })
  }

  hereNow = () => {
    this.props.pubnub.hereNow({
      channels: [this.props.gameChannel]
    })
    .then(console.log)
  }

  logPlayers = () => {
    console.log(this.props.players)
  }

  render() {
    return (
      <div className='game'>
        <OpponentsContainer />
        <p>Deck: {this.props.deck.map(card => card.name).join(', ')}</p>
        <p>Treasury: {this.props.treasury} coins</p>

        <button onClick={()=>this.shuffleDeck()}>Shuffle Deck</button>
        {/* <button onClick={() => this.testMsg('GAME YO')}>message</button> */}
        <button onClick={this.hereNow}>log who's here</button>
        <button onClick={this.logPlayers}>log players</button>
        <br/><button onClick={this.endTurn}>End Turn</button>

        <p>Whose turn: {this.props.activePlayer.username ? this.props.activePlayer.username : null}</p>

        {/* <p style={{fontSize: '20px'}}>Players: {this.props.players.map(player => player.username).join(', ')}</p> */}
        <Player />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    pubnub: state.connectionReducer.pubnub,
    gameChannel: state.connectionReducer.gameChannel,
    isHost: state.connectionReducer.isHost,
    player: state.playerReducer,
    players: state.gameReducer.players,
    deck: state.gameReducer.deck,
    treasury: state.gameReducer.treasury,
    whosTurnIsIt: state.gameReducer.whosTurnIsIt,
    activePlayer: state.gameReducer.activePlayer,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    initDeck: ((cards) => dispatch({type: 'initializeDeck', cards: cards})),
    updateDeck: ((deck) => dispatch({type: 'updateDeck', updatedDeck: deck})),
    updatePlayer: ((player) => dispatch({type: 'updatePlayer', player: player})),
    // drawCard: ((card) => dispatch({type: 'drawCard', card: card})),
    addCardsToHand: ((cards) => dispatch({type: 'addCardsToHand', cards: cards})),
    changeTreasury: ((amt) => dispatch({type: 'changeTreasury', amt: amt})),
    updateTreasury: ((treasury) => dispatch({type: 'updateTreasury', treasury: treasury})),
    setActivePlayer: (() => dispatch({type: 'setActivePlayer'})),
    endTurn: (() => dispatch({type: 'endTurn'})),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Game)
