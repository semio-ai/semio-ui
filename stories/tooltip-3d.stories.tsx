import type { Meta } from "@storybook/react-vite";
import React, { useState } from "react";
import type * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Box, OrbitControls, Grid } from "@react-three/drei";
import {
  TooltipProvider,
  TooltipHost,
  useTooltipAnchor,
  useTooltipTrigger,
  useTooltipControls,
  type AxisMode,
} from "@semio/ui";

const meta = {
  title: "floating/Tooltip3D",
  component: TooltipProvider,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "100vw", height: "100vh" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TooltipProvider>;

export default meta;

// Helper component for tooltip content
function TooltipContent({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-3 max-w-xs">
      <h4 className="font-semibold text-sm mb-1">{title}</h4>
      <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

// Basic mesh with tooltip
function BasicMesh({
  position,
  color,
  tooltipId,
  title,
  description,
  side = "top",
}: {
  position: [number, number, number];
  color: string;
  tooltipId: string;
  title: string;
  description: string;
  side?: "top" | "right" | "bottom" | "left";
}) {
  const { ref, anchorId } = useTooltipAnchor({
    id: tooltipId,
    content: <TooltipContent title={title} description={description} />,
    side,
    offset: 8,
  });

  const { show, hide } = useTooltipTrigger(anchorId);

  const handlePointerOver = () => {
    show();
  };

  const handlePointerOut = () => {
    hide();
  };

  return (
    <Box
      ref={ref as unknown as React.RefObject<THREE.Mesh | null>}
      args={[1, 1, 1]}
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <meshStandardMaterial color={color} />
    </Box>
  );
}

// Mesh with configurable axis tracking
function TrackingMesh({
  position,
  color,
  axis,
}: {
  position: [number, number, number];
  color: string;
  axis: AxisMode;
  label: string;
}) {
  const { ref, anchorId, onPointerMove, onPointerLeave } = useTooltipAnchor({
    content: (
      <TooltipContent
        title={`Axis: ${axis}`}
        description={`This tooltip uses ${axis === "none" ? "bounding box" : `${axis} axis`} tracking`}
      />
    ),
    axis,
    side: "top",
    offset: 12,
  });

  const { show, hide } = useTooltipTrigger(anchorId);

  return (
    <Box
      ref={ref as unknown as React.RefObject<THREE.Mesh | null>}
      args={[2, 0.5, 0.5]}
      position={position}
      onPointerOver={show}
      onPointerOut={() => {
        hide();
        onPointerLeave?.();
      }}
      onPointerMove={onPointerMove}
    >
      <meshStandardMaterial color={color} />
    </Box>
  );
}

// External control panel component
function ExternalControlPanel({ meshId, label }: { meshId: string; label: string }) {
  const { show, hide } = useTooltipTrigger(meshId);
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h4 className="text-sm font-medium mb-2">{label}</h4>
      <button
        type="button"
        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
        onMouseEnter={() => {
          show();
          setIsHovering(true);
        }}
        onMouseLeave={() => {
          hide();
          setIsHovering(false);
        }}
      >
        {isHovering ? "Showing tooltip →" : "Hover to show"}
      </button>
    </div>
  );
}

// Programmatic control panel
function ProgrammaticControlPanel() {
  const { showTooltip, hideTooltip, hideAll } = useTooltipControls();
  const [activeTooltips, setActiveTooltips] = useState<Set<string>>(new Set());

  const toggleTooltip = (id: string) => {
    if (activeTooltips.has(id)) {
      hideTooltip(id);
      setActiveTooltips((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      showTooltip(id);
      setActiveTooltips((prev) => new Set(prev).add(id));
    }
  };

  return (
    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h4 className="text-sm font-medium mb-2">Programmatic Control</h4>
      <div className="space-y-2">
        <button
          type="button"
          className="w-full px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition-colors"
          onClick={() => toggleTooltip("basic-1")}
        >
          {activeTooltips.has("basic-1") ? "Hide" : "Show"} Red Cube
        </button>
        <button
          type="button"
          className="w-full px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition-colors"
          onClick={() => toggleTooltip("basic-2")}
        >
          {activeTooltips.has("basic-2") ? "Hide" : "Show"} Blue Cube
        </button>
        <button
          type="button"
          className="w-full px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition-colors"
          onClick={() => toggleTooltip("basic-3")}
        >
          {activeTooltips.has("basic-3") ? "Hide" : "Show"} Green Cube
        </button>
        <button
          type="button"
          className="w-full px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors"
          onClick={() => {
            hideAll();
            setActiveTooltips(new Set());
          }}
        >
          Hide All Tooltips
        </button>
      </div>
    </div>
  );
}

// Basic example with default positioning
export const Basic = {
  render: () => (
    <TooltipProvider>
      <TooltipHost className="w-full h-full">
        <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <OrbitControls />
          <Grid infiniteGrid rotation={[Math.PI / 2, 0, 0]} />

          <BasicMesh
            position={[-3, 0, 0]}
            color="red"
            tooltipId="basic-1"
            title="Red Cube - Left Side"
            description="This tooltip appears on the left side of the bounding box"
            side="left"
          />
          <BasicMesh
            position={[0, 0, 0]}
            color="blue"
            tooltipId="basic-2"
            title="Blue Cube - Top Side"
            description="This tooltip appears on the top side of the bounding box"
            side="top"
          />
          <BasicMesh
            position={[3, 0, 0]}
            color="green"
            tooltipId="basic-3"
            title="Green Cube - Right Side"
            description="This tooltip appears on the right side of the bounding box"
            side="right"
          />
        </Canvas>
      </TooltipHost>
    </TooltipProvider>
  ),
};

// Side positioning demonstration
function SidePositionMesh({
  position,
  color,
  side,
  label,
}: {
  position: [number, number, number];
  color: string;
  side: "top" | "right" | "bottom" | "left";
  label: string;
}) {
  const { ref, anchorId } = useTooltipAnchor({
    content: (
      <TooltipContent
        title={`${label} - ${side} side`}
        description={`This tooltip is positioned on the ${side} side of the bounding box`}
      />
    ),
    side,
    offset: 12,
  });

  const { show, hide } = useTooltipTrigger(anchorId);

  return (
    <Box
      ref={ref as unknown as React.RefObject<THREE.Mesh | null>}
      args={[1.5, 1.5, 1.5]}
      position={position}
      onPointerOver={show}
      onPointerOut={hide}
    >
      <meshStandardMaterial color={color} />
    </Box>
  );
}

export const SidePositioning = {
  render: () => (
    <TooltipProvider>
      <div className="flex h-full">
        <TooltipHost className="flex-1">
          <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <OrbitControls />
            <Grid infiniteGrid rotation={[Math.PI / 2, 0, 0]} />

            <SidePositionMesh position={[-3, 2, 0]} color="red" side="top" label="Red Cube" />
            <SidePositionMesh position={[3, 2, 0]} color="blue" side="right" label="Blue Cube" />
            <SidePositionMesh
              position={[-3, -2, 0]}
              color="green"
              side="bottom"
              label="Green Cube"
            />
            <SidePositionMesh
              position={[3, -2, 0]}
              color="orange"
              side="left"
              label="Orange Cube"
            />
          </Canvas>
        </TooltipHost>

        <div className="w-80 p-4 bg-gray-50 dark:bg-gray-900">
          <h3 className="text-lg font-semibold mb-4">Side Positioning</h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded">
              <strong className="text-red-700 dark:text-red-300">Top (Red):</strong>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Tooltip anchored to the top side of the bounding box
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded">
              <strong className="text-blue-700 dark:text-blue-300">Right (Blue):</strong>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Tooltip anchored to the right side of the bounding box
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded">
              <strong className="text-green-700 dark:text-green-300">Bottom (Green):</strong>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Tooltip anchored to the bottom side of the bounding box
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded">
              <strong className="text-orange-700 dark:text-orange-300">Left (Orange):</strong>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Tooltip anchored to the left side of the bounding box
              </p>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  ),
};

// Axis tracking modes demonstration
export const AxisTracking = {
  render: () => (
    <TooltipProvider>
      <div className="flex h-full">
        <TooltipHost className="flex-1">
          <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <OrbitControls />
            <Grid infiniteGrid rotation={[Math.PI / 2, 0, 0]} />

            <TrackingMesh position={[-3, 2, 0]} color="purple" axis="none" label="No tracking" />
            <TrackingMesh position={[3, 2, 0]} color="orange" axis="x" label="X-axis tracking" />
            <TrackingMesh position={[-3, -2, 0]} color="cyan" axis="y" label="Y-axis tracking" />
            <TrackingMesh
              position={[3, -2, 0]}
              color="pink"
              axis="both"
              label="Both axes tracking"
            />
          </Canvas>
        </TooltipHost>

        <div className="w-80 p-4 bg-gray-50 dark:bg-gray-900">
          <h3 className="text-lg font-semibold mb-4">Axis Tracking Modes</h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded">
              <strong className="text-purple-700 dark:text-purple-300">None (Purple):</strong>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Tooltip stays at bounding box position
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded">
              <strong className="text-orange-700 dark:text-orange-300">X-axis (Orange):</strong>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Follows cursor horizontally, fixed vertically
              </p>
            </div>
            <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded">
              <strong className="text-cyan-700 dark:text-cyan-300">Y-axis (Cyan):</strong>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Follows cursor vertically, fixed horizontally
              </p>
            </div>
            <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded">
              <strong className="text-pink-700 dark:text-pink-300">Both (Pink):</strong>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Tooltip follows cursor in both directions
              </p>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  ),
};

// External triggers example
export const ExternalTriggers = {
  render: () => (
    <TooltipProvider>
      <div className="flex h-full">
        <TooltipHost className="flex-1">
          <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <OrbitControls />
            <Grid infiniteGrid rotation={[Math.PI / 2, 0, 0]} />

            <BasicMesh
              position={[-3, 0, 0]}
              color="red"
              tooltipId="ext-1"
              title="Externally Triggered"
              description="This tooltip can be triggered from the control panel"
            />
            <BasicMesh
              position={[0, 0, 0]}
              color="blue"
              tooltipId="ext-2"
              title="Another External Trigger"
              description="Hover the button in the panel to show this"
            />
            <BasicMesh
              position={[3, 0, 0]}
              color="green"
              tooltipId="ext-3"
              title="Third External Trigger"
              description="External triggers use bounding box position"
            />
          </Canvas>
        </TooltipHost>

        <div className="w-80 p-4 bg-gray-50 dark:bg-gray-900 space-y-3">
          <h3 className="text-lg font-semibold mb-4">External Controls</h3>
          <ExternalControlPanel meshId="ext-1" label="Red Cube Control" />
          <ExternalControlPanel meshId="ext-2" label="Blue Cube Control" />
          <ExternalControlPanel meshId="ext-3" label="Green Cube Control" />
          <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded text-sm">
            <p className="text-yellow-800 dark:text-yellow-200">
              💡 Hover over the buttons to trigger tooltips on the 3D objects
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  ),
};

// Programmatic control example
export const ProgrammaticControl = {
  render: () => (
    <TooltipProvider>
      <div className="flex h-full">
        <TooltipHost className="flex-1">
          <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <OrbitControls />
            <Grid infiniteGrid rotation={[Math.PI / 2, 0, 0]} />

            <BasicMesh
              position={[-3, 0, 0]}
              color="red"
              tooltipId="basic-1"
              title="Red Cube"
              description="Programmatically controlled tooltip"
            />
            <BasicMesh
              position={[0, 0, 0]}
              color="blue"
              tooltipId="basic-2"
              title="Blue Cube"
              description="Can be shown at specific screen position"
            />
            <BasicMesh
              position={[3, 0, 0]}
              color="green"
              tooltipId="basic-3"
              title="Green Cube"
              description="Toggle visibility with buttons"
            />
          </Canvas>
        </TooltipHost>

        <div className="w-80 p-4 bg-gray-50 dark:bg-gray-900 space-y-3">
          <h3 className="text-lg font-semibold mb-4">Programmatic Control</h3>
          <ProgrammaticControlPanel />
          <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded text-sm">
            <p className="text-blue-800 dark:text-blue-200">
              📍 Click buttons to show tooltips anchored to their respective cubes
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  ),
};

// Manual screen positioning example
function ManualPositionMesh({
  position,
  color,
  tooltipId,
  title,
  description,
}: {
  position: [number, number, number];
  color: string;
  tooltipId: string;
  title: string;
  description: string;
}) {
  const { ref, anchorId } = useTooltipAnchor({
    id: tooltipId,
    content: (
      <div className="p-3 max-w-xs">
        <h4 className="font-semibold text-sm mb-1">{title}</h4>
        <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    ),
    side: "top",
    offset: 8,
  });

  const { show, hide } = useTooltipTrigger(anchorId);

  return (
    <Box
      ref={ref as unknown as React.RefObject<THREE.Mesh | null>}
      args={[1, 1, 1]}
      position={position}
      onPointerOver={show}
      onPointerOut={hide}
    >
      <meshStandardMaterial color={color} />
    </Box>
  );
}

function ManualPositionControlPanel() {
  const { showTooltip, hideAll } = useTooltipControls();
  const showAtPosition = (id: string, x: number, y: number) => {
    showTooltip(id, {
      screenPosition: { x, y },
      triggerId: "manual-position",
    });
  };

  return (
    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h4 className="text-sm font-medium mb-2">Manual Screen Positioning</h4>
      <div className="space-y-2">
        <button
          type="button"
          className="w-full px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded transition-colors"
          onClick={() => showAtPosition("manual-1", 200, 100)}
        >
          Show at Top Left (200, 100)
        </button>
        <button
          type="button"
          className="w-full px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded transition-colors"
          onClick={() => showAtPosition("manual-2", window.innerWidth - 200, 200)}
        >
          Show at Top Right
        </button>
        <button
          type="button"
          className="w-full px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded transition-colors"
          onClick={() =>
            showAtPosition("manual-3", window.innerWidth / 2, window.innerHeight - 150)
          }
        >
          Show at Bottom Center
        </button>
        <button
          type="button"
          className="w-full px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors"
          onClick={() => {
            hideAll();
          }}
        >
          Hide All Tooltips
        </button>
      </div>
    </div>
  );
}

export const ManualScreenPositioning = {
  render: () => (
    <TooltipProvider>
      <div className="flex h-full">
        <TooltipHost className="flex-1">
          <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <OrbitControls />
            <Grid infiniteGrid rotation={[Math.PI / 2, 0, 0]} />

            <ManualPositionMesh
              position={[-3, 0, 0]}
              color="purple"
              tooltipId="manual-1"
              title="Cube 1"
              description="This tooltip can be shown at fixed screen positions"
            />
            <ManualPositionMesh
              position={[0, 0, 0]}
              color="indigo"
              tooltipId="manual-2"
              title="Cube 2"
              description="Screen positioning overrides 3D positioning"
            />
            <ManualPositionMesh
              position={[3, 0, 0]}
              color="violet"
              tooltipId="manual-3"
              title="Cube 3"
              description="Useful for fixed UI overlays"
            />
          </Canvas>
        </TooltipHost>

        <div className="w-80 p-4 bg-gray-50 dark:bg-gray-900 space-y-3">
          <h3 className="text-lg font-semibold mb-4">Manual Screen Positioning</h3>
          <ManualPositionControlPanel />
          <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded text-sm">
            <p className="text-purple-800 dark:text-purple-200">
              📍 These tooltips appear at fixed screen coordinates, not anchored to the 3D objects.
              Useful for creating fixed UI overlays or notifications.
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  ),
};

// Multiple triggers for same anchor
function MultiTriggerMesh({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) {
  const { ref, anchorId, onPointerMove, onPointerLeave } = useTooltipAnchor({
    id: "multi-trigger",
    content: (
      <TooltipContent
        title="Multi-Trigger Tooltip"
        description="This tooltip has multiple triggers: the mesh itself, external buttons, and toggle switches"
      />
    ),
    axis: "x",
    side: "top",
  });

  const { show, hide } = useTooltipTrigger(anchorId);

  return (
    <Box
      ref={ref as unknown as React.RefObject<THREE.Mesh | null>}
      args={[3, 1, 1]}
      position={position}
      onPointerOver={show}
      onPointerOut={() => {
        hide();
        onPointerLeave?.();
      }}
      onPointerMove={onPointerMove}
    >
      <meshStandardMaterial color={color} />
    </Box>
  );
}

export const MultipleTriggers = {
  render: () => {
    const [toggleActive, setToggleActive] = useState(false);
    const { show: showToggle, hide: hideToggle } = useTooltipTrigger("multi-trigger");

    return (
      <TooltipProvider>
        <div className="flex h-full">
          <TooltipHost className="flex-1">
            <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
              <ambientLight intensity={0.8} />
              <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
              <pointLight position={[10, 10, 10]} intensity={0.8} />
              <OrbitControls />
              <Grid infiniteGrid rotation={[Math.PI / 2, 0, 0]} />

              <MultiTriggerMesh position={[0, 0, 0]} color="purple" />
            </Canvas>
          </TooltipHost>

          <div className="w-80 p-4 bg-gray-50 dark:bg-gray-900 space-y-3">
            <h3 className="text-lg font-semibold mb-4">Multiple Triggers</h3>

            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Hover Trigger</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Hover over the purple box in the scene
              </p>
            </div>

            <ExternalControlPanel meshId="multi-trigger" label="Button Trigger" />

            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Toggle Trigger</h4>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={toggleActive}
                  onChange={(e) => {
                    setToggleActive(e.target.checked);
                    if (e.target.checked) {
                      showToggle();
                    } else {
                      hideToggle();
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm">Keep tooltip visible</span>
              </label>
            </div>

            <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded text-sm">
              <p className="text-purple-800 dark:text-purple-200">
                🔗 All triggers control the same tooltip. It stays visible as long as any trigger is
                active.
              </p>
            </div>
          </div>
        </div>
      </TooltipProvider>
    );
  },
};

// Nested TooltipHost test - verifies no duplicate tooltips and correct positioning
// This story demonstrates the fix for duplicate tooltip rendering and positioning issues
// when using nested TooltipHost components.
//
// THE ISSUES (before fix):
// - Each TooltipHost rendered its own TooltipPortal → duplicate tooltips
// - Nested host tooltips used wrong coordinate system → tooltips appeared in wrong position
// - Example: Yellow cube's tooltip appeared over green cube's position
//
// THE FIX:
// 1. Only the root TooltipHost (level 0) renders the TooltipPortal (prevents duplicates)
// 2. Nested TooltipHosts provide context but don't create portals
// 3. Tooltip anchors calculate positions in two steps:
//    a. Get position relative to immediate container (for accurate canvas coordinates)
//    b. Transform to root container coordinates (where portal is rendered)
// 4. This coordinate transformation ensures tooltips appear at correct positions
function NestedHostMesh({
  position,
  color,
  tooltipId,
  label,
}: {
  position: [number, number, number];
  color: string;
  tooltipId: string;
  label: string;
}) {
  const { ref, anchorId } = useTooltipAnchor({
    id: tooltipId,
    content: (
      <TooltipContent
        title={`${label} - Testing Nested Hosts`}
        description="This tooltip should only appear once, even with nested TooltipHost components"
      />
    ),
    side: "top",
    offset: 12,
  });

  const { show, hide } = useTooltipTrigger(anchorId);

  return (
    <Box
      ref={ref as unknown as React.RefObject<THREE.Mesh | null>}
      args={[1.5, 1.5, 1.5]}
      position={position}
      onPointerOver={show}
      onPointerOut={hide}
    >
      <meshStandardMaterial color={color} />
    </Box>
  );
}

// Component with its own TooltipHost (nested)
// This simulates a real-world scenario where a component might wrap its content
// with TooltipHost (e.g., a reusable canvas component or panel)
// With the fix:
// - This nested host won't create a duplicate portal
// - Tooltips calculate positions relative to this container, then transform to root coordinates
function NestedCanvas({ children }: { children: React.ReactNode }) {
  return (
    <TooltipHost className="w-full h-full">
      <div className="w-full h-full relative border-2 border-yellow-500">
        <div className="absolute top-4 left-4 z-10 bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded text-xs">
          <strong>⚠️ Nested TooltipHost</strong>
          <p>This canvas has its own TooltipHost wrapper</p>
          <p className="text-red-600 dark:text-red-400 mt-1">
            With fix: Portal only at root, coordinates transformed
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            (level=1, no portal but provides positioning context)
          </p>
        </div>
        {children}
      </div>
    </TooltipHost>
  );
}

// Story that demonstrates the nested TooltipHost fix
// Tests that tooltips work correctly even when TooltipHost components are nested
// Key verification points:
// 1. No duplicate tooltips appear
// 2. Tooltips are correctly positioned above their respective cubes
// 3. Both canvases work identically despite different nesting
export const NestedTooltipHosts = {
  render: () => (
    <TooltipProvider>
      <div className="flex h-full">
        {/* Root TooltipHost */}
        <TooltipHost className="flex-1">
          <div className="grid grid-cols-2 h-full gap-2">
            {/* Left side: Canvas without nested host */}
            <div className="relative border-2 border-green-500">
              <div className="absolute top-4 left-4 z-10 bg-green-100 dark:bg-green-900/30 p-2 rounded text-xs">
                <strong>✓ No Nested Host</strong>
                <p>Using root TooltipHost only</p>
              </div>
              <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
                <OrbitControls />
                <Grid infiniteGrid rotation={[Math.PI / 2, 0, 0]} />

                <NestedHostMesh
                  position={[-1, 0, 0]}
                  color="green"
                  tooltipId="no-nest-1"
                  label="Green Cube (Left)"
                />
                <NestedHostMesh
                  position={[1, 0, 0]}
                  color="lime"
                  tooltipId="no-nest-2"
                  label="Lime Cube (Right)"
                />
              </Canvas>
            </div>

            {/* Right side: Canvas with nested host */}
            <NestedCanvas>
              <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
                <OrbitControls />
                <Grid infiniteGrid rotation={[Math.PI / 2, 0, 0]} />

                <NestedHostMesh
                  position={[-1, 0, 0]}
                  color="yellow"
                  tooltipId="nested-1"
                  label="Yellow Cube (Left)"
                />
                <NestedHostMesh
                  position={[1, 0, 0]}
                  color="orange"
                  tooltipId="nested-2"
                  label="Orange Cube (Right)"
                />
              </Canvas>
            </NestedCanvas>
          </div>
        </TooltipHost>

        <div className="w-80 p-4 bg-gray-50 dark:bg-gray-900">
          <h3 className="text-lg font-semibold mb-4">Nested TooltipHost Test</h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded">
              <strong className="text-blue-700 dark:text-blue-300">Expected Behavior:</strong>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                All cubes should show tooltips correctly positioned above them
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">• No duplicate tooltips</p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                • Correct positioning even with nested hosts
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded">
              <strong className="text-green-700 dark:text-green-300">
                Left Canvas (Green Border):
              </strong>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Uses only the root TooltipHost. Has green and lime cubes.
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded">
              <strong className="text-yellow-700 dark:text-yellow-300">
                Right Canvas (Yellow Border):
              </strong>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Has its own nested TooltipHost wrapper. Has yellow and orange cubes.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                With the fix: Coordinates are transformed from nested → root container space
              </p>
            </div>
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded">
              <strong className="text-red-700 dark:text-red-300">🔍 Test:</strong>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Hover over all four cubes:</p>
              <ul className="text-gray-600 dark:text-gray-400 mt-1 ml-4 list-disc">
                <li>Each tooltip should appear directly above its cube</li>
                <li>No duplicate tooltips should appear</li>
                <li>
                  Yellow/orange cube tooltips should be correctly positioned (not over green/lime)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  ),
};
