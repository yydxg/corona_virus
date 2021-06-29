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

  exist = ()=>{
    const {dispatch,history} = this.props
    dispatch({
      type:'F_Login/exist'
    }).then(()=>{
      history.push('/fish/user/login')
    })
  }

  render() {
    const menuList = [
      {
        key: 'fish/info',
        name: '信息管理模块',
        // name: '航班',
        disabled: false,
        children: [
          {
            key: 'miaozhong',
            name: '苗种管理',
            auth:['养殖厂长','养殖主管'],
          },
          {
            key: 'shebei',
            name: '设备管理',
            auth:['养殖厂长','养殖主管'],
          },
          {
            key: 'siliao',
            name: '饲料管理',
            auth:['养殖厂长','养殖主管'],
          },
          {
            key: 'yaopin',
            name: '药品管理',
            auth:['养殖厂长','养殖主管'],
          },
          {
            key: 'yutang',
            name: '鱼塘管理',
            auth:['养殖厂长','养殖主管'],
          },
          {
            key: 'fangyang',
            name: '放养管理',
            auth:['养殖厂长','养殖主管','养殖人员'],
          },
          {
            key: 'touliao',
            name: '投料管理',
            auth:['养殖厂长','养殖主管','养殖人员'],
          },
          {
            key: 'shiyong',
            name: '设备使用情况',
            auth:['养殖厂长','养殖主管','养殖人员'],
          },
          {
            key: 'touyao',
            name: '投药管理',
            auth:['养殖厂长','养殖主管','养殖人员'],
          },
          {
            key: 'touliao_touyao',
            name: '投药/投料 管理',
            auth:['养殖厂长','养殖主管','养殖人员'],
          },
          {
            key: 'shuizhi',
            name: '水质信息管理',
            auth:['养殖厂长','养殖主管','养殖人员'],
          },
          {
            key: 'buhuo',
            name: '捕获管理',
            auth:['养殖厂长','养殖主管','养殖人员'],
          }
        ]
      },
      {
        key: 'fish/work',
        name: '工作管理模块',
        // name: '火车',
        disabled: false,
        children: [
          {
            key: 'productPlan',
            name: '生产计划',
            auth:['养殖厂长','养殖主管'],
          },
          // {
          //   key: 'jobPlan',
          //   name: '派工计划',
          //   auth:['养殖厂长','养殖主管'],
          // },
          {
            key: 'history',
            name: '工作记录',
            auth:['养殖厂长','养殖主管','养殖人员'],
          }
        ]
      },
      {
        key: 'fish/statistic',
        name: '统计分析模块',
        // name: '天气',
        disabled: false,
        children: [
          {
            key: 'cost',
            name: '物料费用统计',
            auth:['养殖厂长','养殖主管'],
          },
          {
            key: 'worktime',
            name: '工时出勤统计',
            auth:['养殖厂长','养殖主管','养殖人员'],
          }
        ]
      },
      {
        key: 'fish/config',
        name: '系统设置模块',
        // name: '设置',
        disabled: false,
        children: [
          {
            key: 'users',
            name: '用户管理',
            auth:['养殖厂长'],
          },
          {
            key: 'account',
            name: '账号管理',
            auth:['养殖厂长','养殖主管','养殖人员'],
          }
        ]
      },
    ];

    return (
      <div className={styles.box}>
        <div className={styles.nav}>
          <div className={styles.titBox}>
            {/* <p>基于苏州房价数据的可视化系统</p> */}
            {/* <p>环宇公司智慧水产养殖系统</p> */}
            {/* <p>智慧出行可视化决策支持平台 </p> */}
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
                            if(v.auth.includes(this.props.F_Login?this.props.F_Login.role:'')){
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
                            }else{
                              return ''
                            }
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

