import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Plus, Minus, RotateCcw, Eye, Play } from "lucide-react";

export const StackVisualizer = () => {
  const [stack, setStack] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [lastOperation, setLastOperation] = useState("");

  const push = () => {
    const value = parseInt(inputValue);
    if (!isNaN(value)) {
      setStack([...stack, value]);
      setLastOperation(`push(${value})`);
      setInputValue("");
      toast.success(`Pushed ${value} onto stack`);
    }
  };

  const pop = () => {
    if (stack.length > 0) {
      const poppedValue = stack[stack.length - 1];
      setStack(stack.slice(0, -1));
      setLastOperation(`pop() → ${poppedValue}`);
      toast.success(`Popped ${poppedValue} from stack`);
    } else {
      toast.error("Stack is empty!");
    }
  };

  const clear = () => {
    setStack([]);
    setLastOperation("clear()");
    toast.info("Stack cleared");
  };

  const peek = () => {
    if (stack.length > 0) {
      const topValue = stack[stack.length - 1];
      setLastOperation(`peek() → ${topValue}`);
      toast.info(`Top element: ${topValue}`);
    } else {
      toast.error("Stack is empty!");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Code Editor Section */}
      <div className="bg-[#1E293B] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-300 flex items-center gap-2">
            Stack Operations
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
              onKeyPress={(e) => e.key === "Enter" && push()}
            />
            <Button
              onClick={push}
              className="bg-[#F9A825] hover:bg-[#F9A825]/90 text-slate-900"
            >
              Push
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={pop}
              variant="outline"
              className="bg-[#334155] border-[#475569] hover:bg-[#475569] text-gray-300"
              disabled={stack.length === 0}
            >
              Pop
            </Button>
            <Button
              onClick={peek}
              variant="outline"
              className="bg-[#334155] border-[#475569] hover:bg-[#475569] text-gray-300"
              disabled={stack.length === 0}
            >
              Peek
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
            <div className="text-gray-500 mb-2">// Stack Implementation</div>
            <div>
              <span className="text-purple-400">class</span>
              <span className="text-white"> Stack {"{"}</span>
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
              <strong>Size:</strong> {stack.length}
            </div>
            <div>
              <strong>Top:</strong>{" "}
              {stack.length > 0 ? stack[stack.length - 1] : "Empty"}
            </div>
            <div>
              <strong>Empty:</strong> {stack.length === 0 ? "Yes" : "No"}
            </div>
          </div>
        </div>
      </div>

      {/* Stack Visualization Section */}
      <div className="bg-[#1E293B] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-300">
            Stack Visualization
          </h2>
          <span className="text-sm text-gray-500">
            LIFO (Last In, First Out)
          </span>
        </div>

        <div className="flex flex-col items-center space-y-4">
          {/* Stack Container */}
          <div className="relative">
            <div className="flex flex-col-reverse space-y-reverse space-y-1 min-h-[300px] w-32 border-l-4 border-r-4 border-b-4 border-[#475569] rounded-b-lg bg-[#0F172A]/50 p-2">
              {stack.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Empty Stack
                </div>
              ) : (
                stack.map((value, index) => (
                  <div
                    key={index}
                    className={`
                      w-full h-12 rounded-lg flex items-center justify-center font-bold text-lg transition-all duration-300
                      ${
                        index === stack.length - 1
                          ? "bg-[#F9A825] text-slate-900 border-2 border-[#F9A825] shadow-lg animate-pulse"
                          : "bg-[#334155] text-gray-300 border-2 border-[#475569]"
                      }
                    `}
                  >
                    {value}
                  </div>
                ))
              )}
            </div>

            {/* Top Pointer */}
            {stack.length > 0 && (
              <div className="absolute -right-16 top-2 flex items-center">
                <div className="w-8 h-0.5 bg-[#F9A825]"></div>
                <div className="text-[#F9A825] text-sm font-medium ml-2">
                  TOP
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#F9A825] rounded"></div>
              <span>Top Element</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#334155] rounded border border-[#475569]"></div>
              <span>Stack Element</span>
            </div>
          </div>

          {/* Operations Info */}
          <div className="bg-[#0F172A] rounded-lg p-4 w-full text-sm space-y-2 text-gray-400">
            <div>
              <strong className="text-[#F9A825]">Push:</strong> Add element to
              the top
            </div>
            <div>
              <strong className="text-[#F9A825]">Pop:</strong> Remove element
              from the top
            </div>
            <div>
              <strong className="text-[#F9A825]">Peek:</strong> View top element
              without removing
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
