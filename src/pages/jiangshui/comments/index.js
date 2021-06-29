/* global mars3d Cesium*/
import React, { Component } from 'react';
import { Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Table, Tag, Card,Avatar, Form, Message,Input, Icon, Radio, Comment, List } from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import { connect } from 'dva';
import { getCookie, setCookie } from '@/utils/cookie'
import moment from 'moment';

const { TextArea } = Input;

const data = [
  {
    author: 'Han Solo',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    content: (
      <p>
        We supply a series of design principles, practical patterns and high quality design
        resources (Sketch and Axure), to help people create their product prototypes beautifully and
        efficiently.
      </p>
    ),
    datetime: (
      <Tooltip
        title={moment()
          .subtract(1, 'days')
          .format('YYYY-MM-DD HH:mm:ss')}
      >
        <span>
          {moment()
            .subtract(1, 'days')
            .fromNow()}
        </span>
      </Tooltip>
    ),
  },
  {
    author: 'Han Solo',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    content: (
      <p>
        We supply a series of design principles, practical patterns and high quality design
        resources (Sketch and Axure), to help people create their product prototypes beautifully and
        efficiently.
      </p>
    ),
    datetime: (
      <Tooltip
        title={moment()
          .subtract(2, 'days')
          .format('YYYY-MM-DD HH:mm:ss')}
      >
        <span>
          {moment()
            .subtract(2, 'days')
            .fromNow()}
        </span>
      </Tooltip>
    ),
  },
];


@connect(({ Movie, Login }) => ({
  Movie, Login
}))

class MovieComments extends Component {

  constructor(props) {
    super(props)
    this.state = {
      value:'',
      movieName:'',
      data:[],
    }
  }

  componentDidMount() {
    let { dispatch, history,location } = this.props;
    const login = this.props.Login;
    this.setState({
      movieName:location.query.name
    })
    this.initData()
    /* if (login && login.username !== '') {
      dispatch({
        type: 'Movie/getAllMovies',
        callback: res => {
          console.log(res);
        }
      })
    } else {
      history.push('/')
    } */

  }

  initData = ()=>{
    let { dispatch, history,location } = this.props;
    dispatch({
      type: 'Movie/getAllComments',
      payload:{
        movieName:location.query.name
      },
      callback: res => {
        console.log(res);
        const {success ,data } =res
        if(success){
          let newData = data.map((v,i)=>{
            return {
              author: 'Han Solo',
              avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
              content: (
                <p>
                  {v.say}
                </p>
              ),
              datetime: (
                <Tooltip
                  title={moment(v.date)
                    .format('YYYY-MM-DD HH:mm:ss')}
                >
                  <span>
                    {moment(v.date)
                      .fromNow()}
                  </span>
                </Tooltip>
              ),
            }
          })
          this.setState({
            data:newData
          })
        }  
      }
    })
  }

  handleChange = (value) => {
    console.log(`selected ${value}`);
    this.setState({
      semester: value
    })
  }

  onchange = (e)=> {
    this.setState({
      value: e.target.value,
    });
  }

  onSubmit = e =>{
    const { dispatch } = this.props
    const {value,movieName} = this.state
    dispatch({
      type:'Movie/addComment',
      payload:{
        movieName,
        data:{
          say:value,
        }
      }
    }).then(res =>{
      const {success} =res
      if(success){
        Message.info("success")
        this.initData()
      } else{
        Message.info("fail")
      } 
    })
  }
  reback =() =>{
    const {history} = this.props;
    history.push("../movie")
  }

  render() {
    const { movies } = this.props.Movie
    const {value,data} = this.state
    return (
      <div className={styles.Movie} style={{ paddingTop: 100 }}>
        <Card >
          <List
            className="comment-list"
            header={`${data.length} replies`}
            itemLayout="horizontal"
            dataSource={data}
            renderItem={item => (
              <li>
                <Comment
                  actions={item.actions}
                  author={item.author}
                  avatar={item.avatar}
                  content={item.content}
                  datetime={item.datetime}
                />
              </li>
            )}
          />
          <Comment
            avatar={
              <Avatar
                src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                alt="Han Solo"
              />
            }
            content={
              <div>
                <Form.Item>
                  <TextArea rows={4} onChange={this.onchange} value={value} />
                </Form.Item>
                <Form.Item>
                  <Button htmlType="submit" onClick={this.onSubmit} type="primary">
                    Add Comment
                  </Button> &nbsp;&nbsp;
                  <Button onClick={this.reback} type="primary">
                    Reback
                  </Button>
                </Form.Item>
              </div>
            }
          />
        </Card>

      </div>
    )
  }
}

export default MovieComments