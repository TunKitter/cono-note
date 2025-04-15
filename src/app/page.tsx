'use client';

import {useState, useCallback} from 'react';
import dynamic from 'next/dynamic';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Textarea} from '@/components/ui/textarea';
import {useToast} from '@/hooks/use-toast';
import {generateCodeFromDescription} from '@/ai/flows/generate-code-from-description';
import {suggestImprovements} from '@/ai/flows/suggest-improvements';
import {Icons} from '@/components/icons';

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
  const {toast} = useToast();

  const handleCodeChange = useCallback((value: string) => {
    setCode(value);
  }, []);

  const extractFunctions = (code: string) => {
    const functionRegex = /function\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)\s*\{([\s\S]*?)\}/g;
    let match;
    const functions: {name: string; body: string; params: string[]}[] = [];
    const names: string[] = [];

    while ((match = functionRegex.exec(code)) !== null) {
      const name = match[1];
      const params = match[2].split(',').map(p => p.trim());
      const body = match[3].trim();
      functions.push({name, params, body});
      names.push(name);
    }
    return {functions, names};
  };

  const handleRunCode = async () => {
    try {
      const {functions, names} = extractFunctions(code);
      setFunctionNames(names);
      const results: string[] = [];

      // Create a global scope for the functions
      const globalScope: {[key: string]: any} = {};
      (window as any).globalScope = globalScope;

      // First, define all functions in the global scope
      functions.forEach(func => {
        try {
          // eslint-disable-next-line no-new-func
          const fn = new Function(...func.params, func.body);
          (window as any)[func.name] = fn; // Attach function to window
          globalScope[func.name] = fn;
        } catch (e: any) {
          results.push(`Error defining ${func.name}: ${e.message}`);
        }
      });

      // Then, execute each function and store the results
      functions.forEach(func => {
        try {
          const fn = (window as any)[func.name]; // Retrieve the function from window
          if (typeof fn === 'function') {
            const result = fn();
            results.push(String(result));
          } else {
            results.push(`Error: ${func.name} is not a function`);
          }
        } catch (e: any) {
          results.push(`Error executing ${func.name}: ${e.message}`);
        }
      });

      setOutput(results);
    } catch (e: any) {
      setOutput([`Error: ${e.message}`]);
    }
  };

  const handleGenerateCode = async (description: string) => {
    try {
      const result = await generateCodeFromDescription({description});
      setCode(result.code);
      toast({
        title: 'Code Generated',
        description: 'Code has been generated from the description.',
      });
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Error generating code',
        description: e.message,
      });
    }
  };

  const handleSuggestImprovementsClick = async () => {
    try {
      const result = await suggestImprovements({code});
      setCode(result.improvedCode);
      toast({
        title: 'Code Improved',
        description: 'Code has been improved by the AI assistant.',
      });
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Error improving code',
        description: e.message,
      });
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
                <Button onClick={handleSuggestImprovementsClick} className="bg-accent text-accent-foreground hover:bg-accent/80">
                  Improve Code
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
              {functionNames.map((name, index) => (
                <div key={index} className="mb-4">
                  <h3 className="font-semibold">Function: {name}</h3>
                  <Textarea
                    readOnly
                    value={output[index] || 'No output'}
                    className="bg-muted text-muted-foreground rounded-md border border-input px-3 py-2 w-full resize-none"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Code Generation Section */}
      <div className="p-4">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Generate Code from Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <Textarea
                placeholder="Enter a description for the code you want to generate..."
                className="bg-background text-foreground rounded-md border border-input px-3 py-2 w-full resize-none"
                onKeyDown={async e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    await handleGenerateCode((e.target as HTMLTextAreaElement).value);
                  }
                }}
              />
              <Button onClick={async e => {
                const textarea = e.target?.parentElement?.querySelector('textarea');
                if (textarea) {
                  await handleGenerateCode(textarea.value);
                }
              }} className="bg-primary text-primary-foreground hover:bg-primary/80">Generate Code</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
