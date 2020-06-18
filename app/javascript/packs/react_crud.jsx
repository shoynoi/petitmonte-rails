import 'react-app-polyfill/ie9'
import 'react-app-polyfill/stable'

import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

import {format} from 'date-fns'
import ja from 'date-fns/locale/ja'

import 'formdata-polyfill'

class ReactCrudComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      items: [],
      mode: [],
      name: '',
      comment: '',
      status: 'ここにAjaxに関するメッセージが表示されます。'
    }
  }

  run_ajax(method, url, data) {
    fetch(url,
      {
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
          format(new Date(), 'yyyy年MM月dd日(iiii) HH:mm:ss', {locale: ja}) + ') :' + result.registration

          if (result.id) {
            if (result.id === 'error') {
              return {status: state.status}
            } else {
              state.items.unshift({
                id: result.id,
                name: result.name,
                comment: result.comment,
                updated_at: result.updated_at});
              state.mode.unshift(false)
              return {status: state.status, items: state.items, mode: state.mode}
            }
          } else {
            return {status: state.status}
          }
        });
      },
        (error) => {
        this.setState((state) => {
          state.status = error.message;
          return {state: state.status}
        })
        }
      )
      .catch((error) => {
        this.setState((state) => {
          state.status = error.message;
          return {state: state.status}
        })
      })
  }

  handleNameChange(event) {
    const value = event.target.value;
    this.setState((state) => {
      state.name = value;
      return {name: state.name}
    })
  }

  handleCommentChange(event) {
    const value = event.target.value
    this.setState((state) => {
      state.comment = value;
      return {comment: state.comment}
    })
  }

  handleModeChange(index, event) {
    this.setState((state) => {
      state.mode[index] = !state.mode[index]
      return {mode: state.mode}
    });
    event.preventDefault()
  }

  handleInsert(event) {
    this.setState((state) => {
      if (state.name && state.comment) {
        this.run_ajax("POST",
          "http://localhost:3000/react_crud_data/",
          {datum: {name: state.name, comment: state.comment}});

        state.name = ''
        state.comment = ''
        return {items: state.items}
      }
    });
    event.preventDefault()
  }

  handleUpdate(index, id, event) {
    const form_data = new FormData(event.target);

    this.setState((state) => {
      const txt_name = form_data.get('txt_name');
      const txt_comment = form_data.get('txt_comment');

      if ((txt_name && txt_comment) &&
        (!(state.items[index].name === txt_name &&
        state.items[index].comment === txt_comment))
      ) {
        state.items[index].name = txt_name
        state.items[index].comment = txt_comment
        state.items[index].updated_at = new Date();

        this.run_ajax("PUT",
          "http://localhost:3000/react_crud_data/"  + id,
          {datum: {name: txt_name, comment: txt_comment}})

        return {items: state.items}
      }
    })

    this.handleModeChange(index, event)
  }

  handleDelete(index, id, event) {
    this.setState((state) => {
      state.items.splice(index, 1)
      state.mode.splice(index, 1)

      this.run_ajax("DELETE",
        "http://localhost:3000/react_crud_data/"  + id,
        {});
      return {items: state.items, mode: state.mode}
    })
    event.preventDefault()
  }

  componentDidMount() {
    fetch("http://localhost:3000/react_crud_data.json")
      .then(res => res.json())
      .then((result) => {
        const mode = Array(result.length).fill(null)

        this.setState({
          isLoaded: true,
          items: result,
          mode: mode,
        });
      },
        (error) => {
        this.setState({
          isLoaded: false,
          error
        })
        }
      )
  }

  render() {
    const { error, isLoaded, items, mode } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      return (
        <div>
          <p />
          <div className="fixed-bottom bg-dark text-white" style={{opacity: 0.55}}>
            <span>&nbsp;&nbsp;</span>
            <span>{this.state.status}</span>
          </div>
          <h3>投稿</h3>
          <p />
          <form onSubmit={this.handleInsert.bind(this)}>
            <input type="text" value={this.state.name} name="txt_name" className="form-control" placeholder="名前" onChange={this.handleNameChange.bind(this)}/>
            <textarea value={this.state.comment} name="txt_comment" className="form-control" placeholder="コメントを入力します。" rows="5" onChange={this.handleCommentChange.bind(this)} />
            <input type="submit" value="登録" className="btn btn-primary"/>
          </form>
          <p />
          <h3>一覧</h3>
          <p />
          <div className="card-columns">
            {items.map((item, index) =>{
              if (!mode[index]) {
                return (
                  <div className="card" key={index}>
                    <div className="card-header">
                      {item.name} <br/>{format(new Date(Date.parse(item.updated_at)), 'yyyy年MM月dd日(iiii) HH:mm:ss', {locale: ja})}
                    </div>
                    <div className="card-body">
                      {item.comment}
                      <br/>
                      <br/>
                      <form>
                        <div style={{textAlign: "right"}}>
                          <input type="submit" value="編集" className="btn btn-primary" onClick={this.handleModeChange.bind(this, index)}/>
                          &nbsp;&nbsp;
                          <input type="submit" value="削除" className="btn btn-danger" onClick={this.handleDelete.bind(this, index, item.id)}/>
                          &nbsp;&nbsp;
                        </div>
                      </form>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="card" key={index}>
                    <form onSubmit={this.handleUpdate.bind(this, index, item.id)}>
                      <div className="card-header">
                        <input type="text" defaultValue={item.name} name="txt_name" className="form-control"/>
                      </div>
                      <div className="card-body">
                        <textarea defaultValue={item.comment} name="txt_comment" className="form-control" rows="5"/>
                      </div>
                      <div style={{textAlign: "right"}}>
                        <input type="submit" value="キャンセル" className="btn btn-secondary" onClick={this.handleModeChange.bind(this, index)}/>
                        &nbsp;&nbsp;
                        <input type="submit" value="更新" className="btn btn-primary"/>
                        &nbsp;&nbsp;
                      </div>
                      <p/>
                    </form>
                  </div>
                );
              }
            })}
          </div>
        </div>
      )
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <ReactCrudComponent />,
    document.getElementById('root')
  )
})
