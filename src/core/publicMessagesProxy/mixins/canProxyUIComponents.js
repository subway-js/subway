export const canProxyUIComponents = self => {
  const exportedComponents = new Map();
  return {
    ...self,
    canProxyUIComponents: true,
    hasComponentsToExport: () => exportedComponents.size > 0,
    getComponentIDs: () => exportedComponents.keys(),
    getComponentById: componentId => exportedComponents.get(componentId),
    exportComponent: (id, factoryFunction, originAggregateName) => {
      if (exportedComponents.has(id)) {
        throw Error(`Component ${id} already exported by another aggregate`);
      }
      exportedComponents.set(id, { factoryFunction, originAggregateName });
    }
  };
};
