import { createAggregate } from "../aggregate/factory";
import { hasAggregatesStore } from "./mixins/hasAggregatesStore";

export const createCluster = () => {
  const self = {
    name
  };
  return hasAggregatesStore(self, createAggregate);
};
