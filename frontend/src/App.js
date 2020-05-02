import React from 'react';
import { connect } from 'react-redux'
import './App.css';
import PubNubReact from 'pubnub-react';
import keys from './PubNub-keys.js'
// import { BrowserRouter, Switch, Route } from 'react-router-dom'

import "typeface-roboto";
import "typeface-muli"

import GameContainer from './containers/GameContainer.js'

class App extends React.Component {
  constructor(props) {
    super(props)

    this.pubnub = new PubNubReact({
      publishKey: keys.publishKey, 
      subscribeKey: keys.subscribeKey    
    })
    const id = Math.random().toString(36).slice(2,12)
    this.props.setId(id)
    this.pubnub.setUUID(id)
    this.pubnub.init(this)
  }

  componentDidMount() {
    this.props.initPubnub(this.pubnub)
  }

  componentWillUnmount() {
    this.props.pubnub.unsubscribe({
      channels: [this.props.lobbyChannel, this.props.gameChannel]
    })
  }

  setUsername = (e) => {
    e.preventDefault()
    const username = e.target[0].value
    if (username !== "") {
      this.props.setUsername(username)
    } else {
      console.error('Please enter a username.')
    }
  }

  render() {
    return (
      <div className="App">
        {!this.props.username && 
          <div>
            <p className='title'>sup, time for some damn COUP</p>
            <p>Enter name to play</p>
            <form onSubmit={e => this.setUsername(e)}>
              <input type='text'/>
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
    pubnub: state.connectionReducer.pubnub,
    lobbyChannel: state.connectionReducer.lobbyChannel,
    gameChannel: state.connectionReducer.gameChannel,
    username: state.playerReducer.username,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    initPubnub: ((pubnub) => dispatch({type: 'initPubnub', pubnub: pubnub})),
    setId: ((id) => dispatch({type: 'setId', id: id})),
    setUsername: ((username) => dispatch({type: 'setUsername', username: username})),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
