import { useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useDocuments } from '../hooks/useDocuments';
import { useNavigate } from 'react-router-dom';

const nodeWidth = 180;

// Placeholder for future layouting when edges exist
/*
import dagre from '@dagrejs/dagre';
const nodeHeight = 80;
const isHorizontal = false;
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const finalnodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    // Cast strict types if needed
    // node.targetPosition = isHorizontal ? 'left' : 'top';
    // node.sourcePosition = isHorizontal ? 'right' : 'bottom';
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    return node;
  });
  return { nodes: finalnodes, edges };
};
*/

export default function GraphPage() {
    const { documents, isLoading } = useDocuments();
    const navigate = useNavigate();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Transform documents to nodes
    const graphData = useMemo(() => {
        if (!documents || documents.length === 0) return { nodes: [], edges: [] };

        const initialNodes: Node[] = documents.map((doc, index) => ({
            id: doc.id,
            type: 'default',
            position: { x: (index % 3) * 200, y: Math.floor(index / 3) * 100 }, // Initial grid
            data: { label: doc.title || 'Untitled' },
            style: {
                background: '#fff',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '10px',
                width: nodeWidth,
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)',
                fontSize: '0.9rem',
                cursor: 'pointer',
            },
        }));

        // Example edges (if documents had links, for now we just show nodes)
        // We could link sequential notes or similar topics if we had that data
        const initialEdges: Edge[] = [];

        // If we had links, we'd run layout. Since we don't, simple grid is safer than Dagre with no edges
        // But let's use Dagre just in case we add edges later, or for consistent non-overlapping
        // Actually, Dagre without edges might stack them. Let's stick to the grid above for now if no edges.

        return { nodes: initialNodes, edges: initialEdges };
    }, [documents]);

    useEffect(() => {
        setNodes(graphData.nodes);
        setEdges(graphData.edges);
    }, [graphData, setNodes, setEdges]);

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        navigate(`/documents/${node.id}`);
    }, [navigate]);

    if (isLoading) {
        return (
            <div className="container section">
                <div className="loading-placeholder">Loading graph...</div>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: 'calc(100vh - 60px)' }}> {/* Adjust for header/padding */}
            <div className="section-header container" style={{ paddingTop: 'var(--spacing-md)' }}>
                <h2 className="section-title">Knowledge Graph</h2>
                <p className="text-secondary">Visualize connections between your notes.</p>
            </div>

            <div className="graph-container glass-panel" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', borderBottom: 'none' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={onNodeClick}
                    fitView
                    attributionPosition="bottom-right"
                >
                    <Background color="#ccc" gap={20} />
                    <Controls />
                </ReactFlow>
            </div>
        </div>
    );
}
