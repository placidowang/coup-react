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

  render() {

    return (
      <div>
        <p>Deck: {this.props.deck.map(card => card.name + ", ")}</p>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    players: state.connectionReducer.players,
    deck: state.gameReducer.deck
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    init: ((cards) => dispatch({type: 'initializeDeck', cards: cards}))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Game)
