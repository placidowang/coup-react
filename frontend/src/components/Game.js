import React from 'react';
import Swal from 'sweetalert2'
import { connect } from 'react-redux'
import Player from '../containers/Player.js'
import OpponentsContainer from '../containers/OpponentsContainer.js'
import Card from './Card.js'
import './Game.css'

const globalSwalTimer = 10000

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
              this.updatePlayer(this.props.player)
            }
            break
          case 'endTurn':
            // Swal.close()
            this.props.endTurn()
            console.log(this.props.whosTurnIsIt)
            this.props.setActivePlayer()
            break
          case 'alert':
            if (!this.isYourTurn()) {
              if (!msg.message.associatedCard && msg.message.counterCard) {
                Swal.fire({
                  title: `${this.props.activePlayer.username} is trying to use ${msg.message.action}!`,
                  timer: globalSwalTimer,
                  timerProgressBar: true,
                  showCancelButton: true,
                  cancelButtonText: `Let ${this.props.activePlayer.username} use ${msg.message.action}... this time.`,
                  confirmButtonText: `BLOCK ${this.props.activePlayer.username} with a ${msg.message.counterCard}.`,
                  html: `<span class='swal2-text'>Letting ${this.props.activePlayer.username} use ${msg.message.action} in <b></b></span>`,
                  onBeforeOpen: () => {
                    setInterval(() => {
                      const content = Swal.getContent()
                      if (content) {
                        const b = content.querySelector('b')
                        if (b && Swal.getTimerLeft()) {
                          b.textContent = Math.ceil(Swal.getTimerLeft() / 1000)
                        }
                      }
                    }, 100)
                  }
                })
                .then(r => {
                  if (r.value) {
                    this.props.pubnub.publish({
                      message: {
                        type: 'counter',
                        action: msg.message.action,
                        counterCard: msg.message.counterCard,
                        counteredPlayerId: this.props.activePlayer.id,
                        counteredPlayerUn: this.props.activePlayer.username,
                        counteringPlayerId: this.props.player.id,
                        counteringPlayerUn: this.props.player.username,
                      },
                      channel: this.props.gameChannel
                    })
                  } else {
                    console.log("Letting it slide")
                  }
                })
              }
              // include buttons to counter OR challenge
              else if (msg.message.associatedCard && msg.message.counterCard) {
                
              }
            } else {
              Swal.fire({
                title: 'Waiting for other players.',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                timer: globalSwalTimer,
                timerProgressBar: true,
              })
              .then(r => {
                if (r.dismiss === 'timer') {
                  Swal.fire({
                    title: `You used ${msg.message.action}!`,
                    showConfirmButton: false,
                    timer: 1500,
                    icon: 'success'
                  })
                  // case switch reward depending on action
                  this.updateCoins(2)
                  this.updateTreasury(-2)
                  this.endTurn()
                }
              })
            }
            break
          case 'counter':
            if (this.props.player.id === msg.message.counteredPlayerId) {
              Swal.close()
              Swal.fire({
                title: `${msg.message.counteringPlayerUn} is trying to BLOCK your ${msg.message.action} with a ${msg.message.counterCard}!`,
                showCancelButton: true,
                cancelButtonText: 'Back down',
                confirmButtonText: 'CHALLENGE',
                allowOutsideClick: false,
                allowEscapeKey: false,
                timer: globalSwalTimer,
                timerProgressBar: true,
                html: "<span class='swal2-text'>Backing down in <b></b></span>",
                onBeforeOpen: () => {
                  setInterval(() => {
                    const content = Swal.getContent()
                    if (content) {
                      const b = content.querySelector('b')
                      if (b && Swal.getTimerLeft()) {
                        b.textContent = Math.ceil(Swal.getTimerLeft() / 1000)
                      }
                    }
                  }, 100)
                }
              })
              .then(r => {
                if (r.value) {
                  console.log('send challenge to: ' + this.props.activePlayer)
                  this.props.pubnub.publish({
                    message: {
                      type: 'challenge',
                      challengedPlayerId: msg.message.counteringPlayerId,
                      challengedPlayerUn: msg.message.counteringPlayerUn,
                      challengingPlayerId: this.props.player.id,
                      challengingPlayerUn: this.props.player.username,
                      challengedCard: msg.message.counterCard
                    },
                    channel: this.props.gameChannel
                  })
                } else if (r.dismiss) {
                  console.log("Where's your honor??")
                  this.endTurn()
                }
              })
            } else if (this.props.player.id === msg.message.counteringPlayerId) {
              console.log(`You have attempted to block ${msg.message.counteredPlayerUn}'s ${msg.message.action}!`)
              Swal.fire({
                title: `You have attempted to block ${msg.message.counteredPlayerUn}'s ${msg.message.action}!`,
                timer: globalSwalTimer,
                timerProgressBar: true,
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
              })
              .then(r => {
                if (r.dismiss === 'timer') {
                  Swal.fire({
                    title: `You blocked ${msg.message.counteredPlayerUn}'s ${msg.message.action}!`,
                    icon: 'success',
                    timer: 1500,
                    timerProgressBar: true,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                  })
                }
              })
            } else {
              console.log(`${msg.message.counteringPlayerUn} has attempted to block ${msg.message.counteredPlayerUn}.`)
              Swal.close()
            }
            break
          case 'challenge':
            if (this.props.player.id === msg.message.challengedPlayerId) {
              Swal.close()
              const challengedCard = this.props.player.hand.find(card => card.name === msg.message.challengedCard)
              if (challengedCard && !challengedCard.isRevealed) {
                Swal.fire({
                  title: `${msg.message.challengingPlayerUn} challenged you!`,
                  showCancelButton: true,
                  cancelButtonText: "Lose a card (Hint: don't do this)",
                  confirmButtonText: `Show my ${msg.message.challengedCard}.`
                })
                .then(r => {
                  if (r.value) {
                    this.showCard(msg.message.challengedCard)
                  } else if (r.dismiss) {
                    this.loseCard()
                  }
                })
              } else {
                Swal.fire({
                  title: 'You were called out!',
                  timer: 1500,
                  showConfirmButton: false,
                  allowOutsideClick: false,
                  allowEscapeKey: false,
                })
                .then(r => this.loseCard())
              }
            } else if (this.props.player.id === msg.message.challengingPlayerId) {
              console.log(`You challenged ${msg.message.challengedPlayerUn}'s ${msg.message.challengedCard}!`)
              Swal.fire({
                title: `You challenged ${msg.message.challengedPlayerUn}'s ${msg.message.challengedCard}!`,
                showConfirmButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                // need to have no timer, wait on challenged player's response
                timer: globalSwalTimer,
                timerProgressBar: true,
              })
            } else {
              console.log(`${msg.message.challengedPlayerUn} has been challenged by ${msg.message.challengingPlayerUn}.`)
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
  
  isYourTurn = () => {
    return (this.props.activePlayer.id === this.props.player.id)
  }

  // need this in case players aren't automatically synced, which they probably won't be
  updatePlayer = () => {
    // console.log(this.props.player.coins + 'coins')
    this.props.pubnub.publish({
      message: {
        type: 'updatePlayer',
        player: this.props.player
      },
      channel: this.props.gameChannel
    })
  }

  updateTreasury = (amt) => {
    // console.log(this.props.treasury)
    this.props.pubnub.publish({
      message: {
        type: 'updateTreasury',
        treasury: this.props.treasury + amt
      },
      channel: this.props.gameChannel
    })
  }

  updateCoins = async(amt) => {
    await this.props.updateCoins(amt)
    this.updatePlayer()
  }

  // pick card to reveal, or lose one randomly based on timer
  loseCard = () => {
    /* if player only has one unrevealed card, player loses the game */
    Swal.fire({
      title: `Pick a card to lose.`,
      focusConfirm: false,
      showCancelButton: true,
      cancelButtonColor: '#3085d6',
      confirmButtonText: `Lose ${this.props.player.hand[0].name}`,
      cancelButtonText: `Lose ${this.props.player.hand[1].name}`,
      allowOutsideClick: false,
      allowEscapeKey: false,
      timer: globalSwalTimer,
      timerProgressBar: true,
      html: "<span class='swal2-text'>Losing a random card in <b></b></span>",
      onBeforeOpen: () => {
        setInterval(() => {
          const content = Swal.getContent()
          if (content) {
            const b = content.querySelector('b')
            if (b && Swal.getTimerLeft()) {
              b.textContent = Math.ceil(Swal.getTimerLeft() / 1000)
            }
          }
        }, 100)
      }
      // footer: 'fuck',
    })
    .then(r => {
      console.log(r)
      let i
      if (r.value) {
        i = 0
      } else if (r.dismiss === 'cancel') {
        i = 1
      } else {
        i = Math.round(Math.random())
      }
      
      Swal.fire({
        title: `Lost ${this.props.player.hand[i].name}!`,
        timer: 1500,
        showConfirmButton: false,
      })
      .then(r => {
        this.props.revealCard(i)
        this.updatePlayer()
      })
    })
  }

  // choose card to show when challenged, show on timer(?), shuffle into deck and draw a new card
  showCard = (card) => {
    Swal.fire({
      title: `Showing ${card}!`
    })
  }


  endTurn = () => {
    this.props.pubnub.publish({
      message: { type: 'endTurn' },
      channel: this.props.gameChannel
    })
  }

  gameOver = () => {

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
        <p className='whose-turn'>Whose turn: {this.props.activePlayer.username ? this.props.activePlayer.username : null}</p>

        <div className='treasury'>
          <p>Treasury: {this.props.treasury} coins</p>
        </div>

        <div className='court-deck'>
          <Card />
          <p>Court Deck: {this.props.deck.length} cards</p>
        </div>
        {/* <p>Deck: {this.props.deck.map(card => card.name).join(', ')}</p> */}
        {/* <button onClick={()=>this.shuffleDeck()}>Shuffle Deck</button> */}
        {/* <button onClick={() => this.testMsg('GAME YO')}>message</button> */}
        {/* <button onClick={this.hereNow}>log who's here</button> */}
        {/* <button onClick={this.logPlayers}>log players</button> */}

        {/* <br/><button onClick={this.endTurn}>End Turn</button> */}

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
    updateCoins: ((amt) => dispatch({type: 'updateCoins', amt: amt})),
    updateTreasury: ((treasury) => dispatch({type: 'updateTreasury', treasury: treasury})),
    setActivePlayer: (() => dispatch({type: 'setActivePlayer'})),
    revealCard: ((i) => dispatch({type: 'revealCard', i: i})),
    endTurn: (() => dispatch({type: 'endTurn'})),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Game)
