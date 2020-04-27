import React from 'react';
import './App.css';
import { connect } from 'react-redux'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import "typeface-roboto";
import "typeface-muli"

import GameContainer from './containers/GameContainer.js'

class App extends React.Component {
  setUsername = (e) => {
    e.preventDefault()
    this.props.setUsername(e.target[0].value)
  }

  render() {
    return (
      <div className="App">
        {!this.props.username && 
          <div>
            <p className='title'>sup, time for some damn COUP</p>
            <p>Enter name to play</p>
            <form onSubmit={e => this.setUsername(e)}>
              <input type='text'></input>
              <button type='submit'>Set Username</button>
            </form>
          </div>
        }

        {this.props.username &&
          <GameContainer />
        }

        {/* <BrowserRouter>
          <div className="App">
            <Switch>
              <GameContainer />
              <Route path='/test'>
                <p>testing testing yoyoyo</p>
              </Route>
            </Switch>
          </div>
        </BrowserRouter> */}
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    username: state.playerReducer.username
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setUsername: ((username) => dispatch({type: 'setUsername', username: username}))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
