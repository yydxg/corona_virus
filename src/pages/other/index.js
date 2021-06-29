import React, { Component } from 'react';
import { Redirect } from 'umi';

class Application extends Component {

  render() {
    return <Redirect to="/other/client" /> ;
  }
}
export default Application
