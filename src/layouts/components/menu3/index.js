import React, { Component, Fragment } from 'react';
import { Link, withRouter } from 'umi';
import styles from './style.less';
import { Modal, Button } from 'antd';
import { connect } from 'dva';

@connect(({ Login, Fangjia, F_Login }) => ({
  Login, Fangjia, F_Login
}))
class TopMenu3 extends Component {

  state = {
    firstMenu: '首页',
    secondMenu: '',
    scrollTop: 0,
    visible: false,
  };

  componentDidMount() {
    if (!this.props.F_Login)
      this.props.history.push('/fish/user/login')
    this.props.history.listen(route => {
      this.setState({
        firstMenu: route.pathname.split('\/')[1],
        secondMenu: route.pathname.split('\/')[2],
      });
      //路由变化回到顶部
      document.body.scrollTop = 0;
    })
  }

  exist = () => {
    const { dispatch, history } = this.props
    dispatch({
      type: 'F_Login/exist'
    }).then(() => {
      history.push('/fish/user/login')
    })
  }

  render() {
    const menuList = [
      // {
      //   key: 'PigDisease',
      //   name: '首页',
      //   disabled: false
      // },
      // {
      //   key: 'fish/config',
      //   name: '设置',
      //   disabled: false,
      //   children: [
      //     {
      //       key: 'users',
      //       name: '用户管理',
      //     },
      //     {
      //       key: 'account',
      //       name: '用户设置',
      //     }
      //   ]
      // },

      {
        key: 'cesium_travel/flight',
        name: '飞机',
        disabled: false,
      },
    
      {
        key: 'cesium_travel/train',
        name: '火车',
        disabled: false,
      },
      {
        key: 'fish',
        name: '配置',
        disabled: false,
        children: [
          {
            key: 'config/users',
            name: '用户管理',
            disabled: false,
          },
          {
            key: 'config/account',
            name: '个人中心',
            disabled: false,
          }
        ]
      },
    ]

    return (
      <div className={styles.box}>
        <div className={styles.nav}>
          <div className={styles.titBox}>
            <p>CESIUM </p>
          </div>
          <ul className={styles.menu}>
            {
              menuList.map((item, key) => (
                <li key={key} className={this.state.firstMenu === item.key ? styles.active : ''}>
                  <Link className={styles.first} disabled={item.disabled} to={`/${item.key}`}>{item.name}</Link>
                  {
                    item.children &&
                    <Fragment>
                      <div className={styles.secondMenuBg}
                        style={{ height: item.children.length * 50 + 'px' }} />
                      <div className={styles.secondMenu}>
                        {
                          item.children.map((v, k) => {
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
            <p>{this.props.F_Login ? this.props.F_Login.username : ''}</p>
            <Button type="link" onClick={this.exist}>退出</Button>
          </div>
        </div>

      </div>
    );
  }
}

export default withRouter(TopMenu3);

