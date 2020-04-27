class AddActionEffectCounteractionToCards < ActiveRecord::Migration[6.0]
  def change
    add_column :cards, :action, :string
    add_column :cards, :effect, :string
    add_column :cards, :counteraction, :string
  end
end
