class RemoveAbilityFromCards < ActiveRecord::Migration[6.0]
  def change

    remove_column :cards, :ability, :string
  end
end
