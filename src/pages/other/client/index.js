import React, { Component, Fragment } from 'react';
import styles from './style.less';
import MuduleTitle from '@/component/moduleTitle';

class VisualizationClient extends Component{

  render () {
    return (
      <Fragment>
        <div className={styles.banner}>
          <p className={styles.tit}>城市三维空间可视化</p>
          <p className={styles.intro}>利用完整的可定制、可扩展创作工具虚幻引擎，通过开箱即用式高品质实时渲染，包括采用光线追踪技术的真实反射效果、动态柔和阴影、环境光遮蔽等，打造拥有高逼真实时沉浸式体验的深圳市城市三维空间场景。</p>
          <a className={styles.download}>客户端下载<span className="iconfont icon-download" /></a>
        </div>

        <Fragment>
          <MuduleTitle titleEn='Softwarebeschreibung' titleDe='SOFTWARE DOCUMENTATION' />
          <ul className={styles.introBox}>
            <li>
              <div className={styles.icon1} />
              <div className={styles.tit}>灵活、开放、可拓展平台</div>
              <div className={styles.txt}>虚幻引擎提供免费的源代码访问权限，健壮的C++ API接口、Python和Blueprint脚本，解决方案根据需求可定制、可扩展。</div>
            </li>
            <li>
              <div className={styles.icon2} />
              <div className={styles.tit}>最高品质视觉效果</div>
              <div className={styles.txt}>基于物理的光栅化渲染、混合光线追踪渲染、基于节点的灵活材质图标、丰富的材质库打造影视级后期处理效果。</div>
            </li>
            <li>
              <div className={styles.icon3} />
              <div className={styles.tit}>快速、简便的数据导入和优化</div>
              <div className={styles.txt}>支持导入3ds Max，Cinema 4D，FBX，SketchUp Pro，Revit，Solidworks，Catia等软件的DCC、CAD和BIM格式的3D资源的非破坏性导入。</div>
            </li>
          </ul>
        </Fragment>

        <Fragment>
          <MuduleTitle titleDe='Szenenanzeige' titleEn='SCENE DISPLAY' />
          <ul className={styles.sceneBox}>
            <li></li>
            <li>
              <div className={styles.tit}>完美地形构建</div>
              <div className={styles.txt}>利用虚幻引擎地形工具构建城市级地形地貌，定制化修改地形细节。使用强大的细节级别（Level of Detail）（LOD）系统和高效利用的内存方式，合理实现高分辨率高度图。</div>
            </li>
            <li>
              <div className={styles.tit}>高逼真光照渲染</div>
              <div className={styles.txt}>通过虚幻引擎基于物理的光栅化器和光线追踪器，自由选择光线追踪反光、阴影、半透明、环境光遮蔽、基于图像的光照和全局光照，从而从需要的性能上获得精细、准确的光照效果，并可根据时间自动调整光照效果。</div>
            </li>
            <li></li>
            <li></li>
            <li>
              <div className={styles.tit}>绚丽夜景仿真</div>
              <div className={styles.txt}>虚幻引擎高保真的实时天空球可以模拟真实世界的昼夜变化，配合夜晚的城市模型与灯光秀材质，即可还原城市夜景。</div>
            </li>
          </ul>
        </Fragment>

      </Fragment>
    );
  }
}

export default VisualizationClient;

