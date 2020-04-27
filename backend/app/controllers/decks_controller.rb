class DecksController < ApplicationController
  # def index
  #   byebug
  #   render json: Deck.first
  # end

  def deck
    # byebug
    # render json: Deck.first, only: :cards
    render json: Deck.first, only: :id, include: :cards
  end
end
