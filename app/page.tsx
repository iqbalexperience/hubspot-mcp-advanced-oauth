"use client";

import { useState } from "react";

interface LogEntry {
  id: string;
  text: string;
}

export default function Home() {
  // Playground state
  const [sides, setSides] = useState<number>(6);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [toolResult, setToolResult] = useState<{
    content: { type: string; text: string }[];
  } | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: "init-1", text: "ℹ️ Server listening on port 3000" },
    { id: "init-2", text: "ℹ️ MCP Handler initialized for transport: sse" },
  ]);

  // Active configuration tab: "sse" or "stdio"
  const [configTab, setConfigTab] = useState<"sse" | "stdio">("sse");

  // Copy state
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const triggerCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleRollDice = () => {
    setIsRunning(true);
    setToolResult(null);

    const requestId = Math.random().toString(36).substring(7);
    const newLog: LogEntry = {
      id: `req-${requestId}`,
      text: `➡️ POST /mcp - executing tool "roll_dice" with input { sides: ${sides} }`,
    };
    setLogs((prev) => [...prev, newLog]);

    setTimeout(() => {
      const rolledValue = 1 + Math.floor(Math.random() * sides);
      const result = {
        content: [{ type: "text", text: `🎲 You rolled a ${rolledValue}!` }],
      };

      const responseId = Math.random().toString(36).substring(7);
      const resLog: LogEntry = {
        id: `res-${responseId}`,
        text: `⬅️ 200 OK - execution completed successfully`,
      };
      setLogs((prev) => [...prev, resLog]);
      setToolResult(result);
      setIsRunning(false);
    }, 800);
  };

  const sseConfig = `{
  "mcpServers": {
    "nextjs-mcp-starter": {
      "command": "node",
      "args": [],
      "env": {},
      "url": "http://localhost:3000/sse"
    }
  }
}`;

  const stdioConfig = `{
  "mcpServers": {
    "nextjs-mcp-starter-stdio": {
      "command": "npx",
      "args": ["-y", "nextjs-mcp-starter"],
      "env": {}
    }
  }
}`;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-purple-500/30 selection:text-purple-200 antialiased relative overflow-hidden font-sans pb-16">
      {/* Abstract Glowing Backgrounds */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[450px] h-[450px] bg-fuchsia-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <title>Next.js MCP Starter Logo</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <div>
              <span className="font-semibold tracking-tight text-white">
                Next.js MCP
              </span>
              <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded ml-2 border border-zinc-700">
                v0.1.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Server Online
            </div>
            <a
              href="https://github.com/vercel/mcp-handler"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Docs
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Left column: Introduction and Sandbox */}
        <section className="lg:col-span-7 flex flex-col gap-8">
          {/* Hero Content */}
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Model Context Protocol <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Starter for Next.js
              </span>
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-xl">
              Build, run, and host production-grade Model Context Protocol (MCP)
              servers using standard Next.js route handlers. Integrate secure
              local tools and data endpoints with LLM clients seamlessly.
            </p>
          </div>

          {/* Connected Transport Flow Visualizer */}
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-6">
            <h3 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase mb-4 font-sans">
              MCP Flow Diagram
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 bg-zinc-950/60 rounded-xl border border-zinc-900">
              <div className="flex flex-col items-center p-3 bg-zinc-900 rounded-lg border border-zinc-800 w-full sm:w-auto text-center">
                <span className="text-xs font-semibold text-zinc-400">
                  AI Client
                </span>
                <span className="text-sm font-medium text-white mt-1">
                  Claude Desktop
                </span>
              </div>
              <div className="flex flex-col items-center text-indigo-400 text-xs font-mono select-none">
                <span>[SSE / POST]</span>
                <svg
                  className="w-16 h-4 text-indigo-500 animate-pulse hidden sm:block"
                  fill="none"
                  viewBox="0 0 64 16"
                >
                  <title>Connect Right Arrow</title>
                  <path
                    d="M0 8h60m-6-4l6 4-6 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <svg
                  className="w-4 h-8 text-indigo-500 animate-pulse block sm:hidden"
                  fill="none"
                  viewBox="0 0 16 32"
                >
                  <title>Connect Down Arrow</title>
                  <path
                    d="M8 0v28m-4-4l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span>/mcp</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20 w-full sm:w-auto text-center">
                <span className="text-xs font-semibold text-indigo-300">
                  mcp-handler
                </span>
                <span className="text-sm font-medium text-indigo-100 mt-1">
                  Next.js Endpoint
                </span>
              </div>
              <div className="flex flex-col items-center text-pink-400 text-xs font-mono select-none">
                <span>Runs Tool</span>
                <svg
                  className="w-16 h-4 text-pink-500 animate-pulse hidden sm:block"
                  fill="none"
                  viewBox="0 0 64 16"
                >
                  <title>Execution Right Arrow</title>
                  <path
                    d="M0 8h60m-6-4l6 4-6 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <svg
                  className="w-4 h-8 text-pink-500 animate-pulse block sm:hidden"
                  fill="none"
                  viewBox="0 0 16 32"
                >
                  <title>Execution Down Arrow</title>
                  <path
                    d="M8 0v28m-4-4l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span>Execution</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-pink-500/10 rounded-lg border border-pink-500/20 w-full sm:w-auto text-center">
                <span className="text-xs font-semibold text-pink-300">
                  Tool
                </span>
                <span className="text-sm font-medium text-pink-100 mt-1">
                  roll_dice
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Tool Playground */}
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-6 relative">
            <div className="absolute top-6 right-6 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                Playground
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              Tool Sandbox Simulator
            </h2>
            <p className="text-sm text-zinc-400 mb-6">
              Simulate calls to your registered tools in real-time. Try rolling
              a custom-sided dice below to see how the Next.js MCP server
              executes it.
            </p>

            <div className="flex flex-col gap-6">
              {/* Tool Config Form */}
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-900">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-white">
                    Tool:{" "}
                    <code className="text-pink-400 font-mono">roll_dice</code>
                  </span>
                  <span className="text-xs text-zinc-500">
                    defined in route.ts
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-xs font-medium text-zinc-400 flex justify-between">
                    <span>Number of sides (z.number().int().min(2))</span>
                    <span className="text-white font-mono">{sides} sides</span>
                  </span>
                  <input
                    id="dice-sides"
                    type="range"
                    min="2"
                    max="100"
                    value={sides}
                    onChange={(e) => setSides(Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-600 font-mono mt-0.5">
                    <span>2 Sides</span>
                    <span>20 Sides</span>
                    <span>50 Sides</span>
                    <span>100 Sides</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRollDice}
                  disabled={isRunning}
                  className="w-full mt-5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg hover:shadow-purple-500/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {isRunning ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <title>Executing Tool Spinner</title>
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Running tool...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <title>Run Icon</title>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Execute Roll Dice
                    </>
                  )}
                </button>
              </div>

              {/* Console & Results Output */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Simulated Server Logs */}
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Live Server Log
                  </span>
                  <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-900 h-44 overflow-y-auto font-mono text-[11px] text-zinc-300 flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-zinc-800">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="leading-relaxed whitespace-pre-wrap border-l-2 border-purple-500/30 pl-2"
                      >
                        {log.text}
                      </div>
                    ))}
                    {isRunning && (
                      <div className="text-purple-400 animate-pulse pl-2 border-l-2 border-purple-500">
                        ⏳ executing...
                      </div>
                    )}
                  </div>
                </div>

                {/* Tool Response */}
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Execution Response
                  </span>
                  <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-900 h-44 overflow-y-auto font-mono text-[11px] text-emerald-400 flex flex-col scrollbar-thin scrollbar-thumb-zinc-800">
                    {toolResult ? (
                      <pre className="whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(toolResult, null, 2)}
                      </pre>
                    ) : (
                      <div className="m-auto text-center text-zinc-600 px-4 text-xs font-sans">
                        Execute the tool to inspect the structured response
                        payload.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right column: Config files & route information */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          {/* Quick Info Card */}
          <div className="bg-gradient-to-br from-indigo-950/20 via-purple-950/10 to-zinc-900/50 backdrop-blur-sm border border-indigo-900/20 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              Server Route Info
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed mb-4">
              Your server logic is fully defined in the dynamic Next.js route:
            </p>
            <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-900 flex items-center justify-between mb-4">
              <code className="text-xs text-pink-300 font-mono break-all select-all">
                app/[transport]/route.ts
              </code>
              <a
                href="/mcp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 shrink-0 ml-2"
              >
                Open Route
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <title>External Link</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
            <p className="text-xs text-zinc-400">
              The dynamic <code className="text-zinc-300">[transport]</code>{" "}
              route resolves various client communication interfaces natively,
              like SSE and Stdio, accessible directly via{" "}
              <code className="text-zinc-300">/mcp</code> or{" "}
              <code className="text-zinc-300">/sse</code>.
            </p>
          </div>

          {/* Client Setup Guide & Tabs */}
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/80 rounded-2xl overflow-hidden">
            {/* Header and tab buttons */}
            <div className="p-5 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white mb-3">
                Claude Desktop Integration
              </h3>
              <div className="flex gap-2 p-1 bg-zinc-950 rounded-lg border border-zinc-900">
                <button
                  type="button"
                  onClick={() => setConfigTab("sse")}
                  className={`flex-1 text-center py-1.5 px-3 rounded-md text-xs font-semibold tracking-wide transition-all ${configTab === "sse"
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                    }`}
                >
                  SSE (Remote/Web)
                </button>
                <button
                  type="button"
                  onClick={() => setConfigTab("stdio")}
                  className={`flex-1 text-center py-1.5 px-3 rounded-md text-xs font-semibold tracking-wide transition-all ${configTab === "stdio"
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                    }`}
                >
                  Stdio (Local/CLI)
                </button>
              </div>
            </div>

            {/* Config Box */}
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>
                  Save to:{" "}
                  <code className="text-zinc-200 font-mono text-[10px]">
                    claude_desktop_config.json
                  </code>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    triggerCopy(
                      configTab === "sse" ? sseConfig : stdioConfig,
                      configTab,
                    )
                  }
                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded border border-zinc-700 flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <title>Copy Status Icon</title>
                    {copiedType === configTab ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    )}
                  </svg>
                  {copiedType === configTab ? "Copied" : "Copy"}
                </button>
              </div>

              <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-900 relative">
                <pre className="text-xs text-indigo-300 font-mono overflow-x-auto leading-relaxed select-all">
                  {configTab === "sse" ? sseConfig : stdioConfig}
                </pre>
              </div>

              {configTab === "sse" ? (
                <div className="text-xs text-zinc-400 space-y-2 leading-relaxed">
                  <p>
                    <strong className="text-zinc-200">How SSE works:</strong>{" "}
                    Server-Sent Events allow Claude Desktop to communicate with
                    your local Next.js server over standard HTTP.
                  </p>
                  <p>
                    1. Keep the Next.js development server running locally using{" "}
                    <code className="bg-zinc-900 px-1 py-0.5 rounded text-zinc-300">
                      npm run dev
                    </code>
                    .
                  </p>
                  <p>
                    2. Claude Desktop will connect to{" "}
                    <code className="text-zinc-300">/sse</code>, establishing a
                    streaming channel.
                  </p>
                </div>
              ) : (
                <div className="text-xs text-zinc-400 space-y-2 leading-relaxed">
                  <p>
                    <strong className="text-zinc-200">How Stdio works:</strong>{" "}
                    Claude runs your server as a local background process and
                    communicates through standard input/output.
                  </p>
                  <p>
                    Ensure your CLI command package is fully linked or compiled
                    for local execution so that Claude can trigger it
                    automatically.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick-Start Steps */}
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4">
              Adding New Tools
            </h3>

            <div className="flex flex-col gap-4">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Add your custom tools inside{" "}
                <code className="text-zinc-200 bg-zinc-950 px-1.5 py-0.5 rounded font-mono">
                  app/[transport]/route.ts
                </code>{" "}
                by registering them onto the server instance.
              </p>

              <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-900">
                <pre className="text-[11px] text-zinc-300 font-mono overflow-x-auto leading-relaxed">
                  {`server.registerTool(
  "calculate_bmi",
  {
    title: "Calculate BMI",
    description: "Calculate body mass index.",
    inputSchema: {
      weightKg: z.number(),
      heightM: z.number(),
    },
  },
  async ({ weightKg, heightM }) => {
    const bmi = weightKg / (heightM * heightM);
    return {
      content: [{ 
        type: "text", 
        text: \`Your BMI is \${bmi.toFixed(1)}\` 
      }],
    };
  }
);`}
                </pre>
              </div>

              <div className="flex gap-2.5 items-start mt-1">
                <div className="w-5 h-5 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-purple-400">
                    i
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400 leading-normal">
                  The input schema is validated automatically using{" "}
                  <strong className="text-zinc-300">Zod</strong> before invoking
                  the execution handler. Errors are caught and returned to the
                  MCP client properly.
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-zinc-900 text-center text-xs text-zinc-500">
        <p>
          © 2026 Next.js MCP Starter Template. Engineered for fast agentic
          capabilities.
        </p>
      </footer>
    </div>
  );
}
