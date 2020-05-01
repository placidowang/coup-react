import React from 'react';
import { connect } from 'react-redux'
import Player from '../containers/Player.js'

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
          case 'addCardsToHand':
            if (msg.message.playerId === this.props.player.id) {
              this.props.addCardsToHand(msg.message.cards)
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
    // console.log(`Current players: ${this.props.players.map(player => player)}`)
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
  updatePlayers = (players) => {

  }

  nextTurn = () => {
    //whosturnisit + 1 % 5
    
    console.log(this.props.whosTurnIsIt)
  }
  
  testMsg = (msg) => {
    this.props.pubnub.publish({
      message: {type: 'log', text: msg},
      channel: this.props.gameChannel
    })
  }

  hereNow = () => {
    this.props.pubnub.hereNow({
      channel: this.props.gameChannel
    })
    .then(console.log)
  }

  render() {
    return (
      <div>
        {/* <p>Players: {this.props.pubnub.hereNow({
          channels: [this.props.pubnub.gameChannel]
        })}</p> */}
        <p>Deck: {this.props.deck.map(card => card.name).join(', ')}</p>
        <button onClick={()=>this.shuffleDeck()}>Shuffle Deck</button>

        <button onClick={() => this.testMsg('GAME YO')}>message</button>
        <button onClick={this.hereNow}>who here</button>

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
    whosTurnIsIt: state.gameReducer.whosTurnIsIt,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    initDeck: ((cards) => dispatch({type: 'initializeDeck', cards: cards})),
    updateDeck: ((deck) => dispatch({type: 'updateDeck', updatedDeck: deck})),
    // drawCard: ((card) => dispatch({type: 'drawCard', card: card})),
    addCardsToHand: ((cards) => dispatch({type: 'addCardsToHand', cards: cards}))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Game)
