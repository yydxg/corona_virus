export default {
  treeShaking: true,
  hash: true,
  // base:'huibao',
  // publicPath: '/huibao/',
  // outputPath:'./dist/huibao',
  proxy:{
    '/api':{
      // target:'http://127.0.0.1:8008',//9000
      target:'http://127.0.0.1:9000',
      changeOrigin:true
    },
    '/api/services':{
      target:'http://127.0.0.1:9000',
      changeOrigin:true
    },
    '/djapi':{
      target:'http://127.0.0.1:9000',
      changeOrigin:true
    },
    // '/cesium/':{
    //   target:'http://127.0.0.1:8085',
    //   changeOrigin:true
    // },
    '/nongye':{
      // target:'http://47.115.201.167:8081',
      target:'http://127.0.0.1:8081',
      changeOrigin:true,
      pathRewrite:{ '^/nongye':'' }
    },
    '/geoserver':{
      target:'http://47.115.201.167:8081',
      // target:'http://183.196.236.186:9510',
      changeOrigin:true
    },
    '/dataGis':{
      target:'http://data.cma.cn',
      changeOrigin:true
    },
    '/live3d':{
      target:'http://data.marsgis.cn',
      changeOrigin:true,
      pathRewrite:{ '^/live3d':'' }
    },
    '/data/dadi':{
      target:'http://lish.cool:8002',
      changeOrigin:true,
    }
  },
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    ['umi-plugin-react', {
      antd: true,
      dva: true,
      dynamicImport: { webpackChunkName: true },
      title: 'supermap-study',
      dll: true,
      
      routes: {
        exclude: [
          /models\//,
          /services\//,
          /model\.(t|j)sx?$/,
          /service\.(t|j)sx?$/,
          /components\//,
        ],
      },
    }],
  ],
}