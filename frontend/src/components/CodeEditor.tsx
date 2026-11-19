import { useState, useRef, useEffect } from "react";
import type { TestCase, RunCodeResponse, TestCaseExecutionResult } from "../types";
import { handleSmartEditorKeyDown } from "../utils/editorIndentation";

export interface CodeEditorProps {
  initialCode?: string;
  initialLanguage?: string;
  allowedLanguages?: string[];
  sampleTestCases?: TestCase[];
  onCodeChange?: (code: string, language: string) => void;
  onRunCode?: (code: string, language: string, customInput?: string) => Promise<RunCodeResponse>;
  readOnly?: boolean;
}

const DEFAULT_C_TEMPLATE = `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    // Read input from stdin
    char buffer[1024];
    while (fgets(buffer, sizeof(buffer), stdin)) {
        // Process input and output solution
        printf("%s", buffer);
    }
    return 0;
}
`;

const DEFAULT_CPP_TEMPLATE = `#include <iostream>
#include <string>
#include <vector>

using namespace std;

int main() {
    // Read input from stdin
    string line;
    while (getline(cin, line)) {
        // Process input and output solution
        cout << line << endl;
    }
    return 0;
}
`;

const DEFAULT_PYTHON_TEMPLATE = `import sys

def solve():
    # Read input from stdin
    input_data = sys.stdin.read().strip()
    if not input_data:
        return
    
    # Process input and output solution
    print(input_data)

if __name__ == '__main__':
    solve()
`;

const DEFAULT_JAVA_TEMPLATE = `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        // Read input from stdin
        Scanner scanner = new Scanner(System.in);
        while (scanner.hasNextLine()) {
            String line = scanner.nextLine();
            // Process input and output solution
            System.out.println(line);
        }
        scanner.close();
    }
}
`;

const DEFAULT_JS_TEMPLATE = `const fs = require('fs');

function solve() {
    // Read input from stdin
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (!input) return;

    // Write your solution here
    console.log(input);
}

solve();
`;

function getTemplateForLanguage(lang: string): string {
  switch (lang.toLowerCase()) {
    case "c":
    case "gcc":
    case "clang":
      return DEFAULT_C_TEMPLATE;
    case "cpp":
    case "c++":
    case "g++":
      return DEFAULT_CPP_TEMPLATE;
    case "java":
      return DEFAULT_JAVA_TEMPLATE;
    case "javascript":
    case "js":
    case "node":
      return DEFAULT_JS_TEMPLATE;
    case "python":
    case "python3":
    case "py":
    default:
      return DEFAULT_PYTHON_TEMPLATE;
  }
}

function getFileNameForLanguage(lang: string): string {
  switch (lang.toLowerCase()) {
    case "c":
      return "main.c";
    case "cpp":
    case "c++":
      return "main.cpp";
    case "java":
      return "Solution.java";
    case "javascript":
    case "js":
      return "solution.js";
    case "python":
    default:
      return "solution.py";
  }
}

export default function CodeEditor({
  initialCode,
  initialLanguage = "python",
  allowedLanguages = ["c", "cpp", "python", "java", "javascript"],
  sampleTestCases = [],
  onCodeChange,
  onRunCode,
  readOnly = false,
}: CodeEditorProps) {
  // Normalize allowed languages
  const safeAllowed = allowedLanguages && allowedLanguages.length > 0 
    ? allowedLanguages 
    : ["c", "cpp", "python", "java", "javascript"];

  const computeValidLanguage = (langCandidate?: string) => {
    if (langCandidate && safeAllowed.includes(langCandidate)) {
      return langCandidate;
    }
    if (initialCode && initialCode.includes("#include <iostream>") && safeAllowed.includes("cpp")) {
      return "cpp";
    }
    if (initialCode && initialCode.includes("#include") && safeAllowed.includes("c")) {
      return "c";
    }
    if (initialCode && initialCode.includes("public class") && safeAllowed.includes("java")) {
      return "java";
    }
    return safeAllowed[0] || "python";
  };

  const [language, setLanguage] = useState(() => computeValidLanguage(initialLanguage));
  const [code, setCode] = useState(
    initialCode || getTemplateForLanguage(computeValidLanguage(initialLanguage))
  );

  // Font size configuration (Defaults to 15px for clarity)
  const [fontSize, setFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("proctor_editor_fontsize");
      return saved ? Math.min(22, Math.max(13, parseInt(saved, 10))) : 15;
    } catch {
      return 15;
    }
  });

  const changeFontSize = (delta: number) => {
    setFontSize((prev) => {
      const next = Math.min(22, Math.max(13, prev + delta));
      try {
        localStorage.setItem("proctor_editor_fontsize", String(next));
      } catch {}
      return next;
    });
  };

  // Bottom drawer state
  const [bottomTab, setBottomTab] = useState<"testcases" | "result">("testcases");
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);
  const [useCustomInput, setUseCustomInput] = useState(false);
  const [customInput, setCustomInput] = useState("");

  // Running state
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<RunCodeResponse | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialCode !== undefined && initialCode !== code) {
      setCode(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  useEffect(() => {
    const validLang = computeValidLanguage(initialLanguage);
    if (validLang !== language) {
      setLanguage(validLang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLanguage, safeAllowed.join(",")]);

  function handleLanguageChange(newLang: string) {
    setLanguage(newLang);
    const template = getTemplateForLanguage(newLang);
    const isDefault =
      !code ||
      code === DEFAULT_PYTHON_TEMPLATE ||
      code === DEFAULT_C_TEMPLATE ||
      code === DEFAULT_CPP_TEMPLATE ||
      code === DEFAULT_JAVA_TEMPLATE ||
      code === DEFAULT_JS_TEMPLATE;
    if (isDefault) {
      setCode(template);
      onCodeChange?.(template, newLang);
    } else {
      onCodeChange?.(code, newLang);
    }
  }

  function handleCodeInput(newCode: string) {
    setCode(newCode);
    onCodeChange?.(newCode, language);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "\\" || e.key === "|" || e.code === "Backslash") {
      return;
    }

    const isWindowsKey =
      (e.key === "Meta" ||
       e.key === "OS" ||
       e.metaKey ||
       e.code === "MetaLeft" ||
       e.code === "MetaRight" ||
       e.code === "OSLeft" ||
       e.code === "OSRight") &&
      e.key !== "\\" && e.key !== "|";

    const isCtrlKey =
      e.key === "Control" ||
      e.ctrlKey ||
      e.code === "ControlLeft" ||
      e.code === "ControlRight" ||
      e.keyCode === 17;

    const isAltKey =
      e.key === "Alt" ||
      e.altKey ||
      e.code === "AltLeft" ||
      e.code === "AltRight" ||
      e.keyCode === 18;

    const isFunctionKey =
      (typeof e.key === "string" && /^F([1-9]|1[0-2])$/i.test(e.key)) ||
      (typeof e.code === "string" && /^F([1-9]|1[0-2])$/i.test(e.code));

    const isEscapeKey =
      e.key === "Escape" ||
      e.key === "Esc" ||
      e.code === "Escape" ||
      e.keyCode === 27;

    if (isWindowsKey || isCtrlKey || isAltKey || isFunctionKey || isEscapeKey) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    const handled = handleSmartEditorKeyDown(e, {
      code,
      setCode,
      textarea: textareaRef.current,
      onCodeChange: (newC) => onCodeChange?.(newC, language),
      indentSize: 4,
    });

    if (handled) {
      return;
    }
  }

  function handleConfirmReset() {
    const template = getTemplateForLanguage(language);
    setCode(template);
    onCodeChange?.(template, language);
    setShowResetConfirm(false);
  }

  function handleCopy() {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleRun() {
    if (!onRunCode || running) return;
    setRunning(true);
    setRunError(null);
    setBottomTab("result");

    try {
      const res = await onRunCode(code, language, useCustomInput ? customInput : undefined);
      setRunResult(res);
    } catch (err) {
      setRunError(err instanceof Error ? err.message : "Execution failed.");
    } finally {
      setRunning(false);
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const lineCount = code.split("\n").length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1);

  // Synchronized line-height computation based on font-size
  const lineHeightPx = Math.round(fontSize * 1.6);

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border border-[#30363d] rounded-xl overflow-hidden shadow-2xl text-slate-100 font-sans">
      {/* Top IDE macOS Titlebar & Tabs */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#161b22] border-b border-[#30363d] select-none flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {/* macOS window control dots */}
          <div className="flex items-center gap-1.5 px-1">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-xs opacity-90" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-xs opacity-90" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-xs opacity-90" />
          </div>

          {/* Active File Tab */}
          <div className="flex items-center gap-2 bg-[#0d1117] border border-[#30363d] border-b-transparent px-3 py-1 rounded-t-md text-xs font-mono font-semibold text-sky-300 shadow-xs">
            <span className="text-emerald-400">⚡</span>
            <span>{getFileNameForLanguage(language)}</span>
            {readOnly && (
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-sans">
                Locked
              </span>
            )}
          </div>

          <div className="h-4 w-px bg-slate-700/80 mx-1 hidden sm:block" />

          {/* Language Selector Pill */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium">Lang:</span>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={readOnly}
              className="bg-[#21262d] hover:bg-[#30363d] text-slate-200 border border-[#30363d] text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer transition-colors"
            >
              {safeAllowed.includes("c") && <option value="c">C (GCC 11+)</option>}
              {safeAllowed.includes("cpp") && <option value="cpp">C++ (G++ 11+)</option>}
              {safeAllowed.includes("java") && <option value="java">Java 21 (OpenJDK)</option>}
              {safeAllowed.includes("python") && <option value="python">Python 3.12</option>}
              {safeAllowed.includes("javascript") && <option value="javascript">JavaScript (Node.js)</option>}
            </select>
          </div>
        </div>

        {/* Right Action Tools: Font size changer, Copy, Reset, Run Code */}
        <div className="flex items-center gap-2">
          {/* Font Size Adjuster (A- / A+) */}
          <div className="flex items-center bg-[#21262d] border border-[#30363d] rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => changeFontSize(-1)}
              title="Decrease Editor Font Size"
              className="px-2 py-0.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition cursor-pointer font-bold"
            >
              A-
            </button>
            <span className="px-1.5 text-[11px] font-mono text-sky-400 font-bold select-none">
              {fontSize}px
            </span>
            <button
              type="button"
              onClick={() => changeFontSize(1)}
              title="Increase Editor Font Size"
              className="px-2 py-0.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition cursor-pointer font-bold"
            >
              A+
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] transition cursor-pointer font-medium"
            title="Copy code to clipboard"
          >
            {copied ? "✓ Copied" : "📋 Copy"}
          </button>

          {!readOnly && (
            showResetConfirm ? (
              <div className="flex items-center gap-1.5 bg-amber-950/90 border border-amber-600/70 rounded-lg px-2 py-0.5 text-xs animate-in fade-in duration-150">
                <span className="text-amber-300 font-semibold text-[11px]">Reset to starter?</span>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-2 py-0.5 rounded text-[11px] cursor-pointer transition shadow-sm"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-[11px] cursor-pointer transition"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                title="Reset code to starter template"
                className="text-xs text-slate-300 hover:text-slate-100 hover:bg-[#30363d] px-2.5 py-1 rounded-md border border-[#30363d] transition-colors cursor-pointer"
              >
                ↺ Reset
              </button>
            )
          )}

          {onRunCode && (
            <button
              type="button"
              onClick={handleRun}
              disabled={running || readOnly}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-md transition-all cursor-pointer"
            >
              {running ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <span>▶</span>
                  <span>Run Code</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Code Editor Body with Synchronized Gutter and Increased Legible Font Size */}
      <div className="relative flex-1 flex overflow-hidden min-h-[320px]">
        {/* Line Numbers Gutter */}
        <div 
          ref={gutterRef}
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: `${lineHeightPx}px`,
          }}
          className="w-14 py-3 bg-[#0d1117] border-r border-[#30363d] text-right pr-3 select-none text-slate-500 font-mono overflow-hidden shrink-0"
        >
          {lineNumbers.map((num) => (
            <div key={num}>{num}</div>
          ))}
        </div>

        {/* Textarea Code Input */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => handleCodeInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          onPaste={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
          readOnly={readOnly}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: `${lineHeightPx}px`,
          }}
          className="flex-1 p-3 bg-[#0d1117] text-slate-100 font-mono resize-none focus:outline-none overflow-auto selection:bg-blue-600/50 selection:text-white tab-size-4"
          placeholder="// Write your clean solution function here..."
        />
      </div>

      {/* Editor Status Bar */}
      <div className="bg-[#161b22] border-t border-[#30363d] px-3 py-1 flex items-center justify-between text-[11px] text-slate-400 select-none flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 font-medium flex items-center gap-1">
            <span>⚡</span> Smart Indent: Tab (4 spaces) • Enter auto-indents
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-slate-400 font-mono hidden sm:inline">
            UTF-8
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-[#21262d] text-amber-300 font-mono text-[10px]" title="Exam security lock">
            🔒 Exam Lock: Shortcuts Disabled
          </span>
          <span className="font-mono text-slate-300 text-[11px]">
            {lineCount} lines • {code.length} chars
          </span>
        </div>
      </div>

      {/* Bottom Panel: Testcases & Execution Results */}
      <div className="border-t border-[#30363d] bg-[#161b22] flex flex-col min-h-[230px] max-h-[380px]">
        {/* Bottom Drawer Tabs */}
        <div className="flex items-center justify-between px-3 border-b border-[#30363d] bg-[#0d1117]">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setBottomTab("testcases")}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                bottomTab === "testcases"
                  ? "border-emerald-500 text-emerald-400 bg-[#161b22]"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Testcases ({sampleTestCases.length})
            </button>
            <button
              type="button"
              onClick={() => setBottomTab("result")}
              className={`px-3 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                bottomTab === "result"
                  ? "border-emerald-500 text-emerald-400 bg-[#161b22]"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Execution Result</span>
              {runResult && (
                <span
                  className={`w-2 h-2 rounded-full ${
                    runResult.status === "ACCEPTED" ? "bg-emerald-400" : "bg-rose-400"
                  }`}
                />
              )}
            </button>
          </div>

          {bottomTab === "testcases" && (
            <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useCustomInput}
                onChange={(e) => setUseCustomInput(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-0 w-3.5 h-3.5"
              />
              <span>Custom Stdin Input</span>
            </label>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-3 pb-10 overflow-y-auto text-xs flex-1 bg-[#0d1117]">
          {bottomTab === "testcases" && (
            <div>
              {useCustomInput ? (
                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-1">Standard Input (stdin):</div>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    rows={4}
                    placeholder="Enter custom input to feed to stdin..."
                    className="w-full bg-[#161b22] border border-[#30363d] rounded-lg p-2.5 text-sm font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                  />
                </div>
              ) : sampleTestCases.length > 0 ? (
                <div>
                  {/* Case Pills */}
                  <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
                    {sampleTestCases.map((_tc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveCaseIdx(idx)}
                        className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                          activeCaseIdx === idx
                            ? "bg-[#21262d] text-emerald-400 border border-emerald-500/50 shadow-xs"
                            : "bg-[#161b22] text-slate-400 hover:bg-[#21262d] hover:text-slate-300 border border-[#30363d]"
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>

                  {/* Active Case Details */}
                  {sampleTestCases[activeCaseIdx] && (
                    <div className="space-y-3 font-mono pb-6">
                      <div>
                        <div className="text-xs font-sans font-semibold text-slate-400 mb-1">Input:</div>
                        <pre className="bg-[#161b22] border border-[#30363d] rounded-md p-2.5 text-sm text-slate-200 overflow-x-auto whitespace-pre-wrap">
                          {sampleTestCases[activeCaseIdx].input || "(empty)"}
                        </pre>
                      </div>
                      <div>
                        <div className="text-xs font-sans font-semibold text-slate-400 mb-1">Expected Output:</div>
                        <pre className="bg-[#161b22] border border-[#30363d] rounded-md p-2.5 text-sm text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                          {sampleTestCases[activeCaseIdx].expectedOutput || "(empty)"}
                        </pre>
                      </div>
                      {sampleTestCases[activeCaseIdx].explanation && (
                        <div>
                          <div className="text-xs font-sans font-semibold text-slate-400 mb-1">Explanation:</div>
                          <p className="text-xs font-sans text-slate-300 bg-[#161b22]/70 border border-[#30363d] rounded-md p-2.5">
                            {sampleTestCases[activeCaseIdx].explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 text-xs italic py-2">No sample test cases configured for this question.</p>
              )}
            </div>
          )}

          {bottomTab === "result" && (
            <div>
              {running ? (
                <div className="flex items-center justify-center py-8 gap-3 text-slate-400 text-sm">
                  <span className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span>Compiling &amp; executing code against test cases in cloud sandbox...</span>
                </div>
              ) : runError ? (
                <div className="bg-rose-950/40 border border-rose-800/80 rounded-lg p-3 text-rose-300">
                  <div className="font-bold flex items-center gap-1.5 mb-1 text-sm">
                    <span>⚠️</span> Execution Failed
                  </div>
                  <pre className="text-xs whitespace-pre-wrap font-mono">{runError}</pre>
                </div>
              ) : runResult ? (
                <div className="space-y-3 font-mono pb-6">
                  {/* Status header banner */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#30363d]">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold px-3 py-1 rounded-md font-sans ${
                          runResult.status === "ACCEPTED"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : runResult.status === "WRONG_ANSWER"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        }`}
                      >
                        {runResult.status === "ACCEPTED"
                          ? "✓ Accepted"
                          : runResult.status === "WRONG_ANSWER"
                          ? "✗ Wrong Answer"
                          : runResult.status}
                      </span>
                      <span className="text-xs text-slate-300 font-sans">
                        ({runResult.passedCases}/{runResult.totalCases} test cases passed)
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      Runtime: {runResult.executionTimeMs} ms
                    </span>
                  </div>

                  {/* Results per test case */}
                  <div className="space-y-2.5">
                    {runResult.results.map((res: TestCaseExecutionResult, idx: number) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border ${
                          res.passed
                            ? "bg-[#161b22] border-emerald-900/50"
                            : "bg-[#161b22] border-rose-900/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-sans font-bold text-xs flex items-center gap-1.5">
                            <span className={res.passed ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                              {res.passed ? "✓ Passed" : "✗ Failed"}
                            </span>
                            Case {res.testCaseIndex}
                          </span>
                          <span className="text-xs text-slate-400">{res.executionTimeMs} ms</span>
                        </div>

                        {res.errorMessage && (
                          <div className="mb-2 p-2.5 bg-rose-950/60 border border-rose-800/60 rounded text-rose-200 text-xs whitespace-pre-wrap">
                            {res.errorMessage}
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <div className="text-slate-400 mb-0.5">Input:</div>
                            <pre className="bg-[#0d1117] p-2 rounded border border-[#30363d] text-slate-200 overflow-x-auto whitespace-pre-wrap font-mono">
                              {res.input || "(empty)"}
                            </pre>
                          </div>
                          <div>
                            <div className="text-slate-400 mb-0.5">Expected:</div>
                            <pre className="bg-[#0d1117] p-2 rounded border border-[#30363d] text-emerald-300 overflow-x-auto whitespace-pre-wrap font-mono">
                              {res.expectedOutput || "(empty)"}
                            </pre>
                          </div>
                          <div className="sm:col-span-2">
                            <div className="text-slate-400 mb-0.5">Actual Output:</div>
                            <pre
                              className={`p-2 rounded border overflow-x-auto whitespace-pre-wrap font-mono ${
                                res.passed
                                  ? "bg-[#0d1117] border-[#30363d] text-emerald-300"
                                  : "bg-rose-950/30 border-rose-800/60 text-rose-300"
                              }`}
                            >
                              {res.actualOutput || "(no output)"}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-xs italic py-3 text-center">
                  Click <strong className="text-emerald-400 font-semibold">▶ Run Code</strong> to execute your solution against test cases.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
