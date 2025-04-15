'use client';

import {useState, useCallback} from 'react';
import dynamic from 'next/dynamic';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Textarea} from '@/components/ui/textarea';

const CodeEditor = dynamic(() => import('@/components/code-editor'), {
  ssr: false,
});

declare global {
  interface Window {
    [key: string]: any; // Allow access to dynamically created function names
  }
}

export default function Home() {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [functionNames, setFunctionNames] = useState<string[]>([]);

  const handleCodeChange = useCallback((value: string) => {
    setCode(value);
  }, []);

  const handleRunCode = async () => {
    try {
      // Create a local scope for execution
      const localScope = { setOutput: (data: any[]) => setOutput(data) };
      // Create a function with the provided code and the local scope
      const executeCode = new Function('localScope', `with (localScope) { ${code} }`);
      // Execute the code within the local scope
      executeCode(localScope);
      setFunctionNames(Array.from({ length: output.length }, (_, i) => `Output ${i + 1}`)); // Display a default name
    } catch (e: any) {
      setOutput([`Error: ${e.message}`]);
      setFunctionNames(['Error']);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-1 flex flex-row">
        {/* Code Editor Section */}
        <div className="w-1/2 p-4">
          <Card className="h-full bg-[var(--code-editor-background)] text-[var(--code-editor-text)] font-[var(--code-editor-font)] shadow-md">
            <CardHeader>
              <CardTitle className="text-black">Code Editor</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-[calc(100%-80px)]">
              <CodeEditor value={code} onChange={handleCodeChange} />
              <div className="flex justify-between mt-4">
                <Button onClick={handleRunCode} className="bg-primary text-primary-foreground hover:bg-primary/80">
                  Run Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output Display Section */}
        <div className="w-1/2 p-4">
          <Card className="h-full shadow-md">
            <CardHeader>
              <CardTitle>Output Information</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-[calc(100%-80px)] overflow-auto">
              {output.map((out, index) => (
                <div key={index} className="mb-4">
                  <h3 className="font-semibold">Output {index + 1}</h3>
                  <Textarea
                    readOnly
                    value={out || 'No output'}
                    className="bg-muted text-muted-foreground rounded-md border border-input px-3 py-2 w-full resize-none"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

