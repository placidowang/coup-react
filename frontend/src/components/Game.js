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
          case 'updateHand':
            this.props.setActivePlayer()
            if (msg.message.playerId === this.props.player.id) {
              this.props.updateHand(msg.message.cards)
              // this.updatePlayer(this.props.player)
              this.updatePlayer()
            }
            break
          case 'endTurn':
            // Swal.close()
            const currentActivePlayerId = this.props.activePlayer.id
            this.props.endTurn()
            this.props.setActivePlayer()
            if (this.props.activePlayer.id === currentActivePlayerId && this.isYourTurn()) {
              Swal.close()
              Swal.fire({
                title: 'u win gj gg',
                confirmButtonText: 'New Game?',
                allowOutsideClick: false
              })
            }
            console.log(`${this.props.players[this.props.whosTurnIsIt].username}'s turn.`)
            break
          case 'target':
            const targetPlayer = this.props.players.find(player => player.id === msg.message.targetPlayerId)
            if (this.props.player.id === targetPlayer.id) {
              // console.log(msg.message.action)
              // console.log(msg.message.associatedCard)
              // console.log(msg.message.counterCards)
              if (msg.message.action === 'Coup') {
                Swal.fire({
                  title: `${this.props.activePlayer.username} couped you!`,
                  showConfirmButton: false,
                  allowOutsideClick: false,
                  timer: 2000,
                })
                .then(r => {this.loseCard()})
              } else {
                Swal.fire({
                  title: `${this.props.activePlayer.username} is trying to use ${msg.message.action} on you!`
                })
              }

            } else if (this.isYourTurn()) {
              if (msg.message.action === 'Coup') {
                Swal.fire({
                  title: `You couped ${targetPlayer.username}!`,
                  showConfirmButton: false,
                  timer: 2000,
                })
              } else {
                Swal.fire({
                  title: `Waiting for ${targetPlayer.username}.`,
                  showConfirmButton: false,
                  allowOutsideClick: false,
                })
              }
            }
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
              } else if (msg.message.associatedCard && !msg.message.counterCard) {
                Swal.fire({
                  title: `${this.props.activePlayer.username} is trying to use ${msg.message.action} with a ${msg.message.associatedCard}!`,
                  timer: globalSwalTimer,
                  timerProgressBar: true,
                  showCancelButton: true,
                  cancelButtonText: `Let ${this.props.activePlayer.username} use ${msg.message.action}... this time.`,
                  confirmButtonText: `CHALLENGE`,
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
                    console.log('Sending challenge to ' + msg.message.counteringPlayerUn)
                    this.props.pubnub.publish({
                      message: {
                        type: 'challenge',
                        challengedPlayerId: this.props.activePlayer.id,
                        challengedPlayerUn: this.props.activePlayer.username,
                        challengingPlayerId: this.props.player.id,
                        challengingPlayerUn: this.props.player.username,
                        challengedCard: msg.message.associatedCard,
                        action: msg.message.action,
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
                timer: 9999999,
                timerProgressBar: true,
                html: "<span class='swal2-text'>Backing down in <b></b></span><button id='testBtn'>sup</button>",
                onBeforeOpen: () => {
                  const content = Swal.getContent()
                  setInterval(() => {
                    if (content) {
                      const b = content.querySelector('b')
                      if (b && Swal.getTimerLeft()) {
                        b.textContent = Math.ceil(Swal.getTimerLeft() / 1000)
                      }
                      
                    }
                  }, 100)
                  
                  const testBtn = content.querySelector('#testBtn')
                  testBtn.addEventListener('click', () => {
                    console.log('clicked test button')
                  })

                  const actionsDiv = document.querySelector('.swal2-actions')
                  const testBtn2 = document.createElement('button')
                  testBtn2.innerHTML = 'Test2'
                  testBtn2.addEventListener('click', () => {
                    console.log('test2')
                    // r will be {}
                    Swal.close()
                  })
                  testBtn2.className = "swal2-confirm swal2-styled"
                  actionsDiv.append(testBtn2)
                }
              })
              .then(r => {
                if (r.value) {
                  console.log('Sending challenge to ' + msg.message.counteringPlayerUn)
                  this.props.pubnub.publish({
                    message: {
                      type: 'challenge',
                      challengedPlayerId: msg.message.counteringPlayerId,
                      challengedPlayerUn: msg.message.counteringPlayerUn,
                      challengingPlayerId: this.props.player.id,
                      challengingPlayerUn: this.props.player.username,
                      challengedCard: msg.message.counterCard,
                      action: msg.message.action,
                    },
                    channel: this.props.gameChannel
                  })
                } else if (r.dismiss) {
                  console.log("Where's your honor??")
                  // send message that blocker won, close swal
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
                  confirmButtonText: `Show my ${msg.message.challengedCard}.`,
                  cancelButtonText: "Lose a card (Hint: don't do this)",
                })
                .then(r => {
                  if (r.value) {
                    this.props.pubnub.publish({
                      message: {
                        type: 'challengedPlayerWon',
                        challengedPlayerId: msg.message.challengedPlayerId,
                        challengedPlayerUn: msg.message.challengedPlayerUn,
                        challengingPlayerId: msg.message.challengingPlayerId,
                        challengingPlayerUn: msg.message.challengingPlayerUn,
                        challengedCard: msg.message.challengedCard,
                        action: msg.message.action,
                      },
                      channel: this.props.gameChannel
                    })
                  } else if (r.dismiss) {
                    this.props.pubnub.publish({
                      message: {
                        type: 'challengedPlayerLost',
                        challengedPlayerId: msg.message.challengedPlayerId,
                        challengedPlayerUn: msg.message.challengedPlayerUn,
                        challengingPlayerId: msg.message.challengingPlayerId,
                        challengingPlayerUn: msg.message.challengingPlayerUn,
                        challengedCard: msg.message.challengedCard,
                        action: msg.message.action,
                      },
                      channel: this.props.gameChannel
                    })
                  }
                })
              } else {
                Swal.fire({
                  title: 'You were called out!',
                  timer: 1500,
                  timerProgressBar: true,
                  // showConfirmButton: false,
                  allowOutsideClick: false,
                  allowEscapeKey: false,
                })
                .then(r => {
                  this.props.pubnub.publish({
                    message: {
                      type: 'challengedPlayerLost',
                      challengedPlayerId: msg.message.challengedPlayerId,
                      challengedPlayerUn: msg.message.challengedPlayerUn,
                      challengingPlayerId: msg.message.challengingPlayerId,
                      challengingPlayerUn: msg.message.challengingPlayerUn,
                      challengedCard: msg.message.challengedCard,
                      action: msg.message.action,
                    },
                    channel: this.props.gameChannel
                  })
                })
              }
            } else if (this.props.player.id === msg.message.challengingPlayerId) {
              console.log(`You challenged ${msg.message.challengedPlayerUn}'s ${msg.message.challengedCard}!`)
              Swal.fire({
                title: `You challenged ${msg.message.challengedPlayerUn}'s ${msg.message.challengedCard}!`,
                showConfirmButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                // need to have no timer, wait on challenged player's response
                // timer: globalSwalTimer,
                // timerProgressBar: true,
              })
            } else {
              console.log(`${msg.message.challengedPlayerUn} has been challenged by ${msg.message.challengingPlayerUn}.`)
              Swal.close()
            }
            break
          case 'challengedPlayerWon':
            if (this.props.player.id === msg.message.challengedPlayerId) {
              Swal.fire({
                title: `You show your ${msg.message.challengedCard}, winning the challenge!`,
                text: `${msg.message.challengingPlayerUn} loses a card and doesn't get to ${msg.message.action}.`,
                icon: 'success',
                timer: globalSwalTimer,
                timerProgressBar: true,
              })
              .then(r => this.getNewCard(msg.message.challengedCard))
            } else if (this.props.player.id === msg.message.challengingPlayerId) {
              if (this.props.player.hand.filter(card => card.isRevealed === true).length === 1) {
                Swal.fire({
                  title: `${msg.message.challengedPlayerUn} had a ${msg.message.challengedCard}!`,
                  timer: 2000,
                  showConfirmButton: false,
                  allowOutsideClick: false,
                })
                .then(r => this.gameOver())
              } else {
                Swal.close()
                Swal.fire({
                  title: `${msg.message.challengedPlayerUn} had a ${msg.message.challengedCard}! You lost the challenge!`,
                  text: 'You lose a card.',
                  icon: 'error',
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                  timer: globalSwalTimer,
                  timerProgressBar: true,
                })
                .then(r => this.loseCard())
              }
            }
            break
          case 'challengedPlayerLost':
            if (this.props.player.id === msg.message.challengedPlayerId) {
              if (this.props.player.hand.filter(card => card.isRevealed === true).length === 1) {
                this.gameOver()
              } else {
                Swal.fire({
                  title: 'You lost the challenge!',
                  text: 'You lose a card.',
                  icon: 'error',
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                  timer: globalSwalTimer,
                  timerProgressBar: true,
                })
                .then(r => this.loseCard())  
              }
            } else if (this.props.player.id === msg.message.challengingPlayerId) {
              // Swal.close()

              // switch case rewards per action type
              this.updateCoins(2)
              this.updateTreasury(-2)

              Swal.fire({
                title: `You won the challenge! You use ${msg.message.action}.`,
                text: `${msg.message.challengedPlayerUn} loses a card.`,
                icon: 'success',
                timer: globalSwalTimer,
                timerProgressBar: true,
              })
              // don't show card
              // .then(r => this.getNewCard(msg.message.challengedCard))
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
    let deck = deckData.cards.map(card => ({...card, isRevealed: false}))
    // deck = deck.filter(card => card.name === "Duke" || card.name === "Assassin")
    const shuffledDeck = this.shuffleDeck(deck)
    this.distributeCards(shuffledDeck)
  }

  shuffleDeck = (deck = [...this.props.deck], getNewCard = false) => {
    for (let i = deck.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]]
    }

    if (getNewCard) {
      const newCard = deck.shift()
      this.updateDeck(deck)
      return newCard
    } else {
      this.updateDeck(deck)
      return deck
    }
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
          type: 'updateHand',
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
      // console.log(r)
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
        this.endTurn()
      })
    })
  }

  // after showing winning a card, shuffle it into deck and draw a new card
  getNewCard = (challengedCard) => {
    const oldCard = this.props.player.hand.find(card => card.name === challengedCard)
    this.props.deck.push(oldCard)
    const newCard = this.shuffleDeck(this.props.deck, true)
    const aOrAn = /[AEIOU]/.test(newCard.name.charAt(0)) ? "an" : "a"
    console.log(`You shuffled in your ${oldCard.name} and got ${aOrAn} ${newCard.name}!`)
    Swal.fire({
      title: `You shuffled in your ${oldCard.name} and got ${aOrAn} ${newCard.name}!`,
      timer: 2000,
      showConfirmButton: false,
    })

    const newHand = [...this.props.player.hand]
    newHand[newHand.findIndex(card => card.id === oldCard.id)] = newCard
    this.props.updateHand(newHand)
    this.updatePlayer()
  }

  endTurn = () => {
    this.props.pubnub.publish({
      message: { type: 'endTurn' },
      channel: this.props.gameChannel
    })
  }

  gameOver = () => {
    Swal.close()
    Swal.fire({
      title: 'Game over, man!',
      showConfirmButton: false,
      allowOutsideClick: false
    })
    // reveal remaining card
    const newHand = [...this.props.player.hand]
    const i = (this.props.player.hand[0].isRevealed) ? 1 : 0
    newHand[i] = {...newHand[i], isRevealed: true}
    this.props.updateHand(newHand)
    // skip player in turn order; cannot just remove player from players list or their cards will also be removed
    this.props.gameOver()
    this.updatePlayer()
    this.endTurn()
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
    getNewCard: ((card) => dispatch({type: 'getNewCard', card: card})),
    updateHand: ((cards) => dispatch({type: 'updateHand', cards: cards})),
    changeTreasury: ((amt) => dispatch({type: 'changeTreasury', amt: amt})),
    updateCoins: ((amt) => dispatch({type: 'updateCoins', amt: amt})),
    updateTreasury: ((treasury) => dispatch({type: 'updateTreasury', treasury: treasury})),
    setActivePlayer: (() => dispatch({type: 'setActivePlayer'})),
    revealCard: ((i) => dispatch({type: 'revealCard', i: i})),
    endTurn: (() => dispatch({type: 'endTurn'})),
    gameOver: (() => dispatch({type: 'gameOver'})),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Game)
