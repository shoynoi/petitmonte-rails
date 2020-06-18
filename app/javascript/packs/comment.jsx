import 'react-app-polyfill/ie9'
import 'react-app-polyfill/stable'

import React from 'react'
import ReactDOM from 'react-dom'

import {format} from 'date-fns'
import ja from 'date-fns/locale/ja'

import 'formdata-polyfill'
import StatusMessage from "./status_message";

class Comment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: null,
      item: null,
      description: '',
      status: 'ここにAjaxに関するメッセージが表示されます。',
      comments: [],
      mode: []
    }
  }

  componentDidMount() {
    fetch(`http://localhost:3000/react_crud_data/${this.props.id}.json`)
      .then(res => res.json())
      .then((result) => {
          this.setState({
            item: result,
          });
        },
        (error) => {
          this.setState({
            error
          })
        }
      )

    fetch(`http://localhost:3000/react_crud_data/${this.props.id}/comments.json`)
      .then(res => res.json())
      .then((result) => {
        const mode = Array(result.length).fill(null)
        this.setState({
          mode: mode,
          comments: result,
          isLoaded: true,
        })
      },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          })
        }
      )
  }

  run_ajax(method, url, data) {
    fetch(url, {
      method: method,
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
      }
    })
      .then(res => res.json())
      .then((result) => {
        this.setState((state) => {
          state.status = 'サーバーからのメッセージ(' +
            format(new Date(), 'yyyy年MM月dd日(iiii) HH:mm:ss', {locale: ja}) + ') :' +
            result.registration

          if (result.id) {
            if (result.id === 'error') {
              return { status: state.status }
            } else {
              state.comments.unshift({
                id: result.id,
                description: result.description,
                updated_at: result.updated_at
              })
              state.mode.unshift(false)
              return { status: state.status, comments: state.comments, mode: state.mode }
            }
          } else {
            return { status: state.status }
          }
        })
      }, (error) => {
        this.setState((state) => {
          state.status = error.message;
          return { state: state.status }
        })
    })
      .catch((error) => {
        this.setState((state) => {
          state.status = error.message;
          return { state: state.status }
        })
      })
  }

  handleInsert(event) {
    this.setState((state) => {
      if (state.description) {
        this.run_ajax("POST",
          `http://localhost:3000/react_crud_data/${this.props.id}/comments`,
          { comment: { description: state.description } })
        state.description = ''
        return { comments: state.comments }
      }
    })
    event.preventDefault()
  }

  handleDescriptionEdit(event) {
    const value = event.target.value;
    this.setState((state) => {
      state.description = value;
      return { description: state.description }
    })
  }

  handleModeChange(index, event) {
    this.setState((state) => {
      state.mode[index] = !state.mode[index];
      return { mode: state.mode }
    });
    event.preventDefault();
  }

  handleDelete(index, id, event) {
    this.setState((state) => {
      state.comments.splice(index, 1);
      state.mode.splice(index, 1);

      this.run_ajax("DELETE",
        `http://localhost:3000/react_crud_data/${this.props.id}/comments/${id}`,
        {});
      return { comments: state.comments, mode: state.mode }
    })
    event.preventDefault();
  }

  handleUpdate(index, id, event) {
    const form_data = new FormData(event.target);

    this.setState((state) => {
      const txt_description = form_data.get('txt_description');
      if (txt_description && !(state.comments[index].description === txt_description)) {
        state.comments[index].description = txt_description
        state.comments[index].updated_at = new Date();

        this.run_ajax("PUT",
          `http://localhost:3000/react_crud_data/${this.props.id}/comments/${id}`,
          { comment: { description: txt_description } })

        return { comments: state.comments }
      }
    })

    this.handleModeChange(index, event)
  }

  render() {
    const { error, isLoaded, item, comments, mode } = this.state;

    if(error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      return (
        <div>
          <StatusMessage status={this.state.status} />
          <div className="card w-100 mt-3">
            <div className="card-body">
              <h3 className="card-title">{item.name}</h3>
              <div className="card-text">{item.comment}</div>
            </div>
          </div>
          <div className="mt-3">
            <h3>コメントを投稿</h3>
            <form onSubmit={ this.handleInsert.bind(this) }>
              <input type="text" value={ this.state.description } name="txt_description" className="form-control" placeholder="コメント" onChange={ this.handleDescriptionEdit.bind(this) }/>
              <input type="submit" value="登録" className="btn btn-primary"/>
            </form>
          </div>
          <div className="mt-3">
            <h3>コメント一覧</h3>
            <ul className="list-group list-group-flush">
              { comments.map((comment, index) => {
                if (!mode[index]) {
                  return (
                    <li className="list-group-item" key={index}>
                      <p className="mb-0">{ comment.description }</p>
                      <p className="mb-0">{ format(new Date(Date.parse(comment.updated_at)), 'yyyy年MM月dd日(iiii) HH:mm:ss', { locale: ja }) }</p>
                      <form>
                        <div style={ { textAlign: 'right' } }>
                          <input type="submit" value="編集" className="btn btn-primary" onClick={ this.handleModeChange.bind(this, index) }/>
                          <input type="submit" value="削除" className="btn btn-danger" onClick={ this.handleDelete.bind(this, index, comment.id) }/>
                        </div>
                      </form>
                    </li>
                  )
                } else {
                  return (
                    <li className="list-group-item" key={index}>
                      <form onSubmit={this.handleUpdate.bind(this, index, comment.id)}>
                        <input type="text" defaultValue={ comment.description } name="txt_description" className="mb-0 form-control"/>
                        <div style={ { textAlign: 'right' } }>
                          <input type="submit" value="キャンセル" className="btn btn-secondary" onClick={ this.handleModeChange.bind(this, index) }/>
                          <input type="submit" value="更新" className="btn btn-primary"/>
                        </div>
                      </form>
                    </li>
                  )
                }
              })}
            </ul>
          </div>
        </div>
      )
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const itemId = document.getElementById("itemId").value

  ReactDOM.render(
    <Comment id={itemId}/>,
    document.getElementById('root')
  )
})
