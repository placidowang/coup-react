import React from 'react';
import './App.css';
import { connect } from 'react-redux'

import "typeface-roboto";
import "typeface-muli"

import gameContainer from './containers/gameContainer.js'

class App extends React.Component {
  componentDidMount() {
    fetch('http://localhost:3000/deck')
    .then(r => r.json())
    .then(deck => {
      this.props.init(deck.cards)
    })
  }

  render() {
    return (
      <div className="App">
        sup
        <p>testing testing yoyoyo</p>
        {this.props.deck.map(card => card.name)}
        {/* <gameContainer /> */}
      </div>
    )
  }

}

const mapStateToProps = (state) => {
  return {
    deck: state.deck
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    init: ((cards) => dispatch({type: 'initializeDeck', cards: cards}))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
