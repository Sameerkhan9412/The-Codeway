import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Plus, Minus, RotateCcw, ArrowRight , Play} from "lucide-react";

export const LinkedListVisualizer = () => {
  const [list, setList] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [insertIndex, setInsertIndex] = useState("");
  const [lastOperation, setLastOperation] = useState("");

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const insertAtBeginning = () => {
    const value = parseInt(inputValue);
    if (!isNaN(value)) {
      const newNode = { value, id: generateId() };
      setList([newNode, ...list]);
      setLastOperation(`insertAtBeginning(${value})`);
      setInputValue("");
      toast.success(`Inserted ${value} at beginning`);
    }
  };

  const insertAtEnd = () => {
    const value = parseInt(inputValue);
    if (!isNaN(value)) {
      const newNode = { value, id: generateId() };
      setList([...list, newNode]);
      setLastOperation(`insertAtEnd(${value})`);
      setInputValue("");
      toast.success(`Inserted ${value} at end`);
    }
  };

  const insertAtIndex = () => {
    const value = parseInt(inputValue);
    const index = parseInt(insertIndex);
    if (!isNaN(value) && !isNaN(index) && index >= 0 && index <= list.length) {
      const newNode = { value, id: generateId() };
      const newList = [...list];
      newList.splice(index, 0, newNode);
      setList(newList);
      setLastOperation(`insertAtIndex(${index}, ${value})`);
      setInputValue("");
      setInsertIndex("");
      toast.success(`Inserted ${value} at index ${index}`);
    } else {
      toast.error("Invalid value or index");
    }
  };

  const deleteAtBeginning = () => {
    if (list.length > 0) {
      const deletedValue = list[0].value;
      setList(list.slice(1));
      setLastOperation(`deleteAtBeginning() → ${deletedValue}`);
      toast.success(`Deleted ${deletedValue} from beginning`);
    } else {
      toast.error("List is empty!");
    }
  };

  const deleteAtEnd = () => {
    if (list.length > 0) {
      const deletedValue = list[list.length - 1].value;
      setList(list.slice(0, -1));
      setLastOperation(`deleteAtEnd() → ${deletedValue}`);
      toast.success(`Deleted ${deletedValue} from end`);
    } else {
      toast.error("List is empty!");
    }
  };

  const deleteAtIndex = () => {
    const index = parseInt(insertIndex);
    if (!isNaN(index) && index >= 0 && index < list.length) {
      const deletedValue = list[index].value;
      const newList = [...list];
      newList.splice(index, 1);
      setList(newList);
      setLastOperation(`deleteAtIndex(${index}) → ${deletedValue}`);
      setInsertIndex("");
      toast.success(`Deleted ${deletedValue} from index ${index}`);
    } else {
      toast.error("Invalid index");
    }
  };

  const clear = () => {
    setList([]);
    setLastOperation("clear()");
    toast.info("List cleared");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Code Editor Section */}
      <div className="bg-[#1E293B] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-300 flex items-center gap-2">
            Linked List Operations
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Enter value"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="bg-[#334155] border-[#475569] text-gray-300 w-20"
            />
            <Input
              type="number"
              placeholder="Index"
              value={insertIndex}
              onChange={(e) => setInsertIndex(e.target.value)}
              className="bg-[#334155] border-[#475569] text-gray-300 w-5"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={insertAtBeginning}
              className="bg-[#F9A825] hover:bg-[#F9A825]/90 text-slate-900 text-xs"
              disabled={isNaN(parseInt(inputValue))}
            >
              Insert at Head
            </Button>
            <Button
              onClick={insertAtEnd}
              className="bg-[#F9A825] hover:bg-[#F9A825]/90 text-slate-900 text-xs"
              disabled={isNaN(parseInt(inputValue))}
            >
              Insert at Tail
            </Button>
            <Button
              onClick={insertAtIndex}
              variant="outline"
              className="bg-[#334155] border-[#475569] hover:bg-[#475569] text-gray-300 text-xs"
              disabled={
                isNaN(parseInt(inputValue)) || isNaN(parseInt(insertIndex))
              }
            >

              Insert at Index
            </Button>
            <Button
              onClick={deleteAtIndex}
              variant="outline"
              className="bg-[#334155] border-[#475569] hover:bg-[#475569] text-gray-300 text-xs"
              disabled={isNaN(parseInt(insertIndex)) || list.length === 0}
            >
           
              Delete at Index
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={deleteAtBeginning}
              variant="outline"
              className="bg-[#334155] border-[#475569] hover:bg-[#475569] text-gray-300"
              disabled={list.length === 0}
            >
             
              Delete Head
            </Button>
            <Button
              onClick={deleteAtEnd}
              variant="outline"
              className="bg-[#334155] border-[#475569] hover:bg-[#475569] text-gray-300"
              disabled={list.length === 0}
            >
              
              Delete Tail
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
            <div className="text-gray-500 mb-2">// Linked List Implementation</div>
            <div>
              <span className="text-purple-400">class</span>
              <span className="text-white"> LinkedList {'{'}</span>
            </div>
            <div className="ml-4">
              <div>
                <span className="text-purple-400">constructor</span>
                <span className="text-white">() {'{'}</span>
              </div>
              <div className="ml-4">
                <span className="text-white">this.head = null;</span>
              </div>
              <div className="text-white">{'}'}</div>
              <br />
              <div className="text-yellow-400">{lastOperation || "// Operations will appear here"}</div>
            </div>
            <div className="text-white">{'}'}</div>
          </div>

          <div className="text-sm text-gray-400 space-y-1">
            <div><strong>Length:</strong> {list.length}</div>
            <div><strong>Head:</strong> {list.length > 0 ? list[0].value : "null"}</div>
            <div><strong>Tail:</strong> {list.length > 0 ? list[list.length - 1].value : "null"}</div>
            <div><strong>Empty:</strong> {list.length === 0 ? "Yes" : "No"}</div>
          </div>
        </div>
      </div>

      {/* Linked List Visualization Section */}
      <div className="bg-[#1E293B] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-300">Linked List Visualization</h2>
          <span className="text-sm text-gray-500">Dynamic Data Structure</span>
        </div>

        <div className="flex flex-col items-center space-y-6">
          {/* Linked List Container */}
          <div className="w-full overflow-x-auto">
            {list.length === 0 ? (
              <div className="flex items-center justify-center h-20 text-gray-500 border-2 border-dashed border-[#475569] rounded-lg">
                Empty Linked List
              </div>
            ) : (
              <div className="flex items-center gap-2 pb-4 min-w-max">
                {/* Head pointer */}
                <div className="flex flex-col items-center mr-4">
                  <div className="text-[#F9A825] text-sm font-medium mb-1">HEAD</div>
                  <div className="w-0.5 h-6 bg-[#F9A825]"></div>
                </div>

                {list.map((node, index) => (
                  <div key={node.id} className="flex items-center">
                    {/* Node */}
                    <div className="flex items-center bg-[#334155] border-2 border-[#475569] rounded-lg overflow-hidden">
                      <div className={`
                        w-16 h-12 flex items-center justify-center font-bold
                        ${index === 0 
                          ? 'bg-[#F9A825] text-slate-900' 
                          : index === list.length - 1
                          ? 'bg-[#475569] text-white'
                          : 'bg-[#334155] text-gray-300'
                        }
                      `}>
                        {node.value}
                      </div>
                      <div className="w-8 h-12 bg-[#0F172A] flex items-center justify-center border-l border-[#475569]">
                        {index < list.length - 1 ? (
                          <ArrowRight className="w-4 h-4 text-[#F9A825]" />
                        ) : (
                          <span className="text-xs text-gray-500">∅</span>
                        )}
                      </div>
                    </div>

                    {/* Arrow between nodes */}
                    {index < list.length - 1 && (
                      <div className="w-8 h-0.5 bg-[#F9A825] mx-1"></div>
                    )}
                  </div>
                ))}

                {/* Tail pointer */}
                {list.length > 0 && (
                  <div className="flex flex-col items-center ml-4">
                    <div className="text-[#475569] text-sm font-medium mb-1">TAIL</div>
                    <div className="w-0.5 h-6 bg-[#475569]"></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex gap-4 text-xs flex-wrap justify-center text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#F9A825] rounded"></div>
              <span>Head Node</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#475569] rounded"></div>
              <span>Tail Node</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#334155] rounded border border-[#475569]"></div>
              <span>Node</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#0F172A] rounded"></div>
              <span>Pointer</span>
            </div>
          </div>

          {/* Operations Info */}
          <div className="bg-[#0F172A] rounded-lg p-4 w-full text-sm space-y-2 text-gray-400">
            <div><strong className="text-[#F9A825]">Insert:</strong> O(1) at head, O(n) at tail/index</div>
            <div><strong className="text-[#F9A825]">Delete:</strong> O(1) at head, O(n) at tail/index</div>
            <div><strong className="text-[#F9A825]">Search:</strong> O(n) - Linear traversal required</div>
            <div><strong className="text-[#F9A825]">Access:</strong> O(n) - No random access</div>
          </div>
        </div>
      </div>
    </div>
  );
};
