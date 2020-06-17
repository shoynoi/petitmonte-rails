Rails.application.routes.draw do
  root to: 'react_crud_data#index'
  resources :react_crud_data, except: [:edit]
end
