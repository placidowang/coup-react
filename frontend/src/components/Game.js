import React from 'react';
import { connect } from 'react-redux'

class Game extends React.Component {
  componentDidMount(){
    fetch('http://localhost:3000/deck')
    .then(r => r.json())
    .then(deck => {
      this.props.init(deck.cards)
    })

    console.log(`Current players: ${this.props.players.map(player => player)}`)
  }

  shuffleDeck = () => {
    let shuffledDeck = [...this.props.deck]
    // debugger
    let j
    for (let i = shuffledDeck.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1))
      [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]]
    }
    this.props.shuffleDeck(shuffledDeck)
  }

  render() {

    return (
      <div>
        <p>Deck: {this.props.deck.map(card => card.name + ", ")}</p>
        <button onClick={this.shuffleDeck}>Shuffle Deck</button>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    pubnub: state.connectionReducer.pubnub,
    players: state.connectionReducer.players,
    deck: state.gameReducer.deck
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    init: ((cards) => dispatch({type: 'initializeDeck', cards: cards})),
    shuffleDeck: ((shuffledDeck) => dispatch({type: 'shuffleDeck', shuffledDeck: shuffledDeck}))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Game)
