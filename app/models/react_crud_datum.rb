class ReactCrudDatum < ApplicationRecord
  validates :name, length: { maximum: 20 }, presence: true
  validates :comment, length: { maximum: 140 }, presence: true

  has_many :comments, foreign_key: 'react_crud_data_id', dependent: :destroy
end
