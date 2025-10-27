import { useState, useEffect, useRef } from "react";
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
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Wand2,
  PlayCircle,
  Plus,
} from "lucide-react";

export const ArrayVisualizer = () => {
  const [array, setArray] = useState([5, 2, 8, 1, 9]);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [algorithm, setAlgorithm] = useState("bubble");
  const [inputValue, setInputValue] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      intervalRef.current = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, speed);
    } else {
      setIsPlaying(false);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isPlaying, currentStep, steps.length, speed]);

  const bubbleSort = (arr) => {
    const steps = [];
    const workingArray = [...arr];
    const n = workingArray.length;

    steps.push({
      array: [...workingArray],
      activeIndices: [],
      comparingIndices: [],
      description: "Starting Bubble Sort",
      code: "function bubbleSort(arr) {",
    });

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        steps.push({
          array: [...workingArray],
          activeIndices: [j, j + 1],
          comparingIndices: [j, j + 1],
          description: `Comparing elements at indices ${j} and ${j + 1}`,
          code: `  if (arr[${j}] > arr[${j + 1}]) {`,
        });

        if (workingArray[j] > workingArray[j + 1]) {
          [workingArray[j], workingArray[j + 1]] = [
            workingArray[j + 1],
            workingArray[j],
          ];
          steps.push({
            array: [...workingArray],
            activeIndices: [j, j + 1],
            comparingIndices: [],
            description: `Swapped ${workingArray[j + 1]} and ${
              workingArray[j]
            }`,
            code: `    swap(arr[${j}], arr[${j + 1}]);`,
          });
        }
      }
    }

    steps.push({
      array: [...workingArray],
      activeIndices: [],
      comparingIndices: [],
      description: "Sorting completed!",
      code: "}",
    });

    return steps;
  };

  const quickSort = (arr) => {
    const steps = [];
    const workingArray = [...arr];

    const partition = (low, high) => {
      const pivot = workingArray[high];
      let i = low - 1;

      steps.push({
        array: [...workingArray],
        activeIndices: [high],
        comparingIndices: [],
        description: `Pivot selected: ${pivot} at index ${high}`,
        code: `pivot = arr[${high}];`,
      });

      for (let j = low; j < high; j++) {
        steps.push({
          array: [...workingArray],
          activeIndices: [high],
          comparingIndices: [j],
          description: `Comparing ${workingArray[j]} with pivot ${pivot}`,
          code: `if (arr[${j}] <= pivot) {`,
        });

        if (workingArray[j] <= pivot) {
          i++;
          [workingArray[i], workingArray[j]] = [
            workingArray[j],
            workingArray[i],
          ];
          steps.push({
            array: [...workingArray],
            activeIndices: [high, i, j],
            comparingIndices: [],
            description: `Swapped ${workingArray[j]} and ${workingArray[i]}`,
            code: `  swap(arr[${i}], arr[${j}]);`,
          });
        }
      }

      [workingArray[i + 1], workingArray[high]] = [
        workingArray[high],
        workingArray[i + 1],
      ];
      steps.push({
        array: [...workingArray],
        activeIndices: [i + 1],
        comparingIndices: [],
        description: `Placed pivot ${pivot} at correct position`,
        code: `swap(arr[${i + 1}], arr[${high}]);`,
      });

      return i + 1;
    };

    const quickSortHelper = (low, high) => {
      if (low < high) {
        const pi = partition(low, high);
        quickSortHelper(low, pi - 1);
        quickSortHelper(pi + 1, high);
      }
    };

    steps.push({
      array: [...workingArray],
      activeIndices: [],
      comparingIndices: [],
      description: "Starting Quick Sort",
      code: "function quickSort(arr, low, high) {",
    });

    quickSortHelper(0, workingArray.length - 1);

    steps.push({
      array: [...workingArray],
      activeIndices: [],
      comparingIndices: [],
      description: "Quick Sort completed!",
      code: "}",
    });

    return steps;
  };

  const mergeSort = (arr) => {
    const steps = [];
    const workingArray = [...arr];

    const merge = (left, mid, right) => {
      const leftArr = workingArray.slice(left, mid + 1);
      const rightArr = workingArray.slice(mid + 1, right + 1);
      let i = 0,
        j = 0,
        k = left;

      steps.push({
        array: [...workingArray],
        activeIndices: Array.from(
          { length: right - left + 1 },
          (_, idx) => left + idx
        ),
        comparingIndices: [],
        description: `Merging subarrays [${left}..${mid}] and [${
          mid + 1
        }..${right}]`,
        code: `merge(arr, ${left}, ${mid}, ${right});`,
      });

      while (i < leftArr.length && j < rightArr.length) {
        if (leftArr[i] <= rightArr[j]) {
          workingArray[k] = leftArr[i];
          i++;
        } else {
          workingArray[k] = rightArr[j];
          j++;
        }
        steps.push({
          array: [...workingArray],
          activeIndices: [k],
          comparingIndices: [],
          description: `Placed ${workingArray[k]} at position ${k}`,
          code: `arr[${k}] = ${workingArray[k]};`,
        });
        k++;
      }

      while (i < leftArr.length) {
        workingArray[k] = leftArr[i];
        steps.push({
          array: [...workingArray],
          activeIndices: [k],
          comparingIndices: [],
          description: `Placed remaining element ${workingArray[k]}`,
          code: `arr[${k}] = ${workingArray[k]};`,
        });
        i++;
        k++;
      }

      while (j < rightArr.length) {
        workingArray[k] = rightArr[j];
        steps.push({
          array: [...workingArray],
          activeIndices: [k],
          comparingIndices: [],
          description: `Placed remaining element ${workingArray[k]}`,
          code: `arr[${k}] = ${workingArray[k]};`,
        });
        j++;
        k++;
      }
    };

    const mergeSortHelper = (left, right) => {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);
        mergeSortHelper(left, mid);
        mergeSortHelper(mid + 1, right);
        merge(left, mid, right);
      }
    };

    steps.push({
      array: [...workingArray],
      activeIndices: [],
      comparingIndices: [],
      description: "Starting Merge Sort",
      code: "function mergeSort(arr, left, right) {",
    });

    mergeSortHelper(0, workingArray.length - 1);

    steps.push({
      array: [...workingArray],
      activeIndices: [],
      comparingIndices: [],
      description: "Merge Sort completed!",
      code: "}",
    });

    return steps;
  };

  const startVisualization = () => {
    let sortSteps = [];

    switch (algorithm) {
      case "bubble":
        sortSteps = bubbleSort(array);
        break;
      case "quick":
        sortSteps = quickSort(array);
        break;
      case "merge":
        sortSteps = mergeSort(array);
        break;
    }

    setSteps(sortSteps);
    setCurrentStep(0);
    toast.success(`${algorithm} sort visualization started!`);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    setSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
    toast.info("Visualization reset");
  };

  const addElement = () => {
    const value = parseInt(inputValue);
    if (!isNaN(value)) {
      setArray([...array, value]);
      setInputValue("");
      toast.success(`Added ${value} to array`);
    }
  };

  const generateRandomArray = () => {
    const newArray = Array.from(
      { length: 8 },
      () => Math.floor(Math.random() * 50) + 1
    );
    setArray(newArray);
    reset();
    toast.success("Generated random array");
  };

  const currentArray =
    steps.length > 0 ? steps[currentStep]?.array || array : array;
  const activeIndices =
    steps.length > 0 ? steps[currentStep]?.activeIndices || [] : [];
  const comparingIndices =
    steps.length > 0 ? steps[currentStep]?.comparingIndices || [] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Code Editor Section */}
      <div className="bg-[#1E293B] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-300 flex items-center gap-2">
            Code Editor
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={reset}
              variant="outline"
              size="sm"
              className="bg-[#334155] border-[#475569] hover:bg-[#475569] text-gray-300"
            >
              Reset
            </Button>
            <Button
              onClick={generateRandomArray}
              variant="outline"
              size="sm"
              className="bg-[#334155] border-[#475569] hover:bg-[#475569] text-gray-300"
            >
              Generate
            </Button>
            <Button
              onClick={startVisualization}
              className="bg-[#F9A825] hover:bg-[#F9A825]/90 text-slate-900"
              size="sm"
            >
              Visualize
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Select value={algorithm} onValueChange={setAlgorithm}>
              <SelectTrigger className="bg-[#334155] border-[#475569] text-gray-300 w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#334155] border-[#475569] text-gray-300">
                <SelectItem value="bubble">Bubble Sort</SelectItem>
                <SelectItem value="quick">Quick Sort</SelectItem>
                <SelectItem value="merge">Merge Sort</SelectItem>
              </SelectContent>
            </Select>
            <span className="flex-grow" />
            <Input
              type="number"
              placeholder="Add element"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="bg-[#334155] border-[#475569] text-gray-300 w-32"
              onKeyPress={(e) => e.key === "Enter" && addElement()}
            />
            <Button
              onClick={addElement}
              size="sm"
              variant="outline"
              className="bg-[#334155] border-[#475569] hover:bg-[#475569] text-gray-300"
            >
              Add
            </Button>
          </div>

          <div className="bg-[#0F172A] rounded-lg p-4 font-mono text-sm text-gray-300">
            <div className="text-gray-500 mb-2">
              // Array Operations Example
            </div>
            <div>
              <span className="text-purple-400">let</span>
              <span className="text-white"> arr = [</span>
              <span className="text-green-400">{array.join(", ")}</span>
              <span className="text-white">];</span>
            </div>
            <div className="text-yellow-400 mt-2">
              {steps.length > 0 && steps[currentStep]
                ? steps[currentStep].code
                : `${algorithm}Sort(arr);`}
            </div>
          </div>
        </div>
      </div>

      {/* Array Visualization Section */}
      <div className="bg-[#1E293B] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-300">
            Array Visualization
          </h2>
          <span className="text-sm text-gray-500">
            {steps.length > 0
              ? `${currentStep + 1} / ${steps.length}`
              : "Ready to visualize"}
          </span>
        </div>

        <div className="space-y-6">
          {/* Array Display */}
          <div className="flex flex-wrap gap-2 justify-center min-h-[80px] items-center">
            {currentArray.map((value, index) => (
              <div
                key={index}
                className={`
                  w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg transition-all duration-300
                  ${
                    activeIndices.includes(index)
                      ? "bg-[#F9A825] text-slate-900 border-2 border-[#F9A825] shadow-lg transform scale-110"
                      : comparingIndices.includes(index)
                      ? "bg-[#475569] text-white border-2 border-[#F9A825]"
                      : "bg-[#334155] text-gray-300 border-2 border-[#475569] hover:border-[#F9A825]/50"
                  }
                `}
              >
                {value}
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0 || steps.length === 0}
              variant="outline"
              size="sm"
              className="bg-[#334155] border-[#475569] hover:bg-[#475569] text-gray-300"
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            <Button
              onClick={togglePlayback}
              disabled={steps.length === 0 || currentStep >= steps.length - 1}
              className="bg-[#F9A825] hover:bg-[#F9A825]/90 text-slate-900 rounded-full w-12 h-12"
              size="icon"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </Button>

            <Button
              onClick={() =>
                setCurrentStep(Math.min(steps.length - 1, currentStep + 1))
              }
              disabled={currentStep >= steps.length - 1 || steps.length === 0}
              variant="outline"
              size="sm"
              className="bg-[#334155] border-[#475569] hover:bg-[#475569] text-gray-300"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center gap-2 justify-center">
            <span className="text-sm text-gray-500">Speed:</span>
            <Select
              value={speed.toString()}
              onValueChange={(value) => setSpeed(parseInt(value))}
            >
              <SelectTrigger className="w-28 bg-[#334155] border-[#475569] text-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#334155] border-[#475569] text-gray-300">
                <SelectItem value="2000">Slow</SelectItem>
                <SelectItem value="1000">Normal</SelectItem>
                <SelectItem value="500">Fast</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#334155] rounded-full h-2.5">
            <div
              className="bg-[#F9A825] h-2.5 rounded-full transition-all duration-300"
              style={{
                width:
                  steps.length > 0
                    ? `${((currentStep + 1) / steps.length) * 100}%`
                    : "0%",
              }}
            />
          </div>

          {/* Description */}
          {steps.length > 0 && steps[currentStep] && (
            <div className="text-center text-sm text-gray-400 bg-[#0F172A] rounded-lg p-3">
              {steps[currentStep].description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
