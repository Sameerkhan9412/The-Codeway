import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Plus, Minus, RotateCcw, Search, Play } from "lucide-react";

export const TreeVisualizer = () => {
  const [root, setRoot] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [lastOperation, setLastOperation] = useState("");
  const [highlightedNodes, setHighlightedNodes] = useState(new Set());

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const insertNode = (root, value) => {
    if (root === null) {
      return { value, left: null, right: null, id: generateId() };
    }

    if (value < root.value) {
      root.left = insertNode(root.left, value);
    } else if (value > root.value) {
      root.right = insertNode(root.right, value);
    }

    return root;
  };

  const deleteNode = (root, value) => {
    if (root === null) return root;

    if (value < root.value) {
      root.left = deleteNode(root.left, value);
    } else if (value > root.value) {
      root.right = deleteNode(root.right, value);
    } else {
      if (root.left === null) return root.right;
      if (root.right === null) return root.left;

      const minValueNode = findMin(root.right);
      root.value = minValueNode.value;
      root.right = deleteNode(root.right, minValueNode.value);
    }

    return root;
  };

  const findMin = (node) => {
    while (node.left !== null) {
      node = node.left;
    }
    return node;
  };

  const searchNode = (root, value, path = []) => {
    if (root === null) return null;

    path.push(root.id);

    if (root.value === value) {
      return path;
    }

    if (value < root.value) {
      return searchNode(root.left, value, path);
    } else {
      return searchNode(root.right, value, path);
    }
  };

  const insert = () => {
    const value = parseInt(inputValue);
    if (!isNaN(value)) {
      setRoot((prevRoot) => insertNode(prevRoot, value));
      setLastOperation(`insert(${value})`);
      setInputValue("");
      toast.success(`Inserted ${value} into BST`);
    }
  };

  const deleteValue = () => {
    const value = parseInt(inputValue);
    if (!isNaN(value)) {
      setRoot((prevRoot) => deleteNode(prevRoot, value));
      setLastOperation(`delete(${value})`);
      setInputValue("");
      toast.success(`Deleted ${value} from BST`);
    }
  };

  const search = () => {
    const value = parseInt(searchValue);
    if (!isNaN(value) && root) {
      const path = searchNode(root, value);
      if (path) {
        setHighlightedNodes(new Set(path));
        setLastOperation(`search(${value}) → found`);
        toast.success(`Found ${value} in BST`);
        setTimeout(() => setHighlightedNodes(new Set()), 3000);
      } else {
        setLastOperation(`search(${value}) → not found`);
        toast.error(`${value} not found in BST`);
      }
      setSearchValue("");
    }
  };

  const clear = () => {
    setRoot(null);
    setHighlightedNodes(new Set());
    setLastOperation("clear()");
    toast.info("Tree cleared");
  };

  const getTreeHeight = (node) => {
    if (node === null) return 0;
    return 1 + Math.max(getTreeHeight(node.left), getTreeHeight(node.right));
  };

  const getNodeCount = (node) => {
    if (node === null) return 0;
    return 1 + getNodeCount(node.left) + getNodeCount(node.right);
  };

  const renderTree = (node, x, y, xOffset) => {
    if (!node) return [];

    const elements = [];
    const isHighlighted = highlightedNodes.has(node.id);

    if (node.left) {
      const leftX = x - xOffset;
      const leftY = y + 80;
      elements.push(
        <line
          key={`line-left-${node.id}`}
          x1={x}
          y1={y + 20}
          x2={leftX}
          y2={leftY - 20}
          stroke="#475569"
          strokeWidth="2"
        />
      );
      elements.push(...renderTree(node.left, leftX, leftY, xOffset / 2));
    }

    if (node.right) {
      const rightX = x + xOffset;
      const rightY = y + 80;
      elements.push(
        <line
          key={`line-right-${node.id}`}
          x1={x}
          y1={y + 20}
          x2={rightX}
          y2={rightY - 20}
          stroke="#475569"
          strokeWidth="2"
        />
      );
      elements.push(...renderTree(node.right, rightX, rightY, xOffset / 2));
    }

    elements.push(
      <g key={`node-${node.id}`}>
        <circle
          cx={x}
          cy={y}
          r="20"
          fill={isHighlighted ? "#F9A825" : "#334155"}
          stroke={isHighlighted ? "#F9A825" : "#475569"}
          strokeWidth="2"
          className="transition-all duration-300"
        />
        <text
          x={x}
          y={y + 5}
          textAnchor="middle"
          fill={isHighlighted ? "#1E293B" : "#FFFFFF"}
          fontSize="14"
          fontWeight="bold"
        >
          {node.value}
        </text>
      </g>
    );

    return elements;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-[#1E293B] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-300 flex items-center gap-2">
            Binary Search Tree
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Enter value"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="bg-[#334155] border-[#475569] text-gray-300"
              onKeyPress={(e) => e.key === "Enter" && insert()}
            />
            <Button
              onClick={insert}
              className="bg-[#F9A825] hover:bg-[#F9A825]/90 text-slate-900"
              disabled={isNaN(parseInt(inputValue))}
            >
              Insert
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={deleteValue}
              variant="outline"
              className="bg-[#334155] border-[#475569] hover:bg-[#475569] text-gray-300"
              disabled={isNaN(parseInt(inputValue)) || !root}
            >
              Delete
            </Button>
            <Button
              onClick={clear}
              variant="outline"
              className="bg-[#334155] border-[#475569] hover:bg-[#475569] text-gray-300"
            >
              Clear
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Search value"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="bg-[#334155] border-[#475569] text-gray-300"
              onKeyPress={(e) => e.key === "Enter" && search()}
            />
            <Button
              onClick={search}
              variant="outline"
              className="bg-[#334155] border-[#475569] hover:bg-[#475569] text-gray-300"
              disabled={isNaN(parseInt(searchValue)) || !root}
            >
              Search
            </Button>
          </div>

          <div className="bg-[#0F172A] rounded-lg p-4 font-mono text-sm text-gray-300">
            <div className="text-gray-500 mb-2">// Binary Search Tree</div>
            <div>
              <span className="text-purple-400">class</span>
              <span className="text-white"> BST {"{"}</span>
            </div>
            <div className="ml-4">
              <div>
                <span className="text-purple-400">constructor</span>
                <span className="text-white">() {"{"}</span>
              </div>
              <div className="ml-4">
                <span className="text-white">this.root = null;</span>
              </div>
              <div className="text-white">{"}"}</div>
              <br />
              <div className="text-yellow-400">
                {lastOperation || "// Operations will appear here"}
              </div>
            </div>
            <div className="text-white">{"}"}</div>
          </div>

          <div className="text-sm text-gray-400 space-y-1">
            <div>
              <strong>Nodes:</strong> {getNodeCount(root)}
            </div>
            <div>
              <strong>Height:</strong> {getTreeHeight(root)}
            </div>
            <div>
              <strong>Root:</strong> {root ? root.value : "null"}
            </div>
            <div>
              <strong>Empty:</strong> {!root ? "Yes" : "No"}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#1E293B] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-300">
            BST Visualization
          </h2>
          <span className="text-sm text-gray-500">
            Left &lt; Root &lt; Right
          </span>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="w-full h-96 overflow-auto border border-[#475569] rounded-lg bg-[#0F172A]/50">
            {!root ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                Empty Binary Search Tree
              </div>
            ) : (
              <svg
                width="100%"
                height="100%"
                className="min-w-[400px] min-h-[300px]"
              >
                {renderTree(root, 200, 40, 80)}
              </svg>
            )}
          </div>

          <div className="flex gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#F9A825] rounded-full"></div>
              <span>Search Path</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#334155] rounded-full border border-[#475569]"></div>
              <span>Tree Node</span>
            </div>
          </div>

          <div className="bg-[#0F172A] rounded-lg p-4 w-full text-sm space-y-2 text-gray-400">
            <div>
              <strong className="text-[#F9A825]">Insert:</strong> O(log n)
              average, O(n) worst case
            </div>
            <div>
              <strong className="text-[#F9A825]">Delete:</strong> O(log n)
              average, O(n) worst case
            </div>
            <div>
              <strong className="text-[#F9A825]">Search:</strong> O(log n)
              average, O(n) worst case
            </div>
            <div>
              <strong className="text-[#F9A825]">Property:</strong> Left subtree
              &lt; Root &lt; Right subtree
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
