import { ref, type Ref } from 'vue';
import { BpmnStore } from '@/bpmn/store';

export interface ProcessPathItem {
  id: string;
  name?: string; // 优先显示 name，否则显示 id
  element: any; // bpmn.js element 对象（含 businessObject）
}

/**
 * 获取流程元素的显示名称
 */
function getProcessName(element: any): string {
  if (!element) return '';
  const businessObject = element.businessObject;
  if (!businessObject) return element.id || '';
  
  // 优先使用 name 属性
  if (businessObject.name) {
    return businessObject.name;
  }
  
  // 否则使用 id
  return businessObject.id || element.id || '';
}

// 共享的路径栈状态（单例模式）
const sharedPathStack: Ref<ProcessPathItem[]> = ref([]);
let isNavigating = false; // 标记是否正在执行导航操作
let isSetup = false; // 标记是否已经设置监听器

// 初始化路径栈 - 获取主流程
function initializePathStack() {
  const modeler = BpmnStore.getModeler();
  if (!modeler) {
    return;
  }

  try {
    const canvas = modeler.get('canvas');
    const rootElement = canvas.getRootElement();
    
    if (rootElement) {
      const name = getProcessName(rootElement);
      sharedPathStack.value = [
        {
          id: rootElement.id,
          name: name || rootElement.id,
          element: rootElement,
        },
      ];
    }
  } catch (error) {
    console.warn('Failed to initialize path stack:', error);
  }
}

// 跳转到指定层级
function navigateToLevel(index: number) {
  if (index < 0 || index >= sharedPathStack.value.length) {
    return;
  }

  const targetItem = sharedPathStack.value[index];
  if (!targetItem || !targetItem.id) {
    return;
  }

  const modeler = BpmnStore.getModeler();
  if (!modeler) {
    return;
  }

  try {
    const canvas = modeler.get('canvas');
    const elementRegistry = modeler.get('elementRegistry');
    
    // 从 elementRegistry 获取最新的元素引用
    const targetElement = elementRegistry.get(targetItem.id);
    if (!targetElement) {
      console.warn('Target element not found:', targetItem.id);
      return;
    }

    const currentRootElement = canvas.getRootElement();
    
    // 严格检查：如果目标元素已经是当前根元素，不需要切换
    // 使用字符串比较确保准确性
    const currentRootId = currentRootElement ? (currentRootElement.id || String(currentRootElement)) : null;
    const targetId = targetElement.id || String(targetElement);
    
    if (currentRootId === targetId) {
      // 只更新路径栈，不切换根元素
      sharedPathStack.value = sharedPathStack.value.slice(0, index + 1);
      return;
    }

    isNavigating = true;
    // 先更新路径栈，只保留到目标层级的部分
    sharedPathStack.value = sharedPathStack.value.slice(0, index + 1);
    
    try {
      // 使用从 elementRegistry 获取的元素
      canvas.setRootElement(targetElement);
    } catch (setError: any) {
      // 如果设置失败，可能是因为元素已经是根元素了
      // 检查错误信息，如果是 "already exists" 错误，忽略它
      if (setError && setError.message && setError.message.includes('already exists')) {
        // 这种情况说明元素已经是根元素，我们只需要更新路径栈即可
        // 路径栈已经在上面的代码中更新了
        console.warn('Element is already root, skipping setRootElement:', targetId);
      } else {
        // 其他错误重新抛出
        throw setError;
      }
    }
    
    // 延迟重置标记，确保 root.set 事件已经处理完毕
    setTimeout(() => {
      isNavigating = false;
    }, 0);
  } catch (error) {
    isNavigating = false;
    console.warn('Failed to navigate to level:', error);
  }
}

// 返回上一级
function goBack() {
  if (sharedPathStack.value.length <= 1) {
    return;
  }

  navigateToLevel(sharedPathStack.value.length - 2);
}

// 处理根元素变更事件
function handleRootSet(event: any) {
  if (!event || !event.element) {
    return;
  }

  // 如果是导航操作触发的，跳过处理（路径栈已经由 navigateToLevel 更新）
  if (isNavigating) {
    return;
  }

  const element = event.element;
  const businessObject = element.businessObject;
  
  // 只处理流程和子流程
  if (!businessObject || (businessObject.$type !== 'bpmn:Process' && businessObject.$type !== 'bpmn:SubProcess')) {
    return;
  }

  // 如果路径栈为空，初始化路径栈（可能是首次加载或 XML 导入完成）
  if (sharedPathStack.value.length === 0) {
    const name = getProcessName(element);
    sharedPathStack.value = [
      {
        id: element.id,
        name: name || element.id,
        element: element,
      },
    ];
    return;
  }

  // 检查是否已经在路径栈的最后一个位置（避免重复添加）
  const lastItem = sharedPathStack.value[sharedPathStack.value.length - 1];
  if (lastItem && lastItem.id === element.id) {
    // 更新元素引用和名称（可能元素对象已更新）
    lastItem.element = element;
    lastItem.name = getProcessName(element) || element.id;
    return;
  }

  // 检查是否在路径栈的其他位置（可能是回退操作，但这种情况应该由 navigateToLevel 处理）
  const existingIndex = sharedPathStack.value.findIndex((item) => item.id === element.id);
  if (existingIndex >= 0) {
    // 如果存在但不是最后一个，说明可能是异常情况，重新整理路径栈
    sharedPathStack.value = sharedPathStack.value.slice(0, existingIndex + 1);
    // 更新元素引用和名称
    sharedPathStack.value[existingIndex].element = element;
    sharedPathStack.value[existingIndex].name = getProcessName(element) || element.id;
    return;
  }

  // 添加新的路径项（进入新的子流程）
  const name = getProcessName(element);
  const newItem: ProcessPathItem = {
    id: element.id,
    name: name || element.id,
    element: element,
  };

  sharedPathStack.value.push(newItem);
}

// 处理元素变更事件（用于更新名称）
function handleElementChanged(event: any) {
  if (!event) {
    return;
  }

  // 从事件对象中获取元素（可能是 event.element 或 event.context.element）
  const element = event.element || (event.context && event.context.element);
  if (!element) {
    return;
  }

  const modeler = BpmnStore.getModeler();
  if (!modeler) {
    return;
  }

  try {
    // 从 elementRegistry 获取完整的元素信息（包含 businessObject）
    const elementRegistry = modeler.get('elementRegistry');
    const shape = elementRegistry.get(element.id);
    if (!shape) {
      return;
    }

    const businessObject = shape.businessObject;
    
    // 只处理流程和子流程
    if (!businessObject || (businessObject.$type !== 'bpmn:Process' && businessObject.$type !== 'bpmn:SubProcess')) {
      return;
    }

    // 更新路径栈中对应项的名称和元素引用
    const itemIndex = sharedPathStack.value.findIndex((item) => item.id === element.id);
    if (itemIndex >= 0) {
      const name = getProcessName(shape);
      sharedPathStack.value[itemIndex].name = name || element.id;
      sharedPathStack.value[itemIndex].element = shape;
    }
  } catch (error) {
    // 忽略错误，避免影响其他功能
    console.warn('Failed to handle element changed:', error);
  }
}

// 设置事件监听器
function setupEventListener() {
  const modeler = BpmnStore.getModeler();
  if (!modeler) {
    return;
  }

  const eventBus = modeler.get('eventBus');
  
  // 监听根元素变更事件
  const rootSetHandler = (e: any) => {
    handleRootSet(e);
  };
  eventBus.on('root.set', rootSetHandler);
  
  // 监听元素变更事件（用于更新名称）
  const elementChangedHandler = (e: any) => {
    handleElementChanged(e);
  };
  eventBus.on('element.changed', elementChangedHandler);
}

// 初始化逻辑
function initialize() {
  if (isSetup) {
    return;
  }
  
  isSetup = true;
  
  // 等待 modeler 初始化完成
  const trySetup = () => {
    const modeler = BpmnStore.getModeler();
    if (!modeler) {
      setTimeout(trySetup, 100);
      return;
    }

    // 确保 canvas 和根元素已准备好
    try {
      const canvas = modeler.get('canvas');
      if (canvas && canvas.getRootElement()) {
        initializePathStack();
        setupEventListener();
      } else {
        // 如果根元素还未准备好，再等待一下
        setTimeout(trySetup, 100);
      }
    } catch (error) {
      // 如果出错，继续重试
      setTimeout(trySetup, 100);
    }
  };

  trySetup();
}

/**
 * 流程路径导航 composable
 */
export function useProcessBreadcrumb() {
  // 在首次调用时初始化
  initialize();

  return {
    pathStack: sharedPathStack,
    navigateToLevel,
    goBack,
  };
}

