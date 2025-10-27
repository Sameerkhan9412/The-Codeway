import { useState } from "react";
import { Grid, Layers, Link, TreePine, Network } from "lucide-react";
import { FiUsers } from "react-icons/fi";
import { ArrayVisualizer } from "../components/visualizers/ArrayVisualizer";
import { StackVisualizer } from "../components/visualizers/StackVisualizer";
import { QueueVisualizer } from "../components/visualizers/QueueVisualizer";
import { LinkedListVisualizer } from "../components/visualizers/LinkedListVisualizer";
import { TreeVisualizer } from "../components/visualizers/TreeVisualizer";
import { GraphVisualizer } from "../components/visualizers/GraphVisualizer";
import Navbar from "../components/common/Navbar";

export const DSAVisualizer = () => {
  const [activeTab, setActiveTab] = useState("array");

  return (
    <div className="min-h-screen bg-[#0F172A] p-6 text-white">
      <Navbar/>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-300 mb-2">
            Interactive Data Structures and Algorithms Visualization
          </h1>
        </div>

        <div className="w-full">
          <div className="flex justify-center mb-6 bg-[#1E293B] rounded-lg p-1">
            <button
              onClick={() => setActiveTab("array")}
              className={`px-6 py-2 rounded-md transition-all text-sm font-medium ${
                activeTab === "array"
                  ? "bg-[#F9A825] text-slate-900"
                  : "hover:bg-slate-700 text-gray-300"
              }`}
            >
              Arrays
            </button>
            <button
              onClick={() => setActiveTab("stack")}
              className={`px-6 py-2 rounded-md transition-all text-sm font-medium ${
                activeTab === "stack"
                  ? "bg-[#F9A825] text-slate-900"
                  : "hover:bg-slate-700 text-gray-300"
              }`}
            >
              Stack
            </button>
            <button
              onClick={() => setActiveTab("queue")}
              className={`px-6 py-2 rounded-md transition-all text-sm font-medium ${
                activeTab === "queue"
                  ? "bg-[#F9A825] text-slate-900"
                  : "hover:bg-slate-700 text-gray-300"
              }`}
            >
              Queue
            </button>
            <button
              onClick={() => setActiveTab("linkedlist")}
              className={`px-6 py-2 rounded-md transition-all text-sm font-medium ${
                activeTab === "linkedlist"
                  ? "bg-[#F9A825] text-slate-900"
                  : "hover:bg-slate-700 text-gray-300"
              }`}
            >
              Linked List
            </button>
            <button
              onClick={() => setActiveTab("tree")}
              className={`px-6 py-2 rounded-md transition-all text-sm font-medium ${
                activeTab === "tree"
                  ? "bg-[#F9A825] text-slate-900"
                  : "hover:bg-slate-700 text-gray-300"
              }`}
            >
              Binary Tree
            </button>
            <button
              onClick={() => setActiveTab("graph")}
              className={`px-6 py-2 rounded-md transition-all text-sm font-medium ${
                activeTab === "graph"
                  ? "bg-[#F9A825] text-slate-900"
                  : "hover:bg-slate-700 text-gray-300"
              }`}
            >
              Graph
            </button>
          </div>

          <div className="space-y-4">
            {activeTab === "array" && <ArrayVisualizer />}
            {activeTab === "stack" && <StackVisualizer />}
            {activeTab === "queue" && <QueueVisualizer />}
            {activeTab === "linkedlist" && <LinkedListVisualizer />}
            {activeTab === "tree" && <TreeVisualizer />}
            {activeTab === "graph" && <GraphVisualizer />}
          </div>
        </div>
      </div>
    </div>
  );
};
