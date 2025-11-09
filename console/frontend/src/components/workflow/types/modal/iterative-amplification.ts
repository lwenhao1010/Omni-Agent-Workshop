import React from 'react';
import {
  Node,
  Edge,
  Connection,
  OnSelectionChangeParams,
  OnMove,
  Viewport,
} from 'reactflow';
//Flow容器Props
export interface FlowContainerProps {
  zoom: number;
  setZoom: (zoom: number) => void;
  setShowIterativeModal: (show: boolean) => void;
}

export interface useIterativeAmplificationProps {
  beforeNodes: React.RefObject<Node[]>;
  dropZoneRef: React.RefObject<HTMLDivElement>;
  lastSelection: OnSelectionChangeParams;
  addNodeToFlow: (node: Node) => void;
  onEdgeUpdate: (oldEdge: Edge, newConnection: Connection) => void;
  onSelectionChange: (flow: OnSelectionChangeParams) => void;
  onNodeDragStart: () => void;
  onMoveEnd: (event: OnMove, viewport: Viewport) => void;
  handleDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDropAllowed: (event: React.DragEvent<HTMLDivElement>) => void;
}
