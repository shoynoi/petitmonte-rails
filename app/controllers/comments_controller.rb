class CommentsController < ApplicationController
  before_action :load_comment, only: %i[update destroy]

  def index
    react_crud_datum = ReactCrudDatum.find(params[:react_crud_datum_id])
    @comments = react_crud_datum.comments.order(updated_at: :desc)
    respond_to do |format|
      format.json { render json: @comments }
    end
  end

  def create
    react_crud_datum = ReactCrudDatum.find(params[:react_crud_datum_id])
    @comment = react_crud_datum.comments.new(comment_params)
    if @comment.save
      respond_to do |format|
        format.json do
          render json: { registration: 'Ajaxによるコメントの追加が完了しました。',
                         id: @comment.id,
                         description: @comment.description,
                         updated_at: @comment.updated_at }
        end
      end
    else
      respond_to do |format|
        format.json do
          render json: { id: 'error',
                         registration: 'Ajaxによるコメントの追加に失敗しました。' }
        end
      end
    end
  end

  def update
    respond_to do |format|
      if @comment.update(comment_params)
        format.json do
          render json: { registration: 'Ajaxによるコメントの更新に成功しました。' }
        end
      else
        format.json do
          render json: { registration: 'Ajaxによるコメントの更新に失敗しました。' }
        end
      end
    end
  end

  def destroy
    respond_to do |format|
      if @comment.destroy
        format.json do
          render json: { registration: 'Ajaxによるコメントの削除に成功しました。' }
        end
      else
        format.json do
          render json: { registration: 'Ajaxによるコメントの削除に失敗しました。' }
        end
      end
    end
  end

  private

  def comment_params
    params.require(:comment).permit(:description)
  end

  def load_comment
    react_curd_datum = ReactCrudDatum.find(params[:react_crud_datum_id])
    @comment = react_curd_datum.comments.find(params[:id])
  end
end
