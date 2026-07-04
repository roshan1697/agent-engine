import { useState } from 'react';
import { useFlowStore } from '../store/useFlowStore';

export function Toolbar() {
  const addNode = useFlowStore((s) => s.addNode);
  const submit = useFlowStore((s) => s.submit);
  const [lastSubmission, setLastSubmission] = useState<string | null>(null);

  const handleSubmit = () => {
    const data = submit();
    console.log('Flow submitted:', data);
    setLastSubmission(JSON.stringify(data, null, 2));
  };

  return (
    <>
      {/* Submit button — top left corner of the view */}
      <div className="absolute left-4 top-4 z-10">
        <button
          onClick={handleSubmit}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition-colors"
        >
          Submit
        </button>
      </div>

      <div className="absolute right-4 top-4 z-10">
        <button
          onClick={addNode}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow hover:bg-slate-50 transition-colors"
        >
          + Add Node
        </button>
      </div>

      {lastSubmission && (
        <div className="absolute left-4 top-16 z-10 max-h-64 max-w-sm overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100 shadow-lg">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-semibold text-slate-300">Submitted payload</span>
            <button
              onClick={() => setLastSubmission(null)}
              className="text-slate-400 hover:text-white"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
          <pre className="whitespace-pre-wrap break-all">{lastSubmission}</pre>
        </div>
      )}
    </>
  );
}
