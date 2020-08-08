import React from 'react'
import { connect } from 'react-redux'
import './Player.css'
import Card from '../components/Card.js'
import Swal from 'sweetalert2'

class Player extends React.Component {
  componentDidMount() {

  }
  
  componentDidUpdate() {
    // console.log(this.props.player)
  }

  isYourTurn = () => {
    return (this.props.activePlayer.id === this.props.player.id)
  }

  // don't need to account for turn anymore; actions are disabled if it's not your turn
  handleClickAction = (action) => {
    console.log('Attempting to use ' + action)
    switch (action) {
      case 'Income':
        if (this.props.treasury >= 1) {
          this.updateCoins(1)
          // await this.props.changeTreasury(-amt)
          this.updateTreasury(-1)
          this.endTurn()
        } else {
          Swal.fire('Not enough coins in Treasury!')
          console.error('Not enough coins in Treasury')
        }
        break
      case 'Foreign Aid':
        if (this.props.treasury >= 2) {
          this.alertPlayers(action, undefined, 'Duke')

        } else {
          Swal.fire('Not enough coins in Treasury!')
          console.error('Not enough coins in Treasury')
        }
        break
      case 'Tax':
        if (this.props.treasury >= 3) {
          this.alertPlayers(action, 'Duke', undefined)

        } else {
          Swal.fire('Not enough coins in Treasury!')
          console.error('Not enough coins in Treasury')
        }
        break
      case 'Coup':
        if (this.props.player.coins >= 7) {
          this.targetPlayer(action)
        } else {
          Swal.fire(`You need 7 coins to Coup.`)
        }
        break
      case 'Assassinate':
        if (this.props.player.coins >= 3) {
          this.targetPlayer(action, 'Assassin', 'Contessa')
        } else {
          Swal.fire(`You need 3 coins to Assassinate.`)
        }
        break
      case 'Exchange':
        this.alertPlayers(action, 'Ambassador', undefined)
        break
      case 'Steal':
        this.targetPlayer(action, 'Captain', 'Ambassador', 'Captain')
        break
      default:
        console.error('Invalid player action')
    }
  }

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

  targetPlayer = (action, associatedCard = undefined, ...counterCards) => {
    console.log(`Using ${action}. Choose a player to target.`)
    // swal with buttons for now, can later convert to onClick opponent div w/ hover effect
    Swal.fire({
      title: `Choose an opponent to use ${action} on.`,
      showConfirmButton: false,
      showCancelButton: true,
      allowOutsideClick: false,
      timer: 10000,
      timerProgressBar: true,
      onBeforeOpen: () => {
        // console.log(this.props.players)
        // const actionsDiv = document.querySelector('.swal2-actions')
        const actionsDiv = Swal.getActions()

        const opponents = this.props.players.filter(player => player.id !== this.props.player.id && !player.gameOver)

        opponents.forEach(opponent => {
          const btn = document.createElement('button')
          btn.innerText = opponent.username
          btn.className = "swal2-confirm swal2-styled"
          // let id = opponent.id
          btn.addEventListener('click', () => {
            console.log(opponent.id)
            Swal.close()

            this.props.pubnub.publish({
              message: {
                type: 'target',
                action: action,
                associatedCard: associatedCard,
                counterCards: counterCards,
                targetPlayerId: opponent.id,
              },
              channel: this.props.gameChannel
            })
          })
          actionsDiv.append(btn)
        })
      }
    })



  }

  // alertPlayers = (action, counterAction, associatedCard, counterCard) => {
  alertPlayers = (action, associatedCard, counterCard) => {
    this.props.pubnub.publish({
      message: {
        type: 'alert',
        // fromPlayer: this.props.player,
        action: action,
        // counterAction: counterAction,
        // message: msg,
        associatedCard: associatedCard,
        counterCard: counterCard,
      },
      channel: this.props.gameChannel
    })
  }

  endTurn = () => {
    this.props.pubnub.publish({
      message: { type: 'endTurn' },
      channel: this.props.gameChannel
    })
  }

  render() {
    const player = this.props.player
    const actions = []
    for (const action in this.props.player.actions) {
      actions.push(this.props.player.actions[action])
    }
    // console.log(actions)
    return (
      <div className='player-container'>
        <div className='player-name-hand-coin-container'>
          <div className='player-name-coins-container'>
            <p className='player-name'>{player.username}</p>
            <p className='coins'>Coins: {player.coins}</p>
          </div>
          <div className='player-hand-container'>
            <p>Hand</p>
            <div className='player-hand'>
              {player.hand.map(card => <Card key={card.id} card={card} />)}
            </div>
          </div>
        </div>
        {/* <div className='actions'>Actions: 
          {actions.map(action => 
            <div className='action' key={action.action}>
              <button onClick={e => this.handleClickAction(e.target.value)} id={action.action} value={action.action} disabled={this.isYourTurn() ? '' : 'disabled'}>{action.action}</button>
              <p>{action.effect}</p>
              <p>{action.counteraction}</p>
              <p>{action.character}</p>
            </div>
          )}
        </div> */}
        <table id='actions'>
          <tbody>
            <tr>
              <th>Action</th>
              <th>Character</th>
              <th className='effect'>Effect</th>
              <th>Counteraction</th>
            </tr>
            {actions.map(action => 
              <tr className='action' key={action.action}>
                <td>
                  <button onClick={e => this.handleClickAction(e.target.value)} id={action.action} value={action.action} disabled={this.isYourTurn() ? '' : 'disabled'}>{action.action}</button>
                </td>
                <td className={action.character}>{action.character ? action.character : 'X'}</td>
                <td>{action.effect ? action.effect : 'X'}</td>
                <td>{action.counteraction ? action.counteraction : 'X'}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    pubnub: state.connectionReducer.pubnub,
    gameChannel: state.connectionReducer.gameChannel,
    isHost: state.connectionReducer.isHost,
    players: state.gameReducer.players,
    deck: state.gameReducer.deck,
    treasury: state.gameReducer.treasury,
    player: state.playerReducer,
    activePlayer: state.gameReducer.activePlayer,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    endTurn: (() => dispatch({type: 'endTurn'})),
    updateCoins: ((amt) => dispatch({type: 'updateCoins', amt: amt})),
    changeTreasury: ((amt) => dispatch({type: 'changeTreasury', amt: amt})),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Player)