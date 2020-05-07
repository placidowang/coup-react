import React from 'react'
import { connect } from 'react-redux'
import Card from './Card.js'

class Opponent extends React.Component {
  getId = (id) => {
    console.log(id)
    return id
  }

  render() {
    return(
      // <button onClick={(e) => this.logId(e.target.value)} value={this.props.opponent.id} className='opponent'>
      <div onClick={() => this.getId(this.props.opponent.id)}className='opponent'>
        <p className='opponent-name'>{this.props.opponent.username}</p>
        <p>Coins: {this.props.opponent.coins}</p>

        <div className='opponent-hand-container'>
          <p>Hand
            {/* : {this.props.opponent.hand.length} */}
          </p>
          {this.props.opponent.hand.length > 0
            ? <div className='opponent-hand'>
                <Card card={this.props.opponent.hand[0].isRevealed ? this.props.opponent.hand[0] : null}/>
                <Card card={this.props.opponent.hand[1].isRevealed ? this.props.opponent.hand[1] : null}/>

                {/* <Card card={this.props.opponent.hand[1]}/> */}
              </div>
            : <div className='opponent-hand'>
                <Card />
                <Card />
              </div>
          }
        </div>
      </div>
      // </button>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    player: state.playerReducer,
    players: state.gameReducer.players,
  }
}

export default connect(mapStateToProps)(Opponent)