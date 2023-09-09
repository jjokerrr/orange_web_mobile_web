import state from '../store/state.js';
// 开发环境不使用懒加载, 因为懒加载页面太多的话会造成webpack热更新太慢
const _import = require('./import-' + process.env.NODE_ENV)

function getProps (route) {
  return route.query;
}

// 系统生成路由
const routers = [
  { path: '/login', component: _import('login/index'), name: 'login', props: getProps, desc: '登录' },
  {
    path: '/',
    component: _import('login/index'),
    name: 'root'
  },
  {
    path: '/main',
    component: _import('layout/index'),
    name: 'main',
    props: getProps,
    redirect: {
      name: 'welcome'
    },
    meta: {
      title: '主页',
      showOnly: true
    },
    children: [
      {path: 'formSysUser', component: _import('upms/formSysUser/index'), name: 'formSysUser', meta: {title: '用户管理'}},
      {path: 'formSysDept', component: _import('upms/formSysDept/index'), name: 'formSysDept', meta: {title: '部门管理'}},
      {path: 'formSysRole', component: _import('upms/formSysRole/index'), name: 'formSysRole', meta: {title: '角色管理'}},
      {path: 'formSysMenu', component: _import(state.supportColumn ? 'upms/formSysMenu/formSysColumnMenu' : 'upms/formSysMenu/index'), name: 'formSysMenu', meta: {title: '菜单列表'}},
      {path: 'formSysDict', component: _import('upms/formDictManagement/index'), name: 'formSysDict', meta: {title: '字典管理'}},
      {path: 'formSysPermCode', component: _import('upms/formSysPermCode/index'), name: 'formSysPermCode', meta: {title: '权限字管理'}},
      {path: 'formSysPerm', component: _import('upms/formSysPerm/index'), name: 'formSysPerm', meta: {title: '权限资源管理'}},
      {path: 'formSysOperationLog', component: _import('upms/formSysOperationLog/index'), name: 'formSysOperationLog', meta: {title: '操作日志'}},
      {path: 'formSysLoginUser', component: _import('upms/formSysLoginUser/index'), name: 'formSysLoginUser', meta: {title: '在线用户'}},
      // 在线表单模块路由配置
      {path: 'formOnlineDblink', component: _import('online/formOnlineDblink/index'), name: 'formOnlineDblink', props: getProps, meta: {title: '数据库链接'}},
      {path: 'formOnlineDict', component: _import('online/formOnlineDict/index'), name: 'formOnlineDict', props: getProps, meta: {title: '在线表单字典管理'}},
      {path: 'formOnlinePage', component: _import('online/index'), name: 'formOnlinePage', props: getProps, meta: {title: '在线表单管理'}},
      {path: 'onlineForm', component: _import('online/OnlinePageRender/index'), name: 'onlineForm', props: getProps, meta: {title: '在线表单'}},
      // 工作流模块路由配置
      {path: 'formMessage', component: _import('workflow/formMessage/index'), name: 'formMessage', props: getProps, meta: {title: '催办消息'}},
      {path: 'formFlowCategory', component: _import('workflow/flowCategory/formFlowCategory'), name: 'formFlowCategory', props: getProps, meta: {title: '流程分类管理'}},
      {path: 'formFlowEntry', component: _import('workflow/flowEntry/formFlowEntry'), name: 'formFlowEntry', props: getProps, meta: {title: '流程设计'}},
      {path: 'formAllInstance', component: _import('workflow/taskManager/formAllInstance'), name: 'formAllInstance', props: getProps, meta: {title: '流程实例'}},
      {path: 'formMyTask', component: _import('workflow/taskManager/formMyTask'), name: 'formMyTask', props: getProps, meta: {title: '我的待办'}},
      {path: 'formMyApprovedTask', component: _import('workflow/taskManager/formMyApprovedTask'), name: 'formMyApprovedTask', props: getProps, meta: {title: '已办任务'}},
      {path: 'formMyHistoryTask', component: _import('workflow/taskManager/formMyHistoryTask'), name: 'formMyHistoryTask', props: getProps, meta: {title: '历史流程'}},
      {
        path: 'handlerFlowTask',
        component: _import('workflow/handlerFlowTask/index'),
        name: 'handlerFlowTask',
        props: getProps,
        meta: {title: '流程处理'},
        children: [
          // 静态表单路由设置
        ]
      },
      {path: 'welcome', component: _import('welcome/index'), name: 'welcome', meta: {title: '欢迎'}}
    ]
  },
  // 第三方接入路由
  {
    path: '/thirdParty',
    name: 'thirdParty',
    props: getProps,
    component: _import('thirdParty/index'),
    children: [
      // 流程分类列表
      {
        path: 'thirdFormFlowCategory',
        name: 'thirdFormFlowCategory',
        props: getProps,
        component: _import('workflow/flowCategory/formFlowCategory')
      },
      // 流程分类 新增、编辑
      {
        path: 'thirdAddFormFlowCategory',
        name: 'thirdAddFormFlowCategory',
        props: getProps,
        component: _import('workflow/flowCategory/formEditFlowCategory')
      },
      // 流程实例列表
      {
        path: 'thirdFormAllInstance',
        name: 'thirdFormAllInstance',
        props: getProps,
        component: _import('workflow/taskManager/formAllInstance')
      },
      // 流程图
      {
        path: 'thirdFormTaskProcessViewer',
        name: 'thirdFormTaskProcessViewer',
        props: getProps,
        component: _import('workflow/taskManager/formTaskProcessViewer')
      },
      // 流程干涉
      {
        path: 'thirdFormInterposeInstance',
        name: 'thirdFormInterposeInstance',
        props: getProps,
        component: _import('workflow/taskManager/formInterposeInstance')
      },
      // 数据补偿
      {
        path: 'thirdFormCompensationInstance',
        name: 'thirdFormCompensationInstance',
        props: getProps,
        component: _import('workflow/taskManager/processCompensation')
      },
      // 流程终止
      {
        path: 'thirdFormStopTaskInstance',
        name: 'thirdFormStopTaskInstance',
        props: getProps,
        component: _import('workflow/taskManager/stopTask')
      },
      // 选择用户-处理用户
      {
        path: 'thirdTaskUserSelect',
        name: 'thirdTaskUserSelect',
        props: getProps,
        component: _import('workflow/components/TaskUserSelect')
      },
      // 选择用户-跳转节点
      {
        path: 'thirdSelectUserTask',
        name: 'thirdSelectUserTask',
        props: getProps,
        component: _import('workflow/components/UserTaskSelect/userTaskSelectDlg')
      },
      // 流程设计
      {
        path: 'thirdFormFlowEntry',
        name: 'thirdFormFlowEntry',
        props: getProps,
        component: _import('workflow/flowEntry/formFlowEntry')
      },
      {
        path: 'thirdFormEditFlowEntry',
        name: 'thirdFormEditFlowEntry',
        props: getProps,
        component: _import('workflow/flowEntry/formEditFlowEntry')
      },
      {
        path: 'thirdFormPublishedFlowEntry',
        name: 'thirdFormPublishedFlowEntry',
        props: getProps,
        component: _import('workflow/flowEntry/formPublishedFlowEntry')
      },
      {
        path: 'thirdHandlerFlowTask',
        name: 'thirdHandlerFlowTask',
        props: getProps,
        component: _import('workflow/handlerFlowTask/index')
      },
      // 流程设计-候选用户组
      {
        path: 'thirdTaskGroupSelect',
        name: 'thirdTaskGroupSelect',
        props: getProps,
        component: _import('workflow/components/TaskGroupSelect')
      },
      // 流程设计-选择岗位
      {
        path: 'thirdTaskPostSelect',
        name: 'thirdTaskPostSelect',
        props: getProps,
        component: _import('workflow/components/TaskPostSelect')
      },
      // 流程设计-抄送
      {
        path: 'thirdAddCopyForItem',
        name: 'thirdAddCopyForItem',
        props: getProps,
        component: _import('workflow/components/CopyForSelect/addCopyForItem')
      },
      // 流程设计-抄送
      {
        path: 'thirdEditOperation',
        name: 'thirdEditOperation',
        props: getProps,
        component: _import('workflow/package/refactor/form/formEditOperation')
      },
      // 流程设计-添加变量
      {
        path: 'thirdFormEditFlowEntryVariable',
        name: 'thirdFormEditFlowEntryVariable',
        props: getProps,
        component: _import('workflow/flowEntry/formEditFlowEntryVariable')
      },
      // 流程设计-新建状态
      {
        path: 'thirdFormEditFlowEntryStatus',
        name: 'thirdFormEditFlowEntryStatus',
        props: getProps,
        component: _import('workflow/flowEntry/formEditFlowEntryStatus')
      },
      // 流程设计-新建状态
      {
        path: 'thirdTaskCommit',
        name: 'thirdTaskCommit',
        props: getProps,
        component: _import('workflow/components/TaskCommit')
      },
      // 待办任务
      {
        path: 'thirdFormMyTask',
        name: 'thirdFormMyTask',
        props: getProps,
        component: _import('workflow/taskManager/formMyTask')
      },
      // 历史任务
      {
        path: 'thirdFormMyHistoryTask',
        name: 'thirdFormMyHistoryTask',
        props: getProps,
        component: _import('workflow/taskManager/formMyHistoryTask')
      },
      // 已办任务
      {
        path: 'thirdFormMyApprovedTask',
        name: 'thirdFormMyApprovedTask',
        props: getProps,
        component: _import('workflow/taskManager/formMyApprovedTask')
      },
      // 在线表单部分
      {
        path: 'thirdOnlineForm',
        name: 'thirdOnlineForm',
        props: getProps,
        component: _import('online/OnlinePageRender/index')
      },
      {
        path: 'thirdOnlineEditForm',
        name: 'thirdOnlineEditForm',
        props: getProps,
        component: _import('online/OnlinePageRender/OnlineEditForm/index')
      },
      {
        path: 'thirdFormOnlineDict',
        name: 'thirdFormOnlineDict',
        props: getProps,
        component: _import('online/formOnlineDict/index')
      },
      {
        path: 'thirdEditOnlineDict',
        name: 'thirdEditOnlineDict',
        props: getProps,
        component: _import('online/formOnlineDict/editOnlineDict')
      },
      {
        path: 'thirdOnlinePage',
        name: 'thirdOnlinePage',
        props: getProps,
        component: _import('online/index')
      },
      {
        path: 'thirdEditOnlinePage',
        name: 'thirdEditOnlinePage',
        props: getProps,
        component: _import('online/editOnlinePage/index')
      },
      {
        path: 'thirdEditOnlineForm',
        name: 'thirdEditOnlineForm',
        props: getProps,
        component: _import('online/editOnlinePage/editOnlineForm')
      },
      {
        path: 'thirdEditPageDatasource',
        name: 'thirdEditPageDatasource',
        props: getProps,
        component: _import('online/editOnlinePage/editOnlinePageDatasource')
      },
      {
        path: 'thirdEditPageRelation',
        name: 'thirdEditPageRelation',
        props: getProps,
        component: _import('online/editOnlinePage/editOnlinePageDatasourceRelation')
      },
      {
        path: 'thirdSetOnlineTableColumnRule',
        name: 'thirdSetOnlineTableColumnRule',
        props: getProps,
        component: _import('online/editOnlinePage/setOnlineTableColumnRule')
      },
      {
        path: 'thirdEditVirtualColumnFilter',
        name: 'thirdEditVirtualColumnFilter',
        props: getProps,
        component: _import('online/editOnlinePage/editVirtualColumnFilter')
      },
      {
        path: 'thirdEditTableColumn',
        name: 'thirdEditTableColumn',
        props: getProps,
        component: _import('online/formDesign/editTableColumn')
      },
      {
        path: 'thirdEditCustomFormOperate',
        name: 'thirdEditCustomFormOperate',
        props: getProps,
        component: _import('online/formDesign/components/EditCustomFormOperate')
      },
      {
        path: 'thirdEditFormField',
        name: 'thirdEditFormField',
        props: getProps,
        component: _import('online/formDesign/components/EditFormField')
      },
      {
        path: 'thirdEditDictParamValue',
        name: 'thirdEditDictParamValue',
        props: getProps,
        component: _import('online/formDesign/components/CustomWidgetDictSetting/editDictParamValue')
      },
      {
        path: 'thirdEditOnlineTableColumn',
        name: 'thirdEditOnlineTableColumn',
        props: getProps,
        component: _import('online/formDesign/components/OnlineTableColumnSetting/editOnlineTableColumn')
      },
      {
        path: 'thirdEditOnlineTabPanel',
        name: 'thirdEditOnlineTabPanel',
        props: getProps,
        component: _import('online/formDesign/components/OnlineTabPanelSetting/editOnlineTabPanel')
      },
      {
        path: 'thirdOnlineDblink',
        name: 'thirdOnlineDblink',
        props: getProps,
        component: _import('online/formOnlineDblink/index')
      },
      {
        path: 'thirdEditOnlineDblink',
        name: 'thirdEditOnlineDblink',
        props: getProps,
        component: _import('online/formOnlineDblink/editOnlineDblink')
      },
      // 通用
      {
        path: 'thirdEditDictParamValue2',
        name: 'thirdEditDictParamValue2',
        props: getProps,
        component: _import('components/WidgetAttributeSetting/components/CustomWidgetDictSetting/editDictParamValue', 'online')
      },
      {
        path: 'thirdEditOnlineTableColumn2',
        name: 'thirdEditOnlineTableColumn2',
        props: getProps,
        component: _import('components/WidgetAttributeSetting/components/OnlineTableColumnSetting/editOnlineTableColumn', 'online')
      },
      {
        path: 'thirdEditOnlineTabPanel2',
        name: 'thirdEditOnlineTabPanel2',
        props: getProps,
        component: _import('components/WidgetAttributeSetting/components/OnlineTabPanelSetting/editOnlineTabPanel', 'online')
      },
      {
        path: 'thirdSelectDept',
        name: 'thirdSelectDept',
        props: getProps,
        component: _import('DeptSelect/deptSelectDlg', 'components')
      },
      {
        path: 'thirdSelectUser',
        name: 'thirdSelectUser',
        props: getProps,
        component: _import('UserSelect/userSelectDlg', 'components')
      },
      {
        path: 'thirdSelectData',
        name: 'thirdSelectData',
        props: getProps,
        component: _import('components/OnlineCustomDataSelect/dataSelectDlg', 'online')
      },
      {
        path: 'thirdEditCustomEvent',
        name: 'thirdEditCustomEvent',
        props: getProps,
        component: _import('components/CustomEventSetting/editCustomEvent', 'online')
      }
    ]
  }
];

export default routers;
