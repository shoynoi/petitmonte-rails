class CreateComments < ActiveRecord::Migration[6.0]
  def change
    create_table :comments do |t|
      t.text :description
      t.references :react_crud_data

      t.timestamps
    end
  end
end
