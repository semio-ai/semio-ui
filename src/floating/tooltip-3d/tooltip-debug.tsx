import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { useTooltipStore, type CoordinateDebugInfo } from "./store";
import { useTooltipHost } from "./tooltip-context";

interface TooltipDebugProps {
  className?: string;
  maxHistoryEntries?: number;
  showVisualIndicators?: boolean;
}

/**
 * Debug overlay component for the tooltip system.
 * Shows coordinate transformation data and visual indicators for tooltip positions.
 * Only renders when debug mode is enabled.
 */
export function TooltipDebug({
  className,
  maxHistoryEntries = 10,
  showVisualIndicators = true,
}: TooltipDebugProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedAnchorId, setSelectedAnchorId] = useState<string | null>(null);
  const [internalShowVisualIndicators, setInternalShowVisualIndicators] = useState(
    showVisualIndicators ?? true,
  );

  const {
    debugMode,
    debugHistory,
    enableDebugMode,
    getDebugHistory,
    clearDebugHistory,
    getVisibleTooltips,
    positions,
  } = useTooltipStore();

  const tooltipHost = useTooltipHost();

  // Auto-expand when debug mode is first enabled
  useEffect(() => {
    if (debugMode && !isExpanded) {
      setIsExpanded(true);
    }
  }, [debugMode, isExpanded]);

  const visibleTooltips = getVisibleTooltips();
  const recentHistory = debugHistory.slice(-maxHistoryEntries);
  const filteredHistory = selectedAnchorId
    ? getDebugHistory(selectedAnchorId).slice(-maxHistoryEntries)
    : recentHistory;

  const effectiveShowVisualIndicators = showVisualIndicators ?? internalShowVisualIndicators;

  if (!debugMode) {
    return (
      <div className={clsx("fixed top-4 right-4 z-[9999]", className)}>
        <button
          type="button"
          onClick={() => enableDebugMode(true)}
          className="px-3 py-2 bg-blue-600 text-white text-xs rounded shadow-lg hover:bg-blue-700"
          title="Enable tooltip debug mode"
        >
          🎯 Debug Tooltips
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Visual indicators for tooltip positions */}
      {effectiveShowVisualIndicators && tooltipHost?.containerRef.current && (
        <div
          className="absolute inset-0 pointer-events-none z-[9998]"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          {Array.from(positions.entries()).map(([anchorId, position]) => (
            <div
              key={anchorId}
              className="absolute border-2 border-red-500 bg-red-500/20"
              style={{
                left: position.x - (position.width || 0) / 2,
                top: position.y - (position.height || 0) / 2,
                width: position.width || 4,
                height: position.height || 4,
                transform: position.width ? "none" : "translate(-50%, -50%)",
              }}
              title={`Anchor: ${anchorId}`}
            >
              <div className="absolute -top-5 left-0 text-xs text-red-600 font-mono whitespace-nowrap">
                {anchorId}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Debug panel */}
      <div className={clsx("fixed top-4 right-4 z-[9999] max-w-md", className)}>
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">🎯 Tooltip Debug</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                {visibleTooltips.length} visible
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                <span className="text-xs">{isExpanded ? "−" : "+"}</span>
              </button>
              <button
                type="button"
                onClick={() => enableDebugMode(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Disable debug mode"
              >
                <span className="text-xs">×</span>
              </button>
            </div>
          </div>

          {/* Content */}
          {isExpanded && (
            <div className="p-3 max-h-96 overflow-y-auto">
              {/* Controls */}
              <div className="mb-3 space-y-2">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="anchor-filter"
                    className="text-xs text-gray-600 dark:text-gray-400"
                  >
                    Filter:
                  </label>
                  <select
                    id="anchor-filter"
                    value={selectedAnchorId || ""}
                    onChange={(e) => setSelectedAnchorId(e.target.value || null)}
                    className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
                  >
                    <option value="">All anchors</option>
                    {Array.from(new Set(debugHistory.map((h) => h.anchorId))).map((id) => (
                      <option key={id} value={id}>
                        {id}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={clearDebugHistory}
                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    Clear History
                  </button>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={effectiveShowVisualIndicators}
                      onChange={(e) => setInternalShowVisualIndicators(e.target.checked)}
                      className="w-3 h-3"
                    />
                    Visual indicators
                  </label>
                </div>
              </div>

              {/* Current visible tooltips */}
              {visibleTooltips.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Visible Tooltips
                  </h4>
                  <div className="space-y-1">
                    {visibleTooltips.map((tooltip) => {
                      const position = positions.get(tooltip.id);
                      return (
                        <div
                          key={tooltip.id}
                          className="text-xs p-2 bg-gray-50 dark:bg-gray-700 rounded"
                        >
                          <div className="font-mono text-blue-600 dark:text-blue-400">
                            {tooltip.id}
                          </div>
                          {position && (
                            <div className="text-gray-600 dark:text-gray-400 mt-1">
                              Position: ({position.x.toFixed(1)}, {position.y.toFixed(1)})
                              {position.width && (
                                <span>
                                  {" "}
                                  Size: {position.width.toFixed(1)}×
                                  {(position.height ?? 0).toFixed(1)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Debug history */}
              <div>
                <h4 className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Recent Coordinate Transformations
                  {selectedAnchorId && (
                    <span className="font-normal text-gray-500"> for {selectedAnchorId}</span>
                  )}
                </h4>
                {filteredHistory.length === 0 ? (
                  <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                    No debug history available
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredHistory.map((entry, index) => (
                      <DebugEntry
                        key={`${entry.anchorId}-${entry.timestamp.toString()}-${index.toString()}`}
                        entry={entry}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/**
 * Individual debug entry component
 */
function DebugEntry({ entry }: { entry: CoordinateDebugInfo }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="text-xs border border-gray-200 dark:border-gray-600 rounded">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
      >
        <div>
          <span className="font-mono text-blue-600 dark:text-blue-400">{entry.anchorId}</span>
          <span className="text-gray-500 dark:text-gray-400 ml-2">
            {new Date(entry.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <span className="text-gray-400">{isExpanded ? "−" : "+"}</span>
      </button>

      {isExpanded && (
        <div className="p-2 pt-0 space-y-2 bg-gray-50 dark:bg-gray-700/50">
          {entry.worldPosition && (
            <div>
              <div className="font-semibold text-gray-700 dark:text-gray-300">3D World:</div>
              <div className="font-mono text-gray-600 dark:text-gray-400">
                ({entry.worldPosition.x.toFixed(2)}, {entry.worldPosition.y.toFixed(2)},{" "}
                {entry.worldPosition.z.toFixed(2)})
              </div>
            </div>
          )}

          {entry.ndcPosition && (
            <div>
              <div className="font-semibold text-gray-700 dark:text-gray-300">NDC:</div>
              <div className="font-mono text-gray-600 dark:text-gray-400">
                ({entry.ndcPosition.x.toFixed(3)}, {entry.ndcPosition.y.toFixed(3)},{" "}
                {entry.ndcPosition.z.toFixed(3)})
              </div>
            </div>
          )}

          {entry.canvasPosition && (
            <div>
              <div className="font-semibold text-gray-700 dark:text-gray-300">Canvas:</div>
              <div className="font-mono text-gray-600 dark:text-gray-400">
                ({entry.canvasPosition.x.toFixed(1)}, {entry.canvasPosition.y.toFixed(1)})
              </div>
            </div>
          )}

          {entry.containerPosition && (
            <div>
              <div className="font-semibold text-gray-700 dark:text-gray-300">Container:</div>
              <div className="font-mono text-gray-600 dark:text-gray-400">
                ({entry.containerPosition.x.toFixed(1)}, {entry.containerPosition.y.toFixed(1)})
              </div>
            </div>
          )}

          {entry.frameOffset && (
            <div>
              <div className="font-semibold text-gray-700 dark:text-gray-300">Frame Offset:</div>
              <div className="font-mono text-gray-600 dark:text-gray-400">
                ({entry.frameOffset.x.toFixed(1)}, {entry.frameOffset.y.toFixed(1)})
              </div>
            </div>
          )}

          {entry.containerRect && (
            <div>
              <div className="font-semibold text-gray-700 dark:text-gray-300">Container Rect:</div>
              <div className="font-mono text-gray-600 dark:text-gray-400">
                {entry.containerRect.width.toFixed(0)}×{entry.containerRect.height.toFixed(0)} at (
                {entry.containerRect.left.toFixed(0)}, {entry.containerRect.top.toFixed(0)})
              </div>
            </div>
          )}

          {entry.canvasRect && (
            <div>
              <div className="font-semibold text-gray-700 dark:text-gray-300">Canvas Rect:</div>
              <div className="font-mono text-gray-600 dark:text-gray-400">
                {entry.canvasRect.width.toFixed(0)}×{entry.canvasRect.height.toFixed(0)} at (
                {entry.canvasRect.left.toFixed(0)}, {entry.canvasRect.top.toFixed(0)})
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
