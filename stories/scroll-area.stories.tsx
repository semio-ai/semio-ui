import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScrollArea, type ScrollInfo, type ScrollAreaRef } from "@semio/ui";
import { useState } from "react";
import { useMotionValue, useMotionValueEvent } from "motion/react";

const meta: Meta<typeof ScrollArea> = {
  component: ScrollArea,
  title: "ui/ScrollArea",
  decorators: [
    (Story) => (
      <div className="grid place-items-center p-5 h-full">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Helper component for consistent content
function ScrollContent({
  prefix,
  count = 30,
  bgColor = "bg-blue-100",
}: {
  prefix: string;
  count?: number;
  bgColor?: string;
}) {
  return <div className="space-y-2 p-4">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className={`p-3 ${bgColor} rounded text-sm`}>
        {prefix} {i + 1}
      </div>
    ))}
  </div>
}

export const Basic: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        Basic ScrollArea with natural overscroll behavior. Try scrolling past the edges to see the
        rubber banding effect.
      </div>

      <div className="border rounded" style={{ height: "250px", width: "250px" }}>
        <ScrollArea onScrollChange={(info) => console.log("Scroll info:", info)}>
          <ScrollContent prefix="Item" count={40} />
        </ScrollArea>
      </div>
    </div>
  ),
};

export const SynchronizedScrolling: Story = {
  render: () => {
    const sharedMotionY = useMotionValue(0);
    const [displayValue, setDisplayValue] = useState(0);
    const [activeArea, setActiveArea] = useState<string | null>(null);
    const [scrollInfo, setScrollInfo] = useState({ scrollTop: 0, isOverscrolling: false });

    // Track motion value changes for display
    useMotionValueEvent(sharedMotionY, "change", (value) => {
      setDisplayValue(value);
    });

    const handleScrollChange = (info: ScrollInfo) => {
      setScrollInfo({
        scrollTop: info.scrollTop,
        isOverscrolling: info.isOverscrolling,
      });
    };

    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          Low-latency synchronized scrolling using motion values.
          <strong>
            {" "}
            Notice how responsive the synchronization is compared to callback-based sync.
          </strong>
        </div>

        <div className="flex gap-4">
          <div className="space-y-2">
            <div className="text-xs font-medium flex items-center gap-2">
              Area 1
              {activeArea === "area1" && <span className="text-blue-600 font-bold">● ACTIVE</span>}
              {activeArea !== "area1" && <span className="text-gray-500">○ FOLLOWING</span>}
            </div>
            <div
              className={`border-2 rounded transition-all ${
                activeArea === "area1" ? "border-blue-600 shadow-lg bg-blue-50" : "border-blue-300"
              }`}
              style={{ height: "250px", width: "200px" }}
              onMouseEnter={() => setActiveArea("area1")}
              onMouseLeave={() => setActiveArea(null)}
            >
              <ScrollArea
                motionScrollY={sharedMotionY}
                onScrollChange={activeArea === "area1" ? handleScrollChange : undefined}
              >
                <ScrollContent prefix="Motion A" bgColor="bg-blue-100" />
              </ScrollArea>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium flex items-center gap-2">
              Area 2
              {activeArea === "area2" && <span className="text-green-600 font-bold">● ACTIVE</span>}
              {activeArea !== "area2" && <span className="text-gray-500">○ FOLLOWING</span>}
            </div>
            <div
              className={`border-2 rounded transition-all ${
                activeArea === "area2"
                  ? "border-green-600 shadow-lg bg-green-50"
                  : "border-green-300"
              }`}
              style={{ height: "250px", width: "200px" }}
              onMouseEnter={() => setActiveArea("area2")}
              onMouseLeave={() => setActiveArea(null)}
            >
              <ScrollArea
                motionScrollY={sharedMotionY}
                onScrollChange={activeArea === "area2" ? handleScrollChange : undefined}
              >
                <ScrollContent prefix="Motion B" bgColor="bg-green-100" />
              </ScrollArea>
            </div>
          </div>
        </div>

        <div className="text-xs bg-gray-50 p-3 rounded max-w-md space-y-1">
          <div>
            <strong>Motion value position:</strong> {displayValue.toFixed(1)}px
          </div>
          <div>
            <strong>Active area:</strong> {activeArea ?? "None"}
          </div>
          <div>
            <strong>Current scroll:</strong> {scrollInfo.scrollTop.toFixed(1)}px
          </div>
          <div className="text-blue-600">✓ Low-latency motion sync</div>
          <div className="text-green-600">✓ Instant responsiveness</div>
          <div className="text-purple-600">✓ Shared motion values</div>
        </div>
      </div>
    );
  },
};

export const WithHeaderFooter: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        ScrollArea with fixed header and footer sections. The overscroll padding is only applied to
        the scrollable content area.
      </div>

      <div className="border rounded bg-white" style={{ height: "300px", width: "280px" }}>
        <ScrollArea
          header={
            <div className="bg-gray-100 p-3 border-b font-medium text-sm">📊 Document Header</div>
          }
          footer={
            <div className="bg-gray-100 p-3 border-t text-xs text-gray-600">
              Footer • Page 1 of 1
            </div>
          }
          onScrollChange={(info) => console.log("Header/Footer scroll:", info)}
        >
          <div className="p-4 space-y-4">
            <h3 className="font-semibold">Document Content</h3>
            <p className="text-sm text-gray-700">
              This content scrolls with natural overscroll behavior while the header and footer
              remain fixed.
            </p>
            <ScrollContent prefix="Section" count={20} bgColor="bg-gray-50" />
          </div>
        </ScrollArea>
      </div>
    </div>
  ),
};

export const HorizontalSync: Story = {
  render: () => {
    const sharedMotionX = useMotionValue(0);
    const [displayValue, setDisplayValue] = useState(0);
    const [activeArea, setActiveArea] = useState<string | null>(null);

    // Track motion value changes for display
    useMotionValueEvent(sharedMotionX, "change", (value) => {
      setDisplayValue(value);
    });

    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          Horizontal scroll synchronization between two wide content areas.
        </div>

        <div className="space-y-4">
          <div
            className={`border-2 rounded transition-all ${
              activeArea === "horizontal1" ? "border-purple-600 bg-purple-50" : "border-purple-300"
            }`}
            style={{ height: "120px", width: "300px" }}
            onMouseEnter={() => setActiveArea("horizontal1")}
            onMouseLeave={() => setActiveArea(null)}
          >
            <ScrollArea orientation="horizontal" motionScrollX={sharedMotionX}>
              <div className="flex gap-4 p-4" style={{ width: "800px" }}>
                {Array.from({ length: 20 }, (_, i) => (
                  <div key={i} className="bg-purple-100 p-3 rounded whitespace-nowrap">
                    Wide Item {i + 1}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div
            className={`border-2 rounded transition-all ${
              activeArea === "horizontal2" ? "border-indigo-600 bg-indigo-50" : "border-indigo-300"
            }`}
            style={{ height: "120px", width: "300px" }}
            onMouseEnter={() => setActiveArea("horizontal2")}
            onMouseLeave={() => setActiveArea(null)}
          >
            <ScrollArea orientation="horizontal" motionScrollX={sharedMotionX}>
              <div className="flex gap-4 p-4" style={{ width: "800px" }}>
                {Array.from({ length: 20 }, (_, i) => (
                  <div key={i} className="bg-indigo-100 p-3 rounded whitespace-nowrap">
                    Horizontal {i + 1}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="text-xs bg-gray-50 p-3 rounded max-w-md">
          <div>
            <strong>Motion value position:</strong> {displayValue.toFixed(1)}px
          </div>
          <div>
            <strong>Active area:</strong> {activeArea ?? "None"}
          </div>
          <div className="text-purple-600">✓ Instant horizontal sync</div>
        </div>
      </div>
    );
  },
};

export const ScrollTrackingDemo: Story = {
  render: () => {
    const [scrollInfo, setScrollInfo] = useState({
      scrollTop: 0,
      scrollHeight: 0,
      clientHeight: 0,
    });

    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          Demonstration of scroll tracking with detailed position information.
          <strong> Scroll to see real-time position updates.</strong>
        </div>

        <div className="relative">
          <div
            className="border-2 rounded border-blue-300"
            style={{ height: "200px", width: "250px" }}
          >
            <ScrollArea onScrollChange={(info) => setScrollInfo(info)}>
              <div className="p-4 space-y-2">
                <div className="text-sm font-medium text-gray-800">Scroll Tracking Content</div>
                <ScrollContent prefix="Track Item" count={15} bgColor="bg-blue-100" />
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="text-xs bg-blue-50 p-3 rounded max-w-md space-y-1">
          <div>
            <strong>Scroll Position:</strong> {scrollInfo.scrollTop.toFixed(1)}px
          </div>
          <div>
            <strong>Content Height:</strong> {scrollInfo.scrollHeight}px
          </div>
          <div>
            <strong>Visible Height:</strong> {scrollInfo.clientHeight}px
          </div>
          <div className="text-gray-500">
            <strong>Scroll Progress:</strong>{" "}
            {scrollInfo.scrollHeight > 0
              ? (
                  (scrollInfo.scrollTop /
                    Math.max(1, scrollInfo.scrollHeight - scrollInfo.clientHeight)) *
                  100
                ).toFixed(1)
              : 0}
            %
          </div>
          <div className="text-blue-600">✓ Real-time scroll tracking</div>
          <div className="text-green-600">✓ Gesture-based scroll handling</div>
        </div>
      </div>
    );
  },
};

export const ProgrammaticControl: Story = {
  render: () => {
    const [scrollAreaRef, setScrollAreaRef] = useState<ScrollAreaRef | null>(null);
    const [currentPosition, setCurrentPosition] = useState(0);

    const scrollToPosition = (position: number) => {
      scrollAreaRef?.scrollTo({ top: position, behavior: "smooth" });
    };

    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          Programmatic scroll control with the new simplified API.
        </div>

        <div className="border rounded" style={{ height: "250px", width: "250px" }}>
          <ScrollArea
            ref={setScrollAreaRef}
            onScrollChange={(info) => setCurrentPosition(info.scrollTop)}
          >
            <ScrollContent prefix="Control Item" count={30} bgColor="bg-indigo-100" />
          </ScrollArea>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => scrollToPosition(0)}
              className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded"
            >
              Top
            </button>
            <button
              type="button"
              onClick={() => scrollToPosition(100)}
              className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded"
            >
              100px
            </button>
            <button
              type="button"
              onClick={() => scrollToPosition(300)}
              className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded"
            >
              300px
            </button>
            <button
              type="button"
              onClick={() => scrollToPosition(1000)}
              className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded"
            >
              Bottom
            </button>
          </div>

          <div className="text-xs bg-gray-50 p-3 rounded">
            <strong>Current Position:</strong> {currentPosition.toFixed(1)}px
          </div>
        </div>
      </div>
    );
  },
};

export const ComprehensiveDemo: Story = {
  render: () => {
    const sharedMotionY = useMotionValue(0);
    const sharedMotionX = useMotionValue(0);
    const [displayValueY, setDisplayValueY] = useState(0);
    const [displayValueX, setDisplayValueX] = useState(0);
    const [activeArea, setActiveArea] = useState<string | null>(null);
    const [scrollInfo, setScrollInfo] = useState({
      scrollTop: 0,
      scrollLeft: 0,
      scrollHeight: 0,
      clientHeight: 0,
    });

    // Track motion value changes for display
    useMotionValueEvent(sharedMotionY, "change", (value) => {
      setDisplayValueY(value);
    });

    useMotionValueEvent(sharedMotionX, "change", (value) => {
      setDisplayValueX(value);
    });

    const handleDetailedScrollChange = (info: ScrollInfo) => {
      setScrollInfo(info);
    };

    return (
      <div className="space-y-6">
        <div className="text-sm text-gray-600">
          Comprehensive demonstration using motion values for ultra-responsive synchronization.
          <strong> Notice the instant sync with no latency between areas.</strong>
        </div>

        {/* Vertical Sync Demo */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Vertical Synchronization</h3>
          <div className="flex gap-4">
            <div className="space-y-1">
              <div className="text-xs font-medium flex items-center gap-2">
                Primary Area
                {activeArea === "vertical1" && (
                  <span className="text-blue-600 font-bold">● CONTROLLING</span>
                )}
                {activeArea !== "vertical1" && <span className="text-gray-500">○ FOLLOWING</span>}
              </div>
              <div
                className={`border-2 rounded transition-all ${
                  activeArea === "vertical1"
                    ? "border-blue-600 shadow-lg bg-blue-50"
                    : "border-blue-300"
                }`}
                style={{ height: "200px", width: "180px" }}
                onMouseEnter={() => setActiveArea("vertical1")}
                onMouseLeave={() => setActiveArea(null)}
              >
                <ScrollArea
                  motionScrollY={sharedMotionY}
                  onScrollChange={
                    activeArea === "vertical1" ? handleDetailedScrollChange : undefined
                  }
                >
                  <ScrollContent prefix="Primary" count={25} bgColor="bg-blue-100" />
                </ScrollArea>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-medium flex items-center gap-2">
                Secondary Area
                {activeArea === "vertical2" && (
                  <span className="text-green-600 font-bold">● CONTROLLING</span>
                )}
                {activeArea !== "vertical2" && <span className="text-gray-500">○ FOLLOWING</span>}
              </div>
              <div
                className={`border-2 rounded transition-all ${
                  activeArea === "vertical2"
                    ? "border-green-600 shadow-lg bg-green-50"
                    : "border-green-300"
                }`}
                style={{ height: "200px", width: "180px" }}
                onMouseEnter={() => setActiveArea("vertical2")}
                onMouseLeave={() => setActiveArea(null)}
              >
                <ScrollArea motionScrollY={sharedMotionY}>
                  <ScrollContent prefix="Secondary" count={25} bgColor="bg-green-100" />
                </ScrollArea>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-600">Third Area</div>
              <div
                className="border-2 rounded border-purple-300"
                style={{ height: "200px", width: "180px" }}
              >
                <ScrollArea motionScrollY={sharedMotionY}>
                  <ScrollContent prefix="Observer" count={25} bgColor="bg-purple-100" />
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Sync Demo */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Horizontal Synchronization</h3>
          <div className="space-y-3">
            <div
              className={`border-2 rounded transition-all ${
                activeArea === "horizontal1"
                  ? "border-orange-600 bg-orange-50"
                  : "border-orange-300"
              }`}
              style={{ height: "100px", width: "400px" }}
              onMouseEnter={() => setActiveArea("horizontal1")}
              onMouseLeave={() => setActiveArea(null)}
            >
              <ScrollArea orientation="horizontal" motionScrollX={sharedMotionX}>
                <div className="flex gap-3 p-3" style={{ width: "1000px" }}>
                  {Array.from({ length: 30 }, (_, i) => (
                    <div key={i} className="bg-orange-100 p-2 rounded text-sm whitespace-nowrap">
                      Wide {i + 1}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div
              className={`border-2 rounded transition-all ${
                activeArea === "horizontal2" ? "border-pink-600 bg-pink-50" : "border-pink-300"
              }`}
              style={{ height: "100px", width: "400px" }}
              onMouseEnter={() => setActiveArea("horizontal2")}
              onMouseLeave={() => setActiveArea(null)}
            >
              <ScrollArea orientation="horizontal" motionScrollX={sharedMotionX}>
                <div className="flex gap-3 p-3" style={{ width: "1000px" }}>
                  {Array.from({ length: 30 }, (_, i) => (
                    <div key={i} className="bg-pink-100 p-2 rounded text-sm whitespace-nowrap">
                      Item {i + 1}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Status Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-xs bg-blue-50 p-4 rounded space-y-2">
            <h4 className="font-semibold text-blue-800">Vertical Sync Status</h4>
            <div>
              <strong>Motion Value:</strong> {displayValueY.toFixed(1)}px
            </div>
            <div>
              <strong>Active Area:</strong> {activeArea?.includes("vertical") ? activeArea : "None"}
            </div>
            <div>
              <strong>Content Height:</strong> {scrollInfo.scrollHeight}px
            </div>
            <div className="text-gray-600">
              <strong>Scroll Progress:</strong>{" "}
              {scrollInfo.scrollHeight > 0
                ? (
                    (scrollInfo.scrollTop /
                      Math.max(1, scrollInfo.scrollHeight - scrollInfo.clientHeight)) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </div>
          </div>

          <div className="text-xs bg-orange-50 p-4 rounded space-y-2">
            <h4 className="font-semibold text-orange-800">Horizontal Sync Status</h4>
            <div>
              <strong>Motion Value:</strong> {displayValueX.toFixed(1)}px
            </div>
            <div>
              <strong>Active Area:</strong>{" "}
              {activeArea?.includes("horizontal") ? activeArea : "None"}
            </div>
            <div className="text-orange-600">✓ Zero-latency motion sync</div>
            <div className="text-green-600">✓ Instant responsiveness</div>
          </div>
        </div>

        {/* Key Improvements */}
        <div className="bg-green-50 p-4 rounded">
          <h4 className="font-semibold text-green-800 mb-2">✅ Motion Value Benefits</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
            <div>• Instant synchronization</div>
            <div>• No callback latency</div>
            <div>• Smooth trackpad momentum</div>
            <div>• Shared motion state</div>
            <div>• 60fps responsiveness</div>
            <div>• Zero desync issues</div>
          </div>
        </div>
      </div>
    );
  },
};

export const PerformanceComparison: Story = {
  render: () => {
    // Motion value approach (low latency)
    const motionY = useMotionValue(0);
    const [motionDisplayValue, setMotionDisplayValue] = useState(0);

    // Callback approach (higher latency)
    const [callbackScrollTop, setCallbackScrollTop] = useState(0);
    const [callbackDisplayValue, setCallbackDisplayValue] = useState(0);

    const [activeArea, setActiveArea] = useState<string | null>(null);

    // Track motion value changes
    useMotionValueEvent(motionY, "change", (value) => {
      setMotionDisplayValue(value);
    });

    // Callback-based sync
    const handleCallbackSync = (areaId: string) => (scrollTop: number) => {
      if (activeArea === areaId) {
        setCallbackScrollTop(scrollTop);
        setCallbackDisplayValue(scrollTop);
      }
    };

    return (
      <div className="space-y-6">
        <div className="text-sm text-gray-600">
          Performance comparison between motion values and callback-based synchronization.
          <strong> Try scrolling rapidly to see the latency difference.</strong>
        </div>

        {/* Motion Value Approach */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-green-700">✅ Motion Values (Low Latency)</h3>
          <div className="flex gap-4">
            <div
              className="border-2 rounded border-green-500"
              style={{ height: "200px", width: "200px" }}
            >
              <ScrollArea motionScrollY={motionY}>
                <ScrollContent prefix="Motion" count={30} bgColor="bg-green-100" />
              </ScrollArea>
            </div>
            <div
              className="border-2 rounded border-green-500"
              style={{ height: "200px", width: "200px" }}
            >
              <ScrollArea motionScrollY={motionY}>
                <ScrollContent prefix="Synced" count={30} bgColor="bg-green-100" />
              </ScrollArea>
            </div>
            <div className="text-xs bg-green-50 p-3 rounded">
              <div>
                <strong>Sync Method:</strong> Motion Values
              </div>
              <div>
                <strong>Position:</strong> {motionDisplayValue.toFixed(1)}px
              </div>
              <div className="text-green-600 font-medium">⚡ Instant sync</div>
              <div className="text-green-600">60fps responsiveness</div>
            </div>
          </div>
        </div>

        {/* Callback Approach */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-orange-700">⚠️ Callbacks (Higher Latency)</h3>
          <div className="flex gap-4">
            <div
              className="border-2 rounded border-orange-500"
              style={{ height: "200px", width: "200px" }}
              onMouseEnter={() => setActiveArea("callback1")}
              onMouseLeave={() => setActiveArea(null)}
            >
              <ScrollArea
                externalScrollTop={activeArea !== "callback1" ? callbackScrollTop : undefined}
                onScrollSync={handleCallbackSync("callback1")}
              >
                <ScrollContent prefix="Callback" count={30} bgColor="bg-orange-100" />
              </ScrollArea>
            </div>
            <div
              className="border-2 rounded border-orange-500"
              style={{ height: "200px", width: "200px" }}
              onMouseEnter={() => setActiveArea("callback2")}
              onMouseLeave={() => setActiveArea(null)}
            >
              <ScrollArea
                externalScrollTop={activeArea !== "callback2" ? callbackScrollTop : undefined}
                onScrollSync={handleCallbackSync("callback2")}
              >
                <ScrollContent prefix="Delayed" count={30} bgColor="bg-orange-100" />
              </ScrollArea>
            </div>
            <div className="text-xs bg-orange-50 p-3 rounded">
              <div>
                <strong>Sync Method:</strong> Callbacks
              </div>
              <div>
                <strong>Position:</strong> {callbackDisplayValue.toFixed(1)}px
              </div>
              <div>
                <strong>Active:</strong> {activeArea ?? "None"}
              </div>
              <div className="text-orange-600 font-medium">🐌 React state latency</div>
              <div className="text-orange-600">Hover to control</div>
            </div>
          </div>
        </div>

        {/* Performance Analysis */}
        <div className="bg-blue-50 p-4 rounded">
          <h4 className="font-semibold text-blue-800 mb-3">Performance Analysis</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-green-700 mb-2">Motion Values ✅</h5>
              <ul className="text-xs space-y-1 text-green-600">
                <li>• Direct DOM updates</li>
                <li>• No React re-render overhead</li>
                <li>• 60fps synchronization</li>
                <li>• Sub-millisecond latency</li>
                <li>• Works during momentum scrolling</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-orange-700 mb-2">Callbacks ⚠️</h5>
              <ul className="text-xs space-y-1 text-orange-600">
                <li>• React state updates required</li>
                <li>• Re-render on every scroll event</li>
                <li>• 16-33ms update cycles</li>
                <li>• Visible lag during fast scrolling</li>
                <li>• Breaks momentum scrolling sync</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-3 rounded">
          <div className="text-sm text-green-800">
            <strong>Recommendation:</strong> Use motion values for any real-time synchronization to
            achieve smooth, responsive user experiences without perceptible latency.
          </div>
        </div>
      </div>
    );
  },
};
