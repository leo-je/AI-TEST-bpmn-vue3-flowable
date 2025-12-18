import {
  CommonGroupProperties,
  ExtensionGroupProperties,
  DocumentGroupProperties,
} from '../common';
import { ElInput } from 'element-plus';

const CommonGroupPropertiesArray = [
  CommonGroupProperties,
  ExtensionGroupProperties,
  DocumentGroupProperties,
];

const SequenceFlowProperties = {
  name: '基础信息',
  icon: 'el-icon-info',
  properties: {
    id: {
      component: ElInput,
      placeholder: '节点ID',
      vSlots: {
        prepend: (): JSX.Element => <div>节点ID</div>,
      },
    },
    name: {
      component: ElInput,
      placeholder: '节点名称',
      vSlots: {
        prepend: (): JSX.Element => <div>节点名称</div>,
      },
    },
    conditionExpression: {
      component: ElInput,
      type: 'textarea',
      placeholder: '条件表达式',
      vSlots: {
        prepend: (): JSX.Element => <div>条件表达式</div>,
      },
      getValue: (obj: { conditionExpression: { body: string } }): string => {
        return obj?.conditionExpression?.body || '';
      },
      setValue(businessObject: any, key: string, value: string): void {
        // 处理条件表达式设置
        if (value) {
          const moddle = businessObject.$model;
          const formalExpression = moddle.create('bpmn:FormalExpression', { body: value });
          businessObject[key] = formalExpression;
        } else {
          delete businessObject[key];
        }
      },
    },
  },
};

export default {
  //顺序流
  'bpmn:SequenceFlow': [SequenceFlowProperties, ExtensionGroupProperties, DocumentGroupProperties],
};
