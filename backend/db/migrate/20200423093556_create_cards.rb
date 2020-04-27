class CreateCards < ActiveRecord::Migration[6.0]
  def change
    create_table :cards do |t|
      t.string :name
      t.string :img_url
      t.string :ability
      t.integer :deck_id

      t.timestamps
    end
  end
end
