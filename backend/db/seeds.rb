puts 'Seeding...'

Player.destroy_all
Card.destroy_all
Deck.destroy_all

d1 = Deck.create

3.times do
  Card.create(
    name: 'Duke',
    action: 'Tax',
    effect: 'Take 3 coins',
    counteraction: 'Blocks Foreign Aid',
    description: 'Take 3 coins from Treasury. Blocks Foreign Aid.',
    deck_id: d1.id
  )

  Card.create(
    name: 'Assassin',
    action: 'Assassinate',
    effect: 'Pay 3 coins - Choose player to lose influence',
    counteraction: '',
    description: 'Pay 3 coins to assassinate another player.',
    deck_id: d1.id
  )

  Card.create(
    name: 'Ambassador',
    action: 'Exchange',
    effect: 'Exchange cards with Court Deck',
    counteraction: 'Blocks stealing',
    description: 'Exchange cards with Court Deck. Blocks stealing.',

    deck_id: d1.id
  )

  Card.create(
    name: 'Captain',
    action: 'Steal',
    effect: 'Take 2 coins from another player',
    counteraction: 'Blocks stealing',
    description: 'Steal 2 coins from another player. Blocks stealing.',
    deck_id: d1.id
  )

  Card.create(
    name: 'Contessa',
    action: '',
    effect: '',
    counteraction: 'Blocks assassination',
    description: 'Blocks assassination.',
    deck_id: d1.id
  )
end

puts 'Seeded!'