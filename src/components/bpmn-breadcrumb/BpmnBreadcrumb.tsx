import { defineComponent } from 'vue';
import { useProcessBreadcrumb } from './useProcessBreadcrumb';
import './bpmn-breadcrumb.css';

export default defineComponent({
  name: 'BpmnBreadcrumb',
  setup() {
    const { pathStack, navigateToLevel } = useProcessBreadcrumb();

    return () => {
      if (pathStack.value.length === 0) {
        return null;
      }

      return (
        <div class="bpmn-breadcrumb">
          {pathStack.value.map((item, index) => (
            <span key={item.id}>
              {index > 0 && <span class="bpmn-breadcrumb-separator"> &gt; </span>}
              <span
                class={{
                  'bpmn-breadcrumb-item': true,
                  'bpmn-breadcrumb-item-clickable': index < pathStack.value.length - 1,
                }}
                onClick={() => {
                  if (index < pathStack.value.length - 1) {
                    navigateToLevel(index);
                  }
                }}
              >
                {item.name || item.id}
              </span>
            </span>
          ))}
        </div>
      );
    };
  },
});

