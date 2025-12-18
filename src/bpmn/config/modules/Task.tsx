import {
  CommonGroupProperties,
  ExtensionGroupProperties,
  DocumentGroupProperties,
  FormGroupProperties,
  getElementTypeListenerProperties,
} from '../common';
import { ElInput, ElSelect, ElOption } from 'element-plus';

const CommonGroupPropertiesArray = [
  CommonGroupProperties,
  ExtensionGroupProperties,
  DocumentGroupProperties,
];

const TaskListenerProperties = getElementTypeListenerProperties({
  name: '任务监听器',
});

const UserTaskProperties = {
  name: '任务配置',
  icon: 'el-icon-user',
  properties: {
    assignee: {
      component: ElInput,
      placeholder: '代理人',
      vSlots: {
        prepend: (): JSX.Element => <div>代理人</div>,
      },
    },
    candidateUsers: {
      component: ElInput,
      placeholder: '候选用户',
      vSlots: {
        prepend: (): JSX.Element => <div>候选用户</div>,
      },
    },
    candidateGroups: {
      component: ElInput,
      placeholder: '候选组',
      vSlots: {
        prepend: (): JSX.Element => <div>候选组</div>,
      },
    },
    dueDate: {
      component: ElInput,
      placeholder: '到期时间',
      vSlots: {
        prepend: (): JSX.Element => <div>到期时间</div>,
      },
    },
    priority: {
      component: ElInput,
      placeholder: '优先级',
      vSlots: {
        prepend: (): JSX.Element => <div>优先级</div>,
      },
    },
  },
};

const ServiceTaskProperties = {
  name: '服务配置',
  icon: 'el-icon-setting',
  properties: {
    class: {
      component: ElInput,
      placeholder: 'Java类',
      vSlots: {
        prepend: (): JSX.Element => <div>Java类</div>,
      },
    },
    expression: {
      component: ElInput,
      placeholder: '表达式',
      vSlots: {
        prepend: (): JSX.Element => <div>表达式</div>,
      },
    },
    delegateExpression: {
      component: ElInput,
      placeholder: '代理表达式',
      vSlots: {
        prepend: (): JSX.Element => <div>代理表达式</div>,
      },
    },
  },
};

export default {
  //普通任务
  'bpmn:Task': CommonGroupPropertiesArray,
  //用户任务
  'bpmn:UserTask': [
    CommonGroupProperties,
    UserTaskProperties,
    FormGroupProperties,
    TaskListenerProperties,
    ExtensionGroupProperties,
    DocumentGroupProperties,
  ],
  //接收任务
  'bpmn:ReceiveTask': CommonGroupPropertiesArray,
  //发送任务
  'bpmn:SendTask': CommonGroupPropertiesArray,
  //手工任务
  'bpmn:ManualTask': CommonGroupPropertiesArray,
  //业务规则任务
  'bpmn:BusinessRuleTask': [CommonGroupProperties, ServiceTaskProperties, ExtensionGroupProperties, DocumentGroupProperties],
  //服务任务
  'bpmn:ServiceTask': [CommonGroupProperties, ServiceTaskProperties, ExtensionGroupProperties, DocumentGroupProperties],
  //脚本任务
  'bpmn:ScriptTask': [
    CommonGroupProperties,
    {
      name: '脚本配置',
      icon: 'el-icon-document-copy',
      properties: {
        scriptFormat: {
          component: ElInput,
          placeholder: '脚本格式',
          vSlots: {
            prepend: (): JSX.Element => <div>脚本格式</div>,
          },
        },
        script: {
          component: ElInput,
          type: 'textarea',
          placeholder: '脚本内容',
          vSlots: {
            prepend: (): JSX.Element => <div>脚本内容</div>,
          },
          getValue: (obj: { script: string }): string => {
            return obj?.script || '';
          },
        },
      },
    },
    ExtensionGroupProperties,
    DocumentGroupProperties,
  ],
  //调用任务
  'bpmn:CallActivity': [
    CommonGroupProperties,
    {
      name: '调用配置',
      icon: 'el-icon-share',
      properties: {
        calledElement: {
          component: ElInput,
          placeholder: '调用元素',
          vSlots: {
            prepend: (): JSX.Element => <div>调用元素</div>,
          },
        },
      },
    },
    ExtensionGroupProperties,
    DocumentGroupProperties,
  ],
};
