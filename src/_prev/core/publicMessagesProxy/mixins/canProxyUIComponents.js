export const canProxyUIComponents = self => {
  const exportedComponents = new Map();
  const subscribers = new Map();

  return {
    ...self,
    canProxyUIComponents: true,
    hasComponentsToExport: () => exportedComponents.size > 0,
    importComponent: (componentId, onComponentExported) => {
      if(exportedComponents.has(componentId)) {
        onComponentExported(exportedComponents.get(componentId))
      } else {
        if(subscribers.has(componentId)) {
          subscribers.get(componentId).push(onComponentExported);
        } else {
          subscribers.set(componentId, [onComponentExported])
        }
      }
    },
    getComponentIDs: () => exportedComponents.keys(),
    // getComponentById: componentId => exportedComponents.get(componentId),
    exportComponent: (id, mount, unmount, originAggregateName) => {
      if (exportedComponents.has(id)) {
        throw Error(`Component ${id} already exported by another aggregate`);
      }
      exportedComponents.set(id, { mount, unmount, originAggregateName });
      if(subscribers.has(id)) {
        subscribers.get(id).forEach(cb => cb({ mount, unmount, originAggregateName }));
        subscribers.set(id, []);
      }
    }
  };
};
