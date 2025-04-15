'use client';

import React, {useEffect, useRef} from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-error_marker';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({value, onChange}) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      // @ts-expect-error - editor does exist, the types are wrong
      editorRef.current.editor.session.setMode('ace/mode/javascript');
    }
  }, []);

  return (
    <AceEditor
      mode="javascript"
      theme="monokai"
      name="code-editor"
      width="100%"
      height="100%"
      fontSize={14}
      showPrintMargin={false}
      showGutter={true}
      highlightActiveLine={true}
      value={value}
      onChange={onChange}
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: false,
        showLineNumbers: true,
        tabSize: 2,
      }}
      ref={editorRef}
      style={{
        fontFamily: 'var(--code-editor-font)',
        backgroundColor: '#505155',
        color: 'var(--code-editor-text)',
      }}
    />
  );
};

export default CodeEditor;
