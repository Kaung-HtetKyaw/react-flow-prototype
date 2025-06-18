import { clustersDataset } from "../dataset/clusters";
import { containersDataset } from "../dataset/containers";
import { namespacesDataset } from "../dataset/namespaces";
import { nodesDataset } from "../dataset/nodes";
import { podsDataset } from "../dataset/pods";
import {
  DatasetClusterWithHierarchy,
  DatasetNamespace,
  DatasetPod,
} from "../dataset/types";

export const getClusterHierarchyFromDataset = (
  id: string,
): DatasetClusterWithHierarchy | null => {
  const cluster = clustersDataset.find((cluster) => cluster.id === id);

  if (!cluster) {
    return null;
  }

  const namespaces = namespacesDataset
    .filter((namespace) => namespace.clusterID === id)
    .map((el) => getNamespaceHierarchyFromDataset(el.id))
    .filter((el) => el !== null);

  return {
    ...cluster,
    namespaces,
    nodes: nodesDataset.filter((node) => node.clusterID === id),
  };
};

export const getNamespaceHierarchyFromDataset = (
  id: string,
): DatasetNamespace | null => {
  const namespace = namespacesDataset.find((namespace) => namespace.id === id);

  if (!namespace) {
    return null;
  }

  const pods = podsDataset
    .filter((pod) => pod.namespaceID === id)
    .map((el) => getPodHierarchyFromDataset(el.id))
    .filter((el) => el !== null);

  return { ...namespace, pods };
};

export const getPodHierarchyFromDataset = (id: string): DatasetPod | null => {
  const pod = podsDataset.find((pod) => pod.id === id);

  if (!pod) {
    return null;
  }

  const containers = containersDataset.filter(
    (container) => container.podID === id,
  );

  return { ...pod, containers };
};
