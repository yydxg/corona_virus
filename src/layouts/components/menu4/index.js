import React, { Component, Fragment } from 'react';
import { Link, withRouter } from 'umi';
import styles from './style.less';
import { Modal,Button } from 'antd';
import { connect } from 'dva';


@connect(({ Login,Fangjia,F_Login }) => ({
  Login,Fangjia,F_Login
}))
class TopMenu1 extends Component{

  state = {
    firstMenu: '首页',
    secondMenu: '',
    scrollTop: 0,
    visible:false,
  };

  componentDidMount() {
    if(!this.props.F_Login)
      this.props.history.push('/jiangshui/user/login')
    this.props.history.listen(route => {
      this.setState({
        firstMenu: route.pathname.split('\/')[1],
        secondMenu: route.pathname.split('\/')[2],
      });
      //路由变化回到顶部
      document.body.scrollTop = 0;
    })
  }

  exist = ()=>{
    const {dispatch,history} = this.props
    dispatch({
      type:'F_Login/exist'
    }).then(()=>{
      history.push('/jiangshui/user/login')
    })
  }

  render() {
    const menuList = [
      {
        key: 'jiangshui/info',
        name: '数据管理模块',
        // name: '航班',
        disabled: false,
        children: [
          {
            key: 'zhandian',
            name: '站点信息增删改',
            auth:['养殖厂长','养殖主管','养殖人员'],
          },
          {
            key: 'jiangyuliang',
            name: '降雨量信息管理',
            auth:['养殖厂长','养殖主管','养殖人员'],
          }
        ]
      },
      // {
      //   key: 'jiangshui/work',
      //   name: '工作管理模块',
      //   // name: '火车',
      //   disabled: false,
      //   children: [
      //     {
      //       key: 'productPlan',
      //       name: '生产计划',
      //       auth:['养殖厂长','养殖主管','养殖人员'],
      //     },
      //     {
      //       key: 'history',
      //       name: '工作记录',
      //       auth:['养殖厂长','养殖主管','养殖人员'],
      //     }
      //   ]
      // },
      {
        key: 'jiangshui/statistic',
        name: '降雨信息展示',
        disabled: false,
        children: [
          {
            key: 'cost',
            name: '全年降雨量信息展示',
            auth:['养殖厂长','养殖主管','养殖人员'],
          },
          {
            key: 'wuhan',
            name: '武汉8月降雨量信息展示',
            auth:['养殖厂长','养殖主管','养殖人员'],
          },
          // {
          //   key: 'worktime',
          //   name: '工时出勤统计',
          //   auth:['养殖厂长','养殖主管','养殖人员'],
          // }
        ]
      },
      {
        key: 'jiangshui/config',
        name: '系统设置模块',
        disabled: false,
        children: [
          {
            key: 'users',
            name: '用户管理',
            auth:['养殖厂长','养殖主管','养殖人员'],
          },
          {
            key: 'account',
            name: '账号管理',
            auth:['养殖厂长','养殖主管','养殖人员'],
          }
        ]
      },
      {
        key: 'jiangshui',
        name: '降雨量信息分析',
        disabled: false,
        children: [
          {
            key: 'openlayers',
            name: '降雨信息分析',
            auth:['养殖厂长','养殖主管','养殖人员'],
          },
        ]
      },
    ];

    return (
      <div className={styles.box}>
        <div className={styles.nav}>
          <div className={styles.titBox}>
            <p>基于WebGIS的武汉市降水信息系统</p>
          </div>
          <ul className={styles.menu}>
            {
              menuList.map((item, key) => (
                <li key={key} className={this.state.firstMenu === item.key ? styles.active : ''}>
                  <Link className={styles.first} disabled={item.disabled}>{item.name}</Link>
                  {
                    item.children &&
                    <Fragment>
                      <div className={styles.secondMenuBg}
                           style={{height: item.children.length * 50 + 'px'}} />
                      <div className={styles.secondMenu}>
                        {
                          item.children.map((v, k) => {
                            // if(v.auth.includes(this.props.F_Login?this.props.F_Login.role:'')){
                              return (
                                <div className={styles.secondMenuItem} key={k}>
                                  {
                                    v.callback &&
                                    <a onClick={v.callback}>{v.name}</a>
                                  }
                                  {
                                    !v.callback &&
                                    <Link className={this.state.secondMenu === v.key ? styles.active : ''}
                                          disabled={v.disabled}
                                          to={`/${item.key}/${v.key}`}>{v.name}</Link>
                                  }
                                </div>
                              )
                            // }else{
                            //   return ''
                            // }
                          })
                        }
                      </div>
                    </Fragment>
                  }
                </li>
              ))
            }
          </ul>
          <div className={styles.personal}>
            <i />
            <p>{this.props.F_Login?this.props.F_Login.username:''}</p>
            <Button type="link" onClick={this.exist}>退出</Button>
          </div>
        </div>

      </div>
    );
  }
}

export default withRouter(TopMenu1);

