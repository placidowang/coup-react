Rails.application.routes.draw do
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html

  # resources :decks, only: [:index]
  get '/deck' => 'decks#deck'
end