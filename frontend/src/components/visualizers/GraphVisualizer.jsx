import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import { Plus, Minus, RotateCcw, Play, Search, Wand2 } from "lucide-react";

export const GraphVisualizer = () => {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [nodeValue, setNodeValue] = useState("");
  const [fromNode, setFromNode] = useState("");
  const [toNode, setToNode] = useState("");
  const [edgeWeight, setEdgeWeight] = useState("");
  const [searchStart, setSearchStart] = useState("");
  const [searchEnd, setSearchEnd] = useState("");
  const [lastOperation, setLastOperation] = useState("");
  const [highlightedNodes, setHighlightedNodes] = useState(new Set());
  const [highlightedEdges, setHighlightedEdges] = useState(new Set());
  const [graphType, setGraphType] = useState("undirected");

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addNode = () => {
    const value = parseInt(nodeValue);
    if (!isNaN(value)) {
      const existingNode = graph.nodes.find((node) => node.value === value);
      if (existingNode) {
        toast.error("Node already exists!");
        return;
      }

      const newNode = {
        id: generateId(),
        value,
        x: 150 + Math.random() * 300,
        y: 50 + Math.random() * 200,
      };

      setGraph((prev) => ({
        ...prev,
        nodes: [...prev.nodes, newNode],
      }));

      setLastOperation(`addNode(${value})`);
      setNodeValue("");
      toast.success(`Added node ${value}`);
    }
  };

  const removeNode = () => {
    const value = parseInt(nodeValue);
    if (!isNaN(value)) {
      const nodeToRemove = graph.nodes.find((node) => node.value === value);
      if (!nodeToRemove) {
        toast.error("Node not found!");
        return;
      }

      setGraph((prev) => ({
        nodes: prev.nodes.filter((node) => node.id !== nodeToRemove.id),
        edges: prev.edges.filter(
          (edge) => edge.from !== nodeToRemove.id && edge.to !== nodeToRemove.id
        ),
      }));

      setLastOperation(`removeNode(${value})`);
      setNodeValue("");
      toast.success(`Removed node ${value}`);
    }
  };

  const addEdge = () => {
    const from = parseInt(fromNode);
    const to = parseInt(toNode);
    const weight = edgeWeight ? parseInt(edgeWeight) : undefined;

    if (isNaN(from) || isNaN(to)) {
      toast.error("Invalid node values!");
      return;
    }

    const fromNodeObj = graph.nodes.find((node) => node.value === from);
    const toNodeObj = graph.nodes.find((node) => node.value === to);

    if (!fromNodeObj || !toNodeObj) {
      toast.error("One or both nodes don't exist!");
      return;
    }

    const edgeExists = graph.edges.some(
      (edge) =>
        (edge.from === fromNodeObj.id && edge.to === toNodeObj.id) ||
        (graphType === "undirected" &&
          edge.from === toNodeObj.id &&
          edge.to === fromNodeObj.id)
    );

    if (edgeExists) {
      toast.error("Edge already exists!");
      return;
    }

    const newEdge = {
      from: fromNodeObj.id,
      to: toNodeObj.id,
      weight,
    };

    setGraph((prev) => ({
      ...prev,
      edges: [...prev.edges, newEdge],
    }));

    setLastOperation(`addEdge(${from}, ${to}${weight ? `, ${weight}` : ""})`);
    setFromNode("");
    setToNode("");
    setEdgeWeight("");
    toast.success(`Added edge ${from} → ${to}`);
  };

  const bfs = (startValue, endValue) => {
    const startNode = graph.nodes.find((node) => node.value === startValue);
    const endNode = graph.nodes.find((node) => node.value === endValue);

    if (!startNode || !endNode) {
      toast.error("Start or end node not found!");
      return;
    }

    const queue = [startNode.id];
    const visited = new Set();
    const parent = new Map();
    const visitedNodes = new Set();
    const visitedEdges = new Set();

    while (queue.length > 0) {
      const currentId = queue.shift();

      if (visited.has(currentId)) continue;
      visited.add(currentId);
      visitedNodes.add(currentId);

      if (currentId === endNode.id) {
        // Reconstruct path
        const path = [];
        let current = endNode.id;
        while (current) {
          path.unshift(current);
          current = parent.get(current);
        }

        // Highlight path
        for (let i = 0; i < path.length - 1; i++) {
          const edge = graph.edges.find(
            (e) =>
              (e.from === path[i] && e.to === path[i + 1]) ||
              (graphType === "undirected" &&
                e.from === path[i + 1] &&
                e.to === path[i])
          );
          if (edge) {
            visitedEdges.add(`${edge.from}-${edge.to}`);
          }
        }

        setHighlightedNodes(new Set(path));
        setHighlightedEdges(visitedEdges);
        setLastOperation(`BFS(${startValue}, ${endValue}) → path found`);
        toast.success(
          `Path found: ${path
            .map((id) => graph.nodes.find((n) => n.id === id)?.value)
            .join(" → ")}`
        );
        setTimeout(() => {
          setHighlightedNodes(new Set());
          setHighlightedEdges(new Set());
        }, 5000);
        return;
      }

      // Add neighbors to queue
      for (const edge of graph.edges) {
        let neighborId = null;
        if (edge.from === currentId) {
          neighborId = edge.to;
        } else if (graphType === "undirected" && edge.to === currentId) {
          neighborId = edge.from;
        }

        if (neighborId && !visited.has(neighborId)) {
          queue.push(neighborId);
          parent.set(neighborId, currentId);
        }
      }
    }

    toast.error("No path found!");
    setLastOperation(`BFS(${startValue}, ${endValue}) → no path`);
  };

  const dfs = (startValue, endValue) => {
    const startNode = graph.nodes.find((node) => node.value === startValue);
    const endNode = graph.nodes.find((node) => node.value === endValue);

    if (!startNode || !endNode) {
      toast.error("Start or end node not found!");
      return;
    }

    const visited = new Set();
    const path = [];
    const visitedEdges = new Set();

    const dfsHelper = (nodeId) => {
      visited.add(nodeId);
      path.push(nodeId);

      if (nodeId === endNode.id) return true;

      for (const edge of graph.edges) {
        let neighborId = null;
        if (edge.from === nodeId) {
          neighborId = edge.to;
        } else if (graphType === "undirected" && edge.to === nodeId) {
          neighborId = edge.from;
        }

        if (neighborId && !visited.has(neighborId)) {
          visitedEdges.add(`${edge.from}-${edge.to}`);
          if (dfsHelper(neighborId)) return true;
        }
      }

      path.pop();
      return false;
    };

    if (dfsHelper(startNode.id)) {
      setHighlightedNodes(new Set(path));
      setHighlightedEdges(visitedEdges);
      setLastOperation(`DFS(${startValue}, ${endValue}) → path found`);
      toast.success(
        `Path found: ${path
          .map((id) => graph.nodes.find((n) => n.id === id)?.value)
          .join(" → ")}`
      );
      setTimeout(() => {
        setHighlightedNodes(new Set());
        setHighlightedEdges(new Set());
      }, 5000);
    } else {
      toast.error("No path found!");
      setLastOperation(`DFS(${startValue}, ${endValue}) → no path`);
    }
  };

  const runBFS = () => {
    const start = parseInt(searchStart);
    const end = parseInt(searchEnd);
    if (!isNaN(start) && !isNaN(end)) {
      bfs(start, end);
      setSearchStart("");
      setSearchEnd("");
    }
  };

  const runDFS = () => {
    const start = parseInt(searchStart);
    const end = parseInt(searchEnd);
    if (!isNaN(start) && !isNaN(end)) {
      dfs(start, end);
      setSearchStart("");
      setSearchEnd("");
    }
  };

  const clear = () => {
    setGraph({ nodes: [], edges: [] });
    setHighlightedNodes(new Set());
    setHighlightedEdges(new Set());
    setLastOperation("clear()");
    toast.info("Graph cleared");
  };

  const generateSampleGraph = () => {
    const sampleNodes = [
      { id: "1", value: 1, x: 100, y: 100 },
      { id: "2", value: 2, x: 250, y: 50 },
      { id: "3", value: 3, x: 400, y: 100 },
      { id: "4", value: 4, x: 175, y: 200 },
      { id: "5", value: 5, x: 325, y: 200 },
    ];

    const sampleEdges = [
      { from: "1", to: "2" },
      { from: "1", to: "4" },
      { from: "2", to: "3" },
      { from: "2", to: "5" },
      { from: "3", to: "5" },
      { from: "4", to: "5" },
    ];

    setGraph({ nodes: sampleNodes, edges: sampleEdges });
    toast.success("Generated sample graph");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Code Editor Section */}
      <div className="bg-[#1E293B] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-300 flex items-center gap-2">
        
            Graph Operations
          </h2>
          <Select
            value={graphType}
            onValueChange={(value) => setGraphType(value)}
          >
            <SelectTrigger className="w-32 bg-[#334155] border-[#475569] text-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#334155] border-[#475569] text-gray-300">
              <SelectItem value="directed">Directed</SelectItem>
              <SelectItem value="undirected">Undirected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {/* Node Operations */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-400">
              Node Operations
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Node value"
                value={nodeValue}
                onChange={(e) => setNodeValue(e.target.value)}
                className="bg-[#334155] border-[#475569] text-gray-300"
              />
              <Button
                onClick={addNode}
                className="bg-[#F9A825] hover:bg-[#F9A825]/90 text-slate-900"
                disabled={isNaN(parseInt(nodeValue))}
              >
              
                Add Node
              </Button>
              <Button
                onClick={removeNode}
                variant="outline"
                className="bg-[#334155] border-[#475569] hover:bg-[#475569] text-gray-300"
                disabled={isNaN(parseInt(nodeValue))}
              >
             
                Remove
              </Button>
            </div>
          </div>

          {/* Edge Operations */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-400">
              Edge Operations
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                placeholder="From"
                value={fromNode}
                onChange={(e) => setFromNode(e.target.value)}
                className="bg-[#334155] border-[#475569] text-gray-300"
              />
              <Input
                type="number"
                placeholder="To"
                value={toNode}
                onChange={(e) => setToNode(e.target.value)}
                className="bg-[#334155] border-[#475569] text-gray-300"
              />
              <Input
                type="number"
                placeholder="Weight"
                value={edgeWeight}
                onChange={(e) => setEdgeWeight(e.target.value)}
                className="bg-[#334155] border-[#475569] text-gray-300"
              />
            </div>
            <Button
              onClick={addEdge}
              className="bg-[#F9A825] hover:bg-[#F9A825]/90 text-slate-900 w-full"
              disabled={isNaN(parseInt(fromNode)) || isNaN(parseInt(toNode))}
            >
             
              Add Edge
            </Button>
          </div>

          {/* Search Operations */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-400">
              Search Algorithms
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Start"
                value={searchStart}
                onChange={(e) => setSearchStart(e.target.value)}
                className="bg-[#334155] border-[#475569] text-gray-300"
              />
              <Input
                type="number"
                placeholder="End"
                value={searchEnd}
                onChange={(e) => setSearchEnd(e.target.value)}
                className="bg-[#334155] border-[#475569] text-gray-300"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={runBFS}
                variant="outline"
                className="bg-[#334155] border-[#475569] hover:bg-[#475569] text-gray-300 flex-1"
                disabled={
                  isNaN(parseInt(searchStart)) || isNaN(parseInt(searchEnd))
                }
              >
               
                BFS
              </Button>
              <Button
                onClick={runDFS}
                variant="outline"
                className="bg-[#334155] border-[#475569] hover:bg-[#475569] text-gray-300 flex-1"
                disabled={
                  isNaN(parseInt(searchStart)) || isNaN(parseInt(searchEnd))
                }
              >
              
                DFS
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={generateSampleGraph}
              variant="outline"
              className="bg-[#334155] border-[#475569] hover:bg-[#475569] text-gray-300"
            >
           
              Sample
            </Button>
            <Button
              onClick={clear}
              variant="outline"
              className="bg-[#334155] border-[#475569] hover:bg-[#475569] text-gray-300"
            >
             
              Clear
            </Button>
          </div>

          <div className="bg-[#0F172A] rounded-lg p-4 font-mono text-sm text-gray-300">
            <div className="text-gray-500 mb-2">
              // Graph Implementation
            </div>
            <div>
              <span className="text-purple-400">class</span>
              <span className="text-white"> Graph {"{"}</span>
            </div>
            <div className="ml-4">
              <div>
                <span className="text-white">
                  nodes: {graph.nodes.length}
                </span>
              </div>
              <div>
                <span className="text-white">
                  edges: {graph.edges.length}
                </span>
              </div>
              <div>
                <span className="text-white">type: {graphType}</span>
              </div>
              <br />
              <div className="text-yellow-400">
                {lastOperation || "// Operations will appear here"}
              </div>
            </div>
            <div className="text-white">{"}"}</div>
          </div>
        </div>
      </div>

      {/* Graph Visualization Section */}
      <div className="bg-[#1E293B] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-300">
            Graph Visualization
          </h2>
          <span className="text-sm text-gray-500">
            {graph.nodes.length} nodes, {graph.edges.length} edges
          </span>
        </div>

        <div className="flex flex-col space-y-4">
          {/* Graph Container */}
          <div className="w-full h-80 border border-[#475569] rounded-lg bg-[#0F172A]/50 overflow-hidden">
            {graph.nodes.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                Empty Graph - Add nodes to get started
              </div>
            ) : (
              <svg width="100%" height="100%" className="overflow-visible">
                {/* Draw edges first */}
                {graph.edges.map((edge, index) => {
                  const fromNode = graph.nodes.find((n) => n.id === edge.from);
                  const toNode = graph.nodes.find((n) => n.id === edge.to);
                  if (!fromNode || !toNode) return null;

                  const isHighlighted =
                    highlightedEdges.has(`${edge.from}-${edge.to}`) ||
                    highlightedEdges.has(`${edge.to}-${edge.from}`);

                  const angle = Math.atan2(
                    toNode.y - fromNode.y,
                    toNode.x - fromNode.x
                  );
                  const nodeRadius = 15;

                  let lineEndX = toNode.x;
                  let lineEndY = toNode.y;
                  let arrowPoints = "";
                  let arrowTransform = "";

                  if (graphType === "directed") {
                    lineEndX = toNode.x - nodeRadius * Math.cos(angle);
                    lineEndY = toNode.y - nodeRadius * Math.sin(angle);

                    const angleDeg = (angle * 180) / Math.PI;
                    const arrowLength = 8;
                    const arrowWidth = 4;

                    const p1 = `${toNode.x - nodeRadius},${toNode.y}`;
                    const p2 = `${toNode.x - nodeRadius - arrowLength},${
                      toNode.y - arrowWidth
                    }`;
                    const p3 = `${toNode.x - nodeRadius - arrowLength},${
                      toNode.y + arrowWidth
                    }`;

                    arrowPoints = `${p1} ${p2} ${p3}`;
                    arrowTransform = `rotate(${angleDeg} ${toNode.x} ${toNode.y})`;
                  }

                  return (
                    <g key={`edge-${index}`}>
                      <line
                        x1={fromNode.x}
                        y1={fromNode.y}
                        x2={lineEndX}
                        y2={lineEndY}
                        stroke={isHighlighted ? "#F9A825" : "#475569"}
                        strokeWidth={isHighlighted ? "3" : "2"}
                        className="transition-all duration-300"
                      />
                      {graphType === "directed" && (
                        <polygon
                          points={arrowPoints}
                          transform={arrowTransform}
                          fill={isHighlighted ? "#F9A825" : "#475569"}
                          className="transition-all duration-300"
                        />
                      )}
                      {edge.weight && (
                        <text
                          x={(fromNode.x + toNode.x) / 2}
                          y={(fromNode.y + toNode.y) / 2 - 5}
                          textAnchor="middle"
                          fill="#FFFFFF"
                          fontSize="12"
                          className="bg-[#1E293B]"
                        >
                          {edge.weight}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Draw nodes */}
                {graph.nodes.map((node) => {
                  const isHighlighted = highlightedNodes.has(node.id);
                  return (
                    <g key={`node-${node.id}`}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="15"
                        fill={isHighlighted ? "#F9A825" : "#334155"}
                        stroke={isHighlighted ? "#F9A825" : "#475569"}
                        strokeWidth="2"
                        className="transition-all duration-300 cursor-pointer"
                      />
                      <text
                        x={node.x}
                        y={node.y + 4}
                        textAnchor="middle"
                        fill={isHighlighted ? "#1E293B" : "#FFFFFF"}
                        fontSize="12"
                        fontWeight="bold"
                      >
                        {node.value}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>

          {/* Legend */}
          <div className="flex gap-4 text-xs flex-wrap justify-center text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#F9A825] rounded-full"></div>
              <span>Path/Visited</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#334155] rounded-full border border-[#475569]"></div>
              <span>Graph Node</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-0.5 bg-[#475569]"></div>
              <span>Edge</span>
            </div>
          </div>

          {/* Operations Info */}
          <div className="bg-[#0F172A] rounded-lg p-4 text-sm space-y-2 text-gray-400">
            <div>
              <strong className="text-[#F9A825]">BFS:</strong> Explores level by
              level (shortest path)
            </div>
            <div>
              <strong className="text-[#F9A825]">DFS:</strong> Explores as far as
              possible before backtracking
            </div>
            <div>
              <strong className="text-[#F9A825]">Directed:</strong> Edges have
              direction (one-way)
            </div>
            <div>
              <strong className="text-[#F9A825]">Undirected:</strong> Edges are
              bidirectional
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
