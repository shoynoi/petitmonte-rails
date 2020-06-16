# frozen_string_literal: true

class ReactCrudDataController < ApplicationController
  before_action :set_datum, only: %i[update destroy]
  def index
    @data = ReactCrudDatum.all.order(updated_at: :desc)
    respond_to do |format|
      format.html
      format.json { render json: @data }
    end
  end

  def new
    ActiveRecord::Base.transaction do
      ActiveRecord::Base.connection.execute('TRUNCATE TABLE react_crud_data')
      ActiveRecord::Base.connection.execute('INSERT INTO react_crud_data SELECT * FROM react_crud_data_bks')
    end
    redirect_to root_path
  end

  def create
    @datum = ReactCrudDatum.new(datum_params)

    respond_to do |format|
      if @datum.save
        format.json do
          render json: { registration: 'Ajaxによるデータの追加が完了しました。',
                         id: @datum.id,
                         name: @datum.name,
                         comment: @datum.comment,
                         updated_at: @datum.updated_at }
        end
      else
        format.json do
          render json: { registration: 'Ajaxによるデータの登録が失敗しました。',
                         id: 'error' }
        end
      end
    end
  end

  def update
    respond_to do |format|
      if @datum.update(datum_params)
        format.json do
          render json: { registration: 'Ajaxによるデータの更新が成功しました。' }
        end
      else
        format.json do
          render json: { registration: 'Ajaxによるデータの更新に失敗しました。' }
        end
      end
    end
  end

  def destroy
    respond_to do |format|
      if @datum.destroy
        format.json do
          render json: { registration: 'Ajaxによるデータの削除が成功しました。' }
        end
      else
        format.json do
          render json: { registration: 'Ajaxによるデータの削除に失敗しました。' }
        end
      end
    end
  end

  private

  def set_datum
    @datum = ReactCrudDatum.find(params[:id])
  end

  def datum_params
    params.require(:datum).permit(:name, :comment)
  end
end
