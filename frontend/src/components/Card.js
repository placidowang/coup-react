import React from 'react'
import { connect } from 'react-redux'
import './Card.css'
import ambassador from '../images/ambassador.png'
import assassin from '../images/assassin.png'
import captain from '../images/captain.png'
import cardback from '../images/cardback.png'
import contessa from '../images/contessa.png'
import duke from '../images/duke.png'

const cardImgData = {
  ambassador: ambassador,
  assassin: assassin,
  captain: captain,
  cardback: cardback,
  contessa: contessa,
  duke: duke,
}

class Card extends React.Component {
  render() {
    // return (
    //   <p>sup, yo</p>
    // )
    // console.log(this.props.card)
    if (this.props.card) {
      if (this.props.card.isRevealed) {
        return (
            <div className='overlay'>
              <p className='x'>X</p>
              <div className={`card ${this.props.card.name.toLowerCase()} revealed`}>
                  <p className='card-name'>{this.props.card.name.toUpperCase()}</p>
                  {/* <img className='portrait' src={`./images/${this.props.card.name.toLowerCase()}.png`} alt={this.props.card.name} /> */}
                  <img className='portrait' src={cardImgData[this.props.card.name.toLowerCase()]} alt={this.props.card.name} />

                  <div className='card-info'>
                    {/* <h3>{this.props.card.action}</h3> */}
                    {/* <h3>{this.props.card.effect}</h3> */}
                    <p>{this.props.card.description}</p>
                  </div>
              </div>
            </div>
        )
      } else {
        return (
          <div className={`card ${this.props.card.name.toLowerCase()}`}>
            <p className='card-name'>{this.props.card.name.toUpperCase()}</p>
            <img className='portrait' src={cardImgData[this.props.card.name.toLowerCase()]} alt={this.props.card.name} />
            <div className='card-info'>
              {/* <h3>{this.props.card.action}</h3> */}
              {/* <h3>{this.props.card.effect}</h3> */}
              <p>{this.props.card.description}</p>
            </div>
          </div>
        )
      }

    } else {
      return (
        <div className={'card'}>
          <img className={'cardback'} src={cardImgData['cardback']} alt={'cardback'}/>
        </div>
      )
    }
    
  }
}

export default connect()(Card)