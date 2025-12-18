# BPMN 多层流程设计器：路径导航栏 + 返回按钮功能完整提示词
适用于 AI 智能体（如 Cursor、Windsurf、GitHub Copilot、CodeLlama 等）生成 Vue 3 + TypeScript+js + bpmn.js v18 的完整功能代码。

## 🎯 整体目标
实现一个支持 子流程嵌套导航 的 BPMN 流程设计器，包含以下两个核心 UI 功能：

顶部流程路径导航栏（Breadcrumb）：悬浮与页面左上角（left：10px，top：10px）
左上角“返回上一级”悬浮按钮：悬浮与页面左上角（left：10px，to：30px）
两者协同工作，提供直观的多层级流程设计体验。

## 📌 功能需求详述
### 一、流程路径导航栏（Breadcrumb）
显示规则:
顶部流程路径导航栏（Breadcrumb）：悬浮与页面左上角（left：10px，top：10px）
默认显示当前主流程名称（从 bpmn:process 的 name 获取）
当用户进入子流程（通过 bpmn.js 自带的 “进入” 按钮展开 bpmn:SubProcess）时，自动追加子流程 ID/名称
路径格式：主流程 > 子流程1 > 子流程2
交互行为
点击路径中的任意流程项 → 跳转回该层级
使用响应式栈 pathStack: Ref<ProcessPathItem[]> 管理路径
不自定义 contextPad，完全依赖 bpmn.js conetextPad 内置“进入”按钮

### 二、“返回上一级”悬浮按钮
显示规则
仅当 pathStack.length > 1 时显示
固定定位在页面左上角（left：10px，to：30px）
交互行为
点击后：
现在处于 pathStack[i] 节点，点击返回按钮后，进入 pathStack[i-1] 节点，并更新 pathStack
样式要求
```css
.bpmn-return-button {
  position: absolute;
  left: 24px;
  top: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  z-index: 999;
```

## 🧩 依赖上下文（已有基础）
项目使用 Vue 3（Composition API + <script setup>） + TypeScript
已集成 bpmn.js v18（BpmnJS 类型可用）
主流程 XML 已加载，bpmnModeler 实例已创建
子流程在 BPMN XML 中以标准 <bpmn:subProcess> 形式存在（支持 collapsed 属性）
流程设计页面src/App.tsx
### 📦 技术要求
通用
所有逻辑封装在 可组合函数 useProcessBreadcrumb() 中
类型安全，避免 any（使用 bpmnModeler?.get(...) 安全调用）
不依赖外部 UI 库（如 Element Plus），使用原生 HTML + CSS
#### 路径栈数据结构
```ts
interface ProcessPathItem {
  id: string;
  name?: string;        // 优先显示 name，否则显示 id
  element: any;         // bpmn.js element 对象（含 businessObject）
}
```

### 📁 推荐文件结构
```sh
src/
├── components/
│   └── useProcessBreadcrumb.ts     # 路径导航逻辑
│   └── bpmn/
│       ├── BpmnBreadcrumb.vue       # 路径导航栏组件
│       └── BpmnReturnButton.vue     # 返回按钮组件
```
### 📥 组件 Props 定义
BpmnBreadcrumb.vue
```ts
interface Props {
  pathStack: ProcessPathItem[];
  onGoToProcess: (index: number) => void;
}
```
BpmnReturnButton.vue
```ts
interface Props {
  bpmnModeler: BpmnJS | null;
  pathStack: ProcessPathItem[];
  onGoToParent: () => void; // 等价于 () => onGoToProcess(pathStack.length - 2)
}
```
###🚫 禁止行为
❌ 不要自定义 contextPadProvider（保留 bpmn.js 默认“进入”按钮）
❌ 不要修改 BPMN XML 结构（如添加 innerProcess）
❌ 不要使用全局状态管理（Pinia/Vuex）
❌ 不要重复实现子流程展开逻辑

### 🧪 交互流程示例
初始状态
路径：主流程
返回按钮：隐藏
点击子流程“进入”按钮
路径变为：主流程 > 审批子流程
返回按钮：显示
点击“返回”按钮 或 点击“主流程”
路径恢复：主流程
审批子流程自动收起（图标变回小矩形）
画布聚焦主流程
返回按钮：隐藏

