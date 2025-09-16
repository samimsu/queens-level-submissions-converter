import React, { useState } from 'react';
import { Copy, ArrowRight, RefreshCw } from 'lucide-react';

interface ParsedLevel {
  levelType: string;
  createdBy: string;
  personalLink: string;
  board: string[][];
  colors: Record<string, string>;
  size: number;
}

function App() {
  const [input, setInput] = useState("");
  
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const parseInput = (text: string): ParsedLevel | null => {
    try {
      const lines = text.split('\n').map(line => line.trim()).filter(line => line);
      
      let levelType = '';
      let createdBy = '';
      let personalLink = '';
      const board: string[][] = [];
      const colors: Record<string, string> = {};
      
      let currentSection = '';
      
      for (const line of lines) {
        if (line.startsWith('Level Type:')) {
          levelType = line.replace('Level Type:', '').trim();
        } else if (line.startsWith('Created By:')) {
          createdBy = line.replace('Created By:', '').trim();
        } else if (line.startsWith('Personal Link:')) {
          personalLink = line.replace('Personal Link:', '').trim();
        } else if (line === 'Board:') {
          currentSection = 'board';
        } else if (line === 'Colors:') {
          currentSection = 'colors';
        } else if (line.startsWith('Submitted via:') || line.startsWith('Get Outlook')) {
          break;
        } else if (currentSection === 'board' && line.startsWith('[') && line.endsWith('],')) {
          const row = line.slice(1, -2).split(',').map(cell => cell.trim());
          board.push(row);
        } else if (currentSection === 'colors' && line.includes(':')) {
          const colorsMap = line.split(', ').map(item => item.trim());
          console.log(colors);
           colorsMap.forEach(color => {
             const [key, value] = color.split(': ').map(item => item.trim());
             colors[key] = value;
           });
          console.log(colors);
          // const [key, value] = line.split(':').map(part => part.trim());
          // console.log('key', key);
          // console.log('value', value);
          // if (key && value) {
            // colors[key] = value.replace(',', '');
          // }
        }
      }
      
      return {
        levelType,
        createdBy,
        personalLink,
        board,
        colors,
        size: board.length
      };
    } catch (error) {
      return null;
    }
  };

  const generateOutput = (parsed: ParsedLevel): string => {
    const colorNames = Object.values(parsed.colors).sort();
    const imports = colorNames.map(color => `  ${color}`).join(',\n');
    
    const path = '/community-level/';
    
    let creatorLink = parsed.personalLink;
    
    const colorRegions = parsed.board.map(row => 
      `    [${row.map(cell => `"${cell}"`).join(', ')}]`
    ).join(',\n');
    
    const regionColors = Object.entries(parsed.colors)
      .map(([key, value]) => `    ${key}: ${value}`)
      .join(',\n');

    return `import {
${imports},
} from "../colors";

const level = {
  path: "${path}",
  size: ${parsed.size},
  colorRegions: [
${colorRegions},
  ],
  regionColors: {
${regionColors},
  },
  solutionsCount: 1,
  createdBy: "${parsed.createdBy}",
  creatorLink: "${creatorLink}",
};

export default level;`;
  };

  const handleConvert = () => {
    const parsed = parseInput(input);
    if (parsed) {
      const result = generateOutput(parsed);
      setOutput(result);
    } else {
      setOutput('// Error: Could not parse input. Please check the format.');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  // Auto-convert when input changes
  React.useEffect(() => {
    if (input.trim()) {
      handleConvert();
    }
  }, [input]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Level Converter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Convert level submissions from text format to TypeScript code ready for your project
          </p>
        </div>

        {/* Main Interface */}
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <span>Input</span>
                </h2>
              </div>
              <div className="p-6">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste your level submission here..."
                  className="w-full h-96 font-mono text-sm border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200"
                />
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleClear}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Output Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <span>Output</span>
                  <ArrowRight className="w-5 h-5" />
                </h2>
              </div>
              <div className="p-6">
                <textarea
                  value={output}
                  readOnly
                  placeholder="TypeScript code will appear here..."
                  className="w-full h-96 font-mono text-sm bg-gray-50 border border-gray-300 rounded-lg p-4 resize-none"
                />
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleCopy}
                    disabled={!output}
                    className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How to use:</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Input Format</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Level Type: community/custom</li>
                  <li>• Created By: Creator name</li>
                  <li>• Personal Link: Social media link</li>
                  <li>• Board: Array format with letters</li>
                  <li>• Colors: Letter to color mapping</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Output Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Auto-sorted color imports</li>
                  <li>• Proper TypeScript formatting</li>
                  <li>• Ready to paste into your project</li>
                  <li>• Automatic URL formatting</li>
                  <li>• One-click copy to clipboard</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;