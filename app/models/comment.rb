class Comment < ApplicationRecord
  belongs_to :react_crud_data, class_name: 'ReactCrudDatum'
end
