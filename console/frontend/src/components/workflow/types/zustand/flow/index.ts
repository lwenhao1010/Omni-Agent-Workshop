import {
  Connection,
  Edge,
  Node,
  OnEdgesChange,
  OnNodesChange,
  ReactFlowInstance,
  Viewport,
} from 'reactflow';

export type FlowState = {
  template?: string;
  input_keys?: object;
  memory_keys?: Array<string>;
  handle_keys?: Array<string>;
};

export type FlowStoreType = {
  loadHistory: (nodes: Node[], edges: Edge[]) => void;
  sseData: object;
  isBuilding: boolean;
  isPending: boolean;
  zoom: number;
  setZoom: (zoom: number) => void;
  reactFlowInstance: ReactFlowInstance | null;
  setReactFlowInstance: (newState: ReactFlowInstance) => void;
  flowState: FlowState | undefined;
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  deleteNodeRef: (nodeId: string, outputId: string) => void;
  setNodes: (update: Node[] | ((oldState: Node[]) => Node[])) => void;
  setEdges: (
    update: Edge[] | ((oldState: Edge[]) => Edge[]),
    noNeedTakeSnapshot?: boolean
  ) => void;
  setNode: (id: string, update: Node | ((oldState: Node) => Node)) => void;
  delayCheckNode: (id: string) => void;
  checkNode: (id: string) => boolean;
  deleteNode: (nodeId: string) => void;
  paste: (selection: { nodes: Node[]; edges: Edge[] }) => void;
  lastCopiedSelection: { nodes: unknown; edges: unknown } | null;
  isBuilt: boolean;
  onConnect: (connection: Connection) => void;
  removeNodeRef: (
    souceId: string,
    targetId: string,
    inputEdges?: Edge[]
  ) => void;
  updateNodeRef: (id: string) => void;
  delayUpdateNodeRef: (id: string) => void;
  switchNodeRef: (connection: Connection, oldEdge: Edge) => void;
  moveToPosition: (viewport: Viewport) => void;
  updateNodeNameStatus: (id: string, labelInput?: string) => void;
  reNameNode: (id: string, value: string) => void;
  copyNode: (id: string) => void;
  takeSnapshot: (flag?: boolean) => void;
  historys: History[];
  setHistorys: (
    update: History[] | ((oldState: History[]) => History[])
  ) => void;
  undo: () => void;
};
