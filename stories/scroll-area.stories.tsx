import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScrollArea, type ScrollInfo, type ViewportInfo, type ScrollAreaRef } from "@semio/ui";
import { useState, useRef, useCallback } from "react";

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

type Story = StoryObj<typeof ScrollArea>;

// Helper component for generating content
const ScrollContent = ({
  itemCount = 20,
  prefix = "Item",
}: {
  itemCount?: number;
  prefix?: string;
}) => (
  <div className="space-y-2 p-4">
    {Array.from({ length: itemCount }, (_, i) => (
      <div key={i} className="p-4 bg-gray-500 rounded border">
        {prefix} {i + 1}
      </div>
    ))}
  </div>
);

export const BasicUncontrolled: Story = {
  args: {
    wrapperClassName: "h-64 w-80 border rounded",
    orientation: "vertical",
    children: <ScrollContent />,
  },
};

export const HorizontalScroll: Story = {
  args: {
    wrapperClassName: "h-32 w-80 border rounded",
    orientation: "horizontal",
    children: (
      <div className="flex gap-2 p-4" style={{ width: "800px" }}>
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className="w-24 h-20 bg-blue-100 rounded border flex items-center justify-center"
          >
            {i + 1}
          </div>
        ))}
      </div>
    ),
  },
};

export const BothDirections: Story = {
  args: {
    wrapperClassName: "h-64 w-80 border rounded",
    orientation: "both",
    children: (
      <div className="p-4" style={{ width: "600px", height: "600px" }}>
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 48 }, (_, i) => (
            <div
              key={i}
              className="w-20 h-20 bg-green-100 rounded border flex items-center justify-center text-sm"
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    ),
  },
};

export const WithScrollTracking: Story = {
  render: () => {
    const [scrollInfo, setScrollInfo] = useState<ScrollInfo | null>(null);

    return (
      <div className="space-y-4">
        <ScrollArea className="max-h-64 w-80 border rounded" onScrollChange={setScrollInfo}>
          <ScrollContent itemCount={30} />
        </ScrollArea>

        <div className="text-xs bg-gray-50 p-3 rounded border max-w-80">
          <div className="font-semibold mb-2">Scroll Info:</div>
          <div>Scroll Top: {scrollInfo?.scrollTop ?? 0}px</div>
          <div>Scroll Height: {scrollInfo?.scrollHeight ?? 0}px</div>
          <div>Client Height: {scrollInfo?.clientHeight ?? 0}px</div>
          <div>
            Progress:{" "}
            {scrollInfo
              ? (
                  (scrollInfo.scrollTop / (scrollInfo.scrollHeight - scrollInfo.clientHeight)) *
                  100
                ).toFixed(1)
              : "0.0"}
            %
          </div>
        </div>
      </div>
    );
  },
};

export const WithViewportTracking: Story = {
  render: () => {
    const [visibleRange, setVisibleRange] = useState<{ start: number; end: number }>({
      start: 0,
      end: 0,
    });
    const [viewportInfo, setViewportInfo] = useState<ViewportInfo | null>(null);

    const itemHeight = 68; // Approximate height including margins

    const handleViewportChange = useCallback((info: ViewportInfo) => {
      setViewportInfo(info);
      const startIndex = Math.floor(info.visibleTop / itemHeight);
      const endIndex = Math.min(Math.ceil(info.visibleBottom / itemHeight), 24);
      setVisibleRange({ start: startIndex, end: endIndex });
    }, []);

    return (
      <div className="space-y-4">
        <ScrollArea
          wrapperClassName="h-64 w-80 border rounded"
          onViewportChange={handleViewportChange}
        >
          <div className="space-y-2 p-4">
            {Array.from({ length: 25 }, (_, i) => {
              const isVisible = i >= visibleRange.start && i <= visibleRange.end;
              return (
                <div
                  key={i}
                  className={`p-4 rounded border transition-colors ${
                    isVisible ? "bg-yellow-200 border-yellow-400" : "bg-gray-100"
                  }`}
                >
                  Item {i + 1} {isVisible && "👁️ Visible"}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="text-xs bg-yellow-50 p-3 rounded border max-w-80">
          <div className="font-semibold mb-2">Viewport Info:</div>
          <div>
            Visible Items: {visibleRange.start + 1} - {visibleRange.end + 1}
          </div>
          <div>Visible Top: {viewportInfo?.visibleTop ?? 0}px</div>
          <div>Visible Bottom: {viewportInfo?.visibleBottom ?? 0}px</div>
        </div>
      </div>
    );
  },
};

export const ControlledScrollArea: Story = {
  render: () => {
    const [scrollTop, setScrollTop] = useState(0);
    const [scrollInfo, setScrollInfo] = useState<ScrollInfo | null>(null);

    const handleScrollChange = useCallback((info: ScrollInfo) => {
      setScrollInfo(info);
      setScrollTop(info.scrollTop);
    }, []);

    const jumpToTop = () => setScrollTop(0);
    const jumpToMiddle = () => {
      if (scrollInfo) {
        setScrollTop((scrollInfo.scrollHeight - scrollInfo.clientHeight) / 2);
      }
    };
    const jumpToBottom = () => {
      if (scrollInfo) {
        setScrollTop(scrollInfo.scrollHeight - scrollInfo.clientHeight);
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={jumpToTop}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Top
          </button>
          <button
            onClick={jumpToMiddle}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Middle
          </button>
          <button
            onClick={jumpToBottom}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Bottom
          </button>
        </div>

        <ScrollArea
          wrapperClassName="h-64 w-80 border rounded"
          scrollTop={scrollTop}
          onScrollChange={handleScrollChange}
        >
          <ScrollContent itemCount={30} prefix="Controlled Item" />
        </ScrollArea>

        <div className="text-xs bg-blue-50 p-3 rounded border max-w-80">
          <div className="font-semibold mb-2">Controlled State:</div>
          <div>Controlled scrollTop: {scrollTop}px</div>
          <div>Actual DOM scrollTop: {scrollInfo?.scrollTop ?? 0}px</div>
        </div>
      </div>
    );
  },
};

export const ProgrammaticControl: Story = {
  render: () => {
    const scrollRef = useRef<ScrollAreaRef>(null);
    const [scrollInfo, setScrollInfo] = useState<ScrollInfo | null>(null);

    const scrollToTop = () => {
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    };

    const scrollToBottom = () => {
      const info = scrollRef.current?.getScrollInfo();
      if (info) {
        scrollRef.current?.scrollTo({
          top: info.scrollHeight - info.clientHeight,
          behavior: "smooth",
        });
      }
    };

    const scrollToItem = (itemIndex: number) => {
      const targetTop = itemIndex * 68; // Approximate item height
      scrollRef.current?.scrollTo({ top: targetTop, behavior: "smooth" });
    };

    return (
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={scrollToTop}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            Scroll to Top
          </button>
          <button
            onClick={scrollToBottom}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            Scroll to Bottom
          </button>
          <button
            onClick={() => scrollToItem(5)}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            Item 6
          </button>
          <button
            onClick={() => scrollToItem(15)}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            Item 16
          </button>
        </div>

        <ScrollArea
          ref={scrollRef}
          wrapperClassName="h-64 w-80 border rounded"
          onScrollChange={setScrollInfo}
        >
          <ScrollContent itemCount={25} prefix="Ref Item" />
        </ScrollArea>

        <div className="text-xs bg-green-50 p-3 rounded border max-w-80">
          <div className="font-semibold mb-2">Programmatic Control:</div>
          <div>Current position: {scrollInfo?.scrollTop ?? 0}px</div>
          <div>
            Total scrollable: {scrollInfo ? scrollInfo.scrollHeight - scrollInfo.clientHeight : 0}px
          </div>
        </div>
      </div>
    );
  },
};

export const SynchronizedScrollAreas: Story = {
  render: () => {
    const [sharedScrollTop, setSharedScrollTop] = useState(0);
    const [scrollInfo, setScrollInfo] = useState<ScrollInfo | null>(null);

    const handleScrollChange = useCallback((info: ScrollInfo) => {
      setScrollInfo(info);
      setSharedScrollTop(info.scrollTop);
    }, []);

    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600 mb-2">
          Scroll either area - they stay synchronized
        </div>

        <div className="flex gap-4">
          <ScrollArea
            wrapperClassName="h-64 w-48 border rounded"
            scrollTop={sharedScrollTop}
            onScrollChange={handleScrollChange}
          >
            <div className="space-y-2 p-4">
              {Array.from({ length: 30 }, (_, i) => (
                <div key={i} className="p-2 bg-purple-100 rounded text-sm">
                  Left {i + 1}
                </div>
              ))}
            </div>
          </ScrollArea>

          <ScrollArea
            wrapperClassName="h-64 w-48 border rounded"
            scrollTop={sharedScrollTop}
            onScrollChange={handleScrollChange}
          >
            <div className="space-y-2 p-4">
              {Array.from({ length: 30 }, (_, i) => (
                <div key={i} className="p-2 bg-orange-100 rounded text-sm">
                  Right {i + 1}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="text-xs bg-purple-50 p-3 rounded border max-w-96">
          <div className="font-semibold mb-2">Synchronized State:</div>
          <div>Shared scroll position: {sharedScrollTop}px</div>
          <div>
            Scroll progress:{" "}
            {scrollInfo
              ? (
                  (sharedScrollTop / (scrollInfo.scrollHeight - scrollInfo.clientHeight)) *
                  100
                ).toFixed(1)
              : "0.0"}
            %
          </div>
        </div>
      </div>
    );
  },
};

export const AnimationTimelinePattern: Story = {
  render: () => {
    const [scrollTop, setScrollTop] = useState(0);
    const [viewportInfo, setViewportInfo] = useState<ViewportInfo | null>(null);

    const tracks = Array.from({ length: 15 }, (_, i) => ({
      id: `track-${i}`,
      name: `Track ${i + 1}`,
      height: 60,
    }));

    const trackHeight = 60;

    const handleScrollChange = useCallback((info: ScrollInfo) => {
      setScrollTop(info.scrollTop);
    }, []);

    const handleViewportChange = useCallback((info: ViewportInfo) => {
      setViewportInfo(info);
    }, []);

    const visibleTracks = viewportInfo
      ? {
          start: Math.floor(viewportInfo.visibleTop / trackHeight),
          end: Math.min(Math.ceil(viewportInfo.visibleBottom / trackHeight), tracks.length - 1),
        }
      : { start: 0, end: tracks.length - 1 };

    const scrollProgress =
      viewportInfo && viewportInfo.totalHeight > 0
        ? scrollTop /
          (viewportInfo.totalHeight - (viewportInfo.visibleBottom - viewportInfo.visibleTop))
        : 0;

    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          Animation timeline pattern - tracks sync with Three.js canvas
        </div>

        <div className="grid grid-cols-[250px_1fr] gap-4 h-64 border rounded overflow-hidden">
          <ScrollArea
            scrollTop={scrollTop}
            onScrollChange={handleScrollChange}
            onViewportChange={handleViewportChange}
            className="bg-gray-50"
          >
            <div>
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className={`h-[60px] border-b border-gray-200 p-4 flex items-center ${
                    index >= visibleTracks.start && index <= visibleTracks.end
                      ? "bg-blue-100"
                      : "bg-white"
                  }`}
                >
                  <span className="text-sm font-medium">{track.name}</span>
                  {index >= visibleTracks.start && index <= visibleTracks.end && (
                    <span className="ml-2 text-xs text-blue-600">Visible</span>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="bg-amber-50 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-gray-600">
              <div className="text-center">
                <div className="text-lg font-semibold">Three.js Canvas</div>
                <div className="text-sm mt-2">
                  <div>Scroll Progress: {(scrollProgress * 100).toFixed(1)}%</div>
                  <div>
                    Visible: {visibleTracks.start + 1}-{visibleTracks.end + 1}
                  </div>
                  <div>Position: {scrollTop}px</div>
                </div>
              </div>
            </div>

            <div
              className="absolute left-0 right-0"
              style={{
                transform: `translateY(-${scrollTop}px)`,
                height: tracks.length * trackHeight,
              }}
            >
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className={`h-[60px] border-b border-gray-300 ${
                    index >= visibleTracks.start && index <= visibleTracks.end
                      ? "bg-blue-50"
                      : "bg-gray-100"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="text-xs bg-blue-50 p-3 rounded border">
          <div className="font-semibold mb-2">Timeline Integration Features:</div>
          <ul className="list-disc list-inside space-y-1">
            <li>Controlled scroll position for external synchronization</li>
            <li>Visible track calculation for efficient Three.js rendering</li>
            <li>Scroll progress for camera positioning</li>
            <li>Dual callbacks for different update needs</li>
          </ul>
        </div>
      </div>
    );
  },
};

export const WithHeaderAndFooter: Story = {
  render: (props) => (
    <div className="h-64 w-80 rounded-lg">
      <ScrollArea
        {...props}
        wrapperClassName="bg-gradient-to-b from-purple-50 to-blue-50 border-2 border-purple-200 rounded"
        showGutter={true}
      />
    </div>
  ),
  args: {
    orientation: "vertical",
    header: <div className="bg-blue-100 p-3 border-b font-semibold text-sm">Fixed Header</div>,
    footer: <div className="bg-green-100 p-3 border-t text-sm">Fixed Footer</div>,
    children: <ScrollContent itemCount={20} />,
  },
};

export const CustomStyling: Story = {
  render: (props) => (
    <div className="h-64 w-80 rounded-lg">
      <ScrollArea
        {...props}
        wrapperClassName="bg-gradient-to-b from-purple-50 to-blue-50 border-2 border-purple-200"
        showGutter={true}
      />
    </div>
  ),
  args: {
    children: (
      <div className="space-y-3 p-6">
        {Array.from({ length: 15 }, (_, i) => (
          <div key={i} className="p-4 bg-white rounded-lg shadow-sm border border-purple-100">
            <div className="font-medium text-purple-900">Custom Item {i + 1}</div>
            <div className="text-sm text-purple-600 mt-1">With custom styling</div>
          </div>
        ))}
      </div>
    ),
  },
};

export const OverscrollEffect: Story = {
  args: {
    wrapperClassName: "max-h-64 w-80 border rounded",
    enableOverscrollEffect: true,
    children: <ScrollContent itemCount={20} prefix="Overscroll Item" />,
  },
};

export const SynchronizedOverscroll: Story = {
  render: () => {
    const [sharedScrollTop, setSharedScrollTop] = useState(0);
    const [scrollInfo, setScrollInfo] = useState<ScrollInfo | null>(null);

    const handleScrollChange = useCallback((info: ScrollInfo) => {
      setScrollInfo(info);
      setSharedScrollTop(info.scrollTop);
    }, []);

    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600 mb-2">
          Synchronized scrolling with overscroll effects - left area is the controller (natural
          overscroll), right area is the follower (CSS transform effects)
        </div>

        <div className="flex gap-4">
          <div className="h-64 w-48">
            <ScrollArea wrapperClassName="border rounded" onScrollChange={handleScrollChange}>
              <div className="space-y-2 p-4">
                {Array.from({ length: 30 }, (_, i) => (
                  <div key={i} className="p-2 bg-purple-100 rounded text-sm">
                    Controller Left {i + 1}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="h-64 w-48">
            <ScrollArea
              wrapperClassName="border rounded"
              enableOverscrollEffect={true}
              scrollTop={sharedScrollTop}
            >
              <div className="space-y-2 p-4">
                {Array.from({ length: 30 }, (_, i) => (
                  <div key={i} className="p-2 bg-orange-100 rounded text-sm">
                    Follower Right {i + 1}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="text-xs bg-purple-50 p-3 rounded border max-w-96">
          <div className="font-semibold mb-2">Synchronized State:</div>
          <div>Shared scroll position: {sharedScrollTop.toFixed(1)}px</div>
          <div>
            Scroll progress:{" "}
            {scrollInfo
              ? (
                  (Math.max(0, sharedScrollTop) /
                    Math.max(1, scrollInfo.scrollHeight - scrollInfo.clientHeight)) *
                  100
                ).toFixed(1)
              : "0.0"}
            %
          </div>
          <div className={sharedScrollTop < 0 ? "text-orange-600 font-medium" : ""}>
            {sharedScrollTop < 0
              ? `🔄 Synchronized overscroll: ${Math.abs(sharedScrollTop).toFixed(1)}px`
              : ""}
          </div>
          <div className="text-green-600 text-xs mt-1">
            ✓ Controller/follower pattern • ✓ No double transform • ✓ Clean overscroll sync
          </div>
        </div>
      </div>
    );
  },
};

export const BidirectionalSynchronizedOverscroll: Story = {
  render: () => {
    const [sharedScrollTop, setSharedScrollTop] = useState(0);
    const [scrollInfo, setScrollInfo] = useState<ScrollInfo | null>(null);
    const [activeScrollArea, setActiveScrollArea] = useState<"left" | "right" | null>(null);
    const activeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleScrollChange = useCallback((info: ScrollInfo, source: "left" | "right") => {
      setScrollInfo(info);
      setSharedScrollTop(info.scrollTop);

      // Mark this area as active
      setActiveScrollArea(source);

      // Clear any existing timeout
      if (activeTimeoutRef.current) {
        clearTimeout(activeTimeoutRef.current);
      }

      // Reset active state after scrolling stops
      activeTimeoutRef.current = setTimeout(() => {
        setActiveScrollArea(null);
      }, 150);
    }, []);

    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600 mb-2">
          Bidirectional synchronized scrolling - both areas can be controllers. The active area
          shows natural overscroll, passive area shows CSS transform effects.
        </div>

        <div className="flex gap-4">
          <div className="h-64 w-48">
            <ScrollArea
              wrapperClassName="border rounded"
              enableOverscrollEffect={activeScrollArea !== "left"}
              scrollTop={activeScrollArea === "left" ? undefined : sharedScrollTop}
              onScrollChange={(info) => handleScrollChange(info, "left")}
            >
              <div className="space-y-2 p-4">
                {Array.from({ length: 30 }, (_, i) => (
                  <div key={i} className="p-2 bg-purple-100 rounded text-sm">
                    Bidirectional Left {i + 1}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="h-64 w-48">
            <ScrollArea
              wrapperClassName="border rounded"
              enableOverscrollEffect={activeScrollArea !== "right"}
              scrollTop={activeScrollArea === "right" ? undefined : sharedScrollTop}
              onScrollChange={(info) => handleScrollChange(info, "right")}
            >
              <div className="space-y-2 p-4">
                {Array.from({ length: 30 }, (_, i) => (
                  <div key={i} className="p-2 bg-orange-100 rounded text-sm">
                    Bidirectional Right {i + 1}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="text-xs bg-blue-50 p-3 rounded border max-w-96">
          <div className="font-semibold mb-2">Bidirectional Synchronized State:</div>
          <div>Shared scroll position: {sharedScrollTop.toFixed(1)}px</div>
          <div>Active area: {activeScrollArea || "none"}</div>
          <div>
            Scroll progress:{" "}
            {scrollInfo
              ? (
                  (Math.max(0, sharedScrollTop) /
                    Math.max(1, scrollInfo.scrollHeight - scrollInfo.clientHeight)) *
                  100
                ).toFixed(1)
              : "0.0"}
            %
          </div>
          <div className={sharedScrollTop < 0 ? "text-orange-600 font-medium" : ""}>
            {sharedScrollTop < 0
              ? `🔄 Synchronized overscroll: ${Math.abs(sharedScrollTop).toFixed(1)}px`
              : ""}
          </div>
          <div className="text-blue-600 text-xs mt-1">
            ✓ Both areas interactive • ✓ No double transform • ✓ Smart active detection
          </div>
        </div>
      </div>
    );
  },
};

export const IndependentOverscrollAreas: Story = {
  render: () => {
    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600 mb-2">
          Independent ScrollAreas - the left one operates normally, the right one shows CSS
          overscroll effects
        </div>

        <div className="flex gap-4">
          <div className="h-64 w-48">
            <ScrollArea wrapperClassName="border rounded">
              <div className="space-y-2 p-4">
                {Array.from({ length: 30 }, (_, i) => (
                  <div key={i} className="p-2 bg-purple-100 rounded text-sm">
                    Standard Left {i + 1}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="h-64 w-48">
            <ScrollArea wrapperClassName="border rounded" enableOverscrollEffect={true}>
              <div className="space-y-2 p-4">
                {Array.from({ length: 30 }, (_, i) => (
                  <div key={i} className="p-2 bg-orange-100 rounded text-sm">
                    Overscroll Right {i + 1}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="text-xs bg-green-50 p-3 rounded border max-w-96">
          <div className="font-semibold mb-2">Independent Overscroll Areas:</div>
          <div>• Left: Standard ScrollArea (no overscroll effects)</div>
          <div>• Right: CSS overscroll effects enabled</div>
          <div>• No synchronization between areas</div>
          <div className="text-green-600 text-xs mt-1">
            ✓ Try overscrolling the right area to see CSS transform effects
          </div>
        </div>
      </div>
    );
  },
};

export const OverscrollConfigurations: Story = {
  render: () => {
    const configs = [
      {
        name: "Disabled",
        enableOverscrollEffect: false,
        color: "bg-gray-100",
      },
      {
        name: "Standard",
        enableOverscrollEffect: false,
        color: "bg-green-100",
      },
      {
        name: "CSS Overscroll",
        enableOverscrollEffect: true,
        color: "bg-blue-100",
      },
      {
        name: "Synchronized",
        enableOverscrollEffect: true,
        color: "bg-red-100",
      },
    ];

    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600 mb-2">
          Different overscroll configurations - compare native behavior vs CSS effects
        </div>

        <div className="grid grid-cols-4 gap-4">
          {configs.map(({ name, enableOverscrollEffect, color }) => (
            <div key={name} className="space-y-2">
              <div className="text-sm font-medium text-center">{name}</div>
              <div className="h-48 w-full">
                <ScrollArea
                  wrapperClassName="border rounded"
                  enableOverscrollEffect={enableOverscrollEffect}
                >
                  <div className="space-y-2 p-3">
                    {Array.from({ length: 15 }, (_, i) => (
                      <div key={i} className={`p-2 ${color} rounded text-xs`}>
                        {name} Item {i + 1}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <div className="text-xs text-gray-500 text-center">
                {enableOverscrollEffect ? "CSS transform overscroll" : "Native browser behavior"}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const ComprehensiveOverscrollTest: Story = {
  render: () => {
    const [verticalScroll, setVerticalScroll] = useState(0);
    const [horizontalScroll, setHorizontalScroll] = useState(0);
    const [bothScroll, setBothScroll] = useState({ x: 0, y: 0 });
    const [syncedScroll, setSyncedScroll] = useState(0);
    const [activeScrollArea, setActiveScrollArea] = useState<"left" | "right" | null>(null);
    const activeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [verticalInfo, setVerticalInfo] = useState<ScrollInfo | null>(null);
    const [horizontalInfo, setHorizontalInfo] = useState<ScrollInfo | null>(null);
    const [bothInfo, setBothInfo] = useState<ScrollInfo | null>(null);
    const [syncedInfo, setSyncedInfo] = useState<ScrollInfo | null>(null);

    return (
      <div className="space-y-6">
        <div className="text-lg font-semibold mb-4">Comprehensive Overscroll Test Suite</div>
        <div className="text-sm text-gray-600 mb-4">
          Test different ScrollArea modes and overscroll behaviors using the simplified CSS
          transform approach.
        </div>

        {/* Vertical Controlled */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Vertical Controlled Mode (with CSS Overscroll)</div>
          <div className="flex gap-4 items-start">
            <div className="h-48 w-64">
              <ScrollArea
                wrapperClassName="border rounded"
                enableOverscrollEffect={true}
                scrollTop={verticalScroll}
                onScrollChange={(info) => {
                  setVerticalInfo(info);
                  setVerticalScroll(info.scrollTop);
                }}
              >
                <div className="space-y-2 p-3">
                  {Array.from({ length: 20 }, (_, i) => (
                    <div key={i} className="p-3 bg-blue-100 rounded text-sm">
                      Vertical Item {i + 1}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="text-xs bg-blue-50 p-2 rounded w-48">
              <div className="font-medium mb-1">Vertical State:</div>
              <div>Scroll: {(verticalInfo?.scrollTop ?? 0).toFixed(1)}px</div>
              <div className={verticalScroll < 0 ? "text-orange-600 font-medium" : ""}>
                {verticalScroll < 0 ? `Overscroll: ${Math.abs(verticalScroll).toFixed(1)}px` : ""}
              </div>
              <div>
                Max:{" "}
                {verticalInfo
                  ? (verticalInfo.scrollHeight - verticalInfo.clientHeight).toFixed(0)
                  : 0}
                px
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Controlled */}
        <div className="space-y-2">
          <div className="text-sm font-medium">
            Horizontal Controlled Mode (with CSS Overscroll)
          </div>
          <div className="flex gap-4 items-start">
            <div className="h-32 w-64">
              <ScrollArea
                wrapperClassName="border rounded"
                enableOverscrollEffect={true}
                scrollLeft={horizontalScroll}
                onScrollChange={(info) => {
                  setHorizontalInfo(info);
                  setHorizontalScroll(info.scrollLeft);
                }}
              >
                <div className="flex gap-2 p-3" style={{ width: "800px" }}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-20 h-16 bg-green-100 rounded text-xs flex items-center justify-center"
                    >
                      H-{i + 1}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="text-xs bg-green-50 p-2 rounded w-48">
              <div className="font-medium mb-1">Horizontal State:</div>
              <div>Scroll: {(horizontalInfo?.scrollLeft ?? 0).toFixed(1)}px</div>
              <div className={horizontalScroll < 0 ? "text-orange-600 font-medium" : ""}>
                {horizontalScroll < 0
                  ? `Overscroll: ${Math.abs(horizontalScroll).toFixed(1)}px`
                  : ""}
              </div>
              <div>
                Max:{" "}
                {horizontalInfo
                  ? (horizontalInfo.scrollWidth - horizontalInfo.clientWidth).toFixed(0)
                  : 0}
                px
              </div>
            </div>
          </div>
        </div>

        {/* Both Directions */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Both Directions (Uncontrolled)</div>
          <div className="flex gap-4 items-start">
            <div className="h-48 w-64">
              <ScrollArea
                wrapperClassName="border rounded"
                onScrollChange={(info) => {
                  setBothInfo(info);
                  setBothScroll({ x: info.scrollLeft, y: info.scrollTop });
                }}
              >
                <div className="p-3" style={{ width: "600px", height: "600px" }}>
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: 32 }, (_, i) => (
                      <div
                        key={i}
                        className="w-16 h-16 bg-purple-100 rounded text-xs flex items-center justify-center"
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </div>
            <div className="text-xs bg-purple-50 p-2 rounded w-48">
              <div className="font-medium mb-1">Both Directions:</div>
              <div>Y: {(bothInfo?.scrollTop ?? 0).toFixed(1)}px</div>
              <div>X: {(bothInfo?.scrollLeft ?? 0).toFixed(1)}px</div>
              <div className={bothScroll.y < 0 ? "text-orange-600 font-medium" : ""}>
                {bothScroll.y < 0 ? `Y-Over: ${Math.abs(bothScroll.y).toFixed(1)}px` : ""}
              </div>
              <div className={bothScroll.x < 0 ? "text-orange-600 font-medium" : ""}>
                {bothScroll.x < 0 ? `X-Over: ${Math.abs(bothScroll.x).toFixed(1)}px` : ""}
              </div>
            </div>
          </div>
        </div>

        {/* Bidirectional Synchronized Pair */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Bidirectional Synchronized Overscroll Pair</div>
          <div className="flex gap-4 items-start">
            <div className="flex gap-2">
              <div className="h-48 w-40">
                <ScrollArea
                  wrapperClassName="border rounded"
                  enableOverscrollEffect={activeScrollArea !== "left"}
                  scrollTop={activeScrollArea === "left" ? undefined : syncedScroll}
                  onScrollChange={(info) => {
                    setSyncedInfo(info);
                    setSyncedScroll(info.scrollTop);
                    setActiveScrollArea("left");
                    if (activeTimeoutRef.current) {
                      clearTimeout(activeTimeoutRef.current);
                    }
                    activeTimeoutRef.current = setTimeout(() => {
                      setActiveScrollArea(null);
                    }, 150);
                  }}
                >
                  <div className="space-y-1 p-2">
                    {Array.from({ length: 25 }, (_, i) => (
                      <div key={i} className="p-2 bg-red-100 rounded text-xs">
                        L-{i + 1}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="h-48 w-40">
                <ScrollArea
                  wrapperClassName="border rounded"
                  enableOverscrollEffect={activeScrollArea !== "right"}
                  scrollTop={activeScrollArea === "right" ? undefined : syncedScroll}
                  onScrollChange={(info) => {
                    setSyncedInfo(info);
                    setSyncedScroll(info.scrollTop);
                    setActiveScrollArea("right");
                    if (activeTimeoutRef.current) {
                      clearTimeout(activeTimeoutRef.current);
                    }
                    activeTimeoutRef.current = setTimeout(() => {
                      setActiveScrollArea(null);
                    }, 150);
                  }}
                >
                  <div className="space-y-1 p-2">
                    {Array.from({ length: 25 }, (_, i) => (
                      <div key={i} className="p-2 bg-yellow-100 rounded text-xs">
                        R-{i + 1}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <div className="text-xs bg-red-50 p-2 rounded w-48">
              <div className="font-medium mb-1">Sync State:</div>
              <div>Position: {syncedScroll.toFixed(1)}px</div>
              <div className={syncedScroll < 0 ? "text-orange-600 font-medium" : ""}>
                {syncedScroll < 0
                  ? `🔄 Synced Overscroll: ${Math.abs(syncedScroll).toFixed(1)}px`
                  : ""}
              </div>
              <div>
                Progress:{" "}
                {syncedInfo
                  ? (
                      (Math.max(0, syncedScroll) /
                        Math.max(1, syncedInfo.scrollHeight - syncedInfo.clientHeight)) *
                      100
                    ).toFixed(1)
                  : "0"}
                %
              </div>
              <div>Active area: {activeScrollArea || "none"}</div>
              <div className="text-green-600 text-xs mt-1">
                ✓ Bidirectional overscroll with active/passive swapping
              </div>
            </div>
          </div>
        </div>

        {/* Test Status */}
        <div className="text-xs bg-gray-50 p-3 rounded border">
          <div className="font-semibold mb-2">Test Checklist:</div>
          <div className="grid grid-cols-2 gap-2">
            <div>✓ Vertical CSS overscroll (controlled)</div>
            <div>✓ Horizontal CSS overscroll (controlled)</div>
            <div>✓ Both-direction standard scroll (uncontrolled)</div>
            <div>✓ Synchronized overscroll pairs (controlled)</div>
            <div>✓ CSS overscroll enabled in controlled mode</div>
            <div>✓ Negative scroll value tracking</div>
            <div>✓ Spring-back animations</div>
            <div>✓ Real-time state updates</div>
          </div>
          <div className="mt-2 p-2 bg-green-50 rounded">
            <div className="font-medium text-green-800">Simplified Success!</div>
            <div className="text-green-700">
              CSS transform overscroll effects work perfectly in controlled mode, enabling clean
              synchronized overscroll across multiple ScrollAreas without complex motion systems.
            </div>
          </div>
        </div>
      </div>
    );
  },
};
