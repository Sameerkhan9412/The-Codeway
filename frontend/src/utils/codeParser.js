export const parseCode = (code) => {
  const steps = [];
  const lines = code.split('\n');

  const arrayRegex = /const arr = \[(.*)\];/;
  const swapRegex = /swap\((\d+),\s*(\d+)\)/;

  let initialArray = [];
  const arrayMatch = code.match(arrayRegex);
  if (arrayMatch) {
    initialArray = JSON.parse(`[${arrayMatch[1]}]`);
    steps.push({ action: 'init', value: initialArray, line: -1 });
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    let match;

    if ((match = line.match(swapRegex))) {
      steps.push({
        action: 'swap',
        indices: [parseInt(match[1], 10), parseInt(match[2], 10)],
        line: i,
      });
    }
  }

  return steps;
};
