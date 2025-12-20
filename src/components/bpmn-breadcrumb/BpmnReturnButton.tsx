import { defineComponent, computed } from 'vue';
import { useProcessBreadcrumb } from './useProcessBreadcrumb';
import './bpmn-breadcrumb.css';

export default defineComponent({
  name: 'BpmnReturnButton',
  setup() {
    const { pathStack, goBack } = useProcessBreadcrumb();
    
    const shouldShow = computed(() => pathStack.value.length > 1);

    return () => {
      if (!shouldShow.value) {
        return null;
      }

      return (
        <button class="bpmn-return-button" onClick={goBack} title="返回上一级">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            style="width: 20px; height: 20px;"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
      );
    };
  },
});

