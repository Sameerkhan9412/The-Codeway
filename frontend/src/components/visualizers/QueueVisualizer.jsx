import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Plus, Minus, RotateCcw, Eye, Play } from "lucide-react";

export const QueueVisualizer = () => {
  const [queue, setQueue] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [lastOperation, setLastOperation] = useState("");

  const enqueue = () => {
    const value = parseInt(inputValue);
    if (!isNaN(value)) {
      setQueue([...queue, value]);
      setLastOperation(`enqueue(${value})`);
      setInputValue("");
      toast.success(`Enqueued ${value}`);
    }
  };

  const dequeue = () => {
    if (queue.length > 0) {
      const dequeuedValue = queue[0];
      setQueue(queue.slice(1));
      setLastOperation(`dequeue() → ${dequeuedValue}`);
      toast.success(`Dequeued ${dequeuedValue}`);
    } else {
      toast.error("Queue is empty!");
    }
  };

  const clear = () => {
    setQueue([]);
    setLastOperation("clear()");
    toast.info("Queue cleared");
  };

  const front = () => {
    if (queue.length > 0) {
      const frontValue = queue[0];
      setLastOperation(`front() → ${frontValue}`);
      toast.info(`Front element: ${frontValue}`);
    } else {
      toast.error("Queue is empty!");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Code Editor Section */}
      <div className="bg-[#1E293B] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-300 flex items-center gap-2">
            Queue Operations
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
              onKeyPress={(e) => e.key === "Enter" && enqueue()}
            />
            <Button
              onClick={enqueue}
              className="bg-[#F9A825] hover:bg-[#F9A825]/90 text-slate-900"
            >
              Enqueue
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={dequeue}
              variant="outline"
              className="bg-[#334155] border-[#475569] hover:bg-[#475569] text-gray-300"
              disabled={queue.length === 0}
            >
              Dequeue
            </Button>
            <Button
              onClick={front}
              variant="outline"
              className="bg-[#334155] border-[#475569] hover:bg-[#475569] text-gray-300"
              disabled={queue.length === 0}
            >
              Front
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
            <div className="text-gray-500 mb-2">// Queue Implementation</div>
            <div>
              <span className="text-purple-400">class</span>
              <span className="text-white"> Queue {"{"}</span>
            </div>
            <div className="ml-4">
              <div>
                <span className="text-purple-400">constructor</span>
                <span className="text-white">() {"{"}</span>
              </div>
              <div className="ml-4">
                <span className="text-white">this.items = [];</span>
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
              <strong>Size:</strong> {queue.length}
            </div>
            <div>
              <strong>Front:</strong> {queue.length > 0 ? queue[0] : "Empty"}
            </div>
            <div>
              <strong>Rear:</strong>{" "}
              {queue.length > 0 ? queue[queue.length - 1] : "Empty"}
            </div>
            <div>
              <strong>Empty:</strong> {queue.length === 0 ? "Yes" : "No"}
            </div>
          </div>
        </div>
      </div>

      {/* Queue Visualization Section */}
      <div className="bg-[#1E293B] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-300">
            Queue Visualization
          </h2>
          <span className="text-sm text-gray-500">
            FIFO (First In, First Out)
          </span>
        </div>

        <div className="flex flex-col items-center space-y-6">
          {/* Queue Container */}
          <div className="relative w-full max-w-md">
            <div className="flex gap-1 min-h-[80px] border-t-4 border-b-4 border-[#475569] rounded-lg bg-[#0F172A]/50 p-4 overflow-x-auto">
              {queue.length === 0 ? (
                <div className="flex items-center justify-center w-full text-gray-500">
                  Empty Queue
                </div>
              ) : (
                queue.map((value, index) => (
                  <div
                    key={index}
                    className={`
                      min-w-[3rem] h-12 rounded-lg flex items-center justify-center font-bold text-lg transition-all duration-300
                      ${
                        index === 0
                          ? "bg-[#F9A825] text-slate-900 border-2 border-[#F9A825] shadow-lg"
                          : index === queue.length - 1
                          ? "bg-[#475569] text-white border-2 border-[#F9A825]"
                          : "bg-[#334155] text-gray-300 border-2 border-[#475569]"
                      }
                    `}
                  >
                    {value}
                  </div>
                ))
              )}
            </div>

            {/* Front and Rear Pointers */}
            {queue.length > 0 && (
              <>
                <div className="absolute -top-8 left-4 flex flex-col items-center">
                  <div className="text-[#F9A825] text-sm font-medium">
                    FRONT
                  </div>
                  <div className="w-0.5 h-4 bg-[#F9A825]"></div>
                </div>
                <div className="absolute -bottom-8 right-4 flex flex-col items-center">
                  <div className="w-0.5 h-4 bg-[#475569]"></div>
                  <div className="text-[#475569] text-sm font-medium">REAR</div>
                </div>
              </>
            )}
          </div>

          {/* Legend */}
          <div className="flex gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#F9A825] rounded"></div>
              <span>Front Element</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#475569] rounded"></div>
              <span>Rear Element</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#334155] rounded border border-[#475569]"></div>
              <span>Queue Element</span>
            </div>
          </div>

          {/* Operations Info */}
          <div className="bg-[#0F172A] rounded-lg p-4 w-full text-sm space-y-2 text-gray-400">
            <div>
              <strong className="text-[#F9A825]">Enqueue:</strong> Add element
              to the rear
            </div>
            <div>
              <strong className="text-[#F9A825]">Dequeue:</strong> Remove
              element from the front
            </div>
            <div>
              <strong className="text-[#F9A825]">Front:</strong> View front
              element without removing
            </div>
            <div>
              <strong className="text-[#F9A825]">Time Complexity:</strong> O(1)
              for all operations
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
