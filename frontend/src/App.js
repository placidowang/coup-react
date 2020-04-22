import React from 'react';
import './App.css';
import { connect } from 'react-redux'

import "typeface-roboto";
import "typeface-muli"

import gameContainer from './containers/gameContainer.js'

function App(props) {
  return (
    <div className="App">
      sup
      <p>testing testing yoyoyo</p>
      {props.a}
      {props.b}
      {/* <gameContainer /> */}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    a: state.a,
    b: state.b
  }
}

export default connect(mapStateToProps)(App);
