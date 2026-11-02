---
"@semio/ui": minor
---

The default icon registry contains generic ui icons only. Domain keys and their
glyph components and prop types belong to `@semio/timeline-editor` or the consuming
application. Removed keys by owner:

- `@semio/timeline-editor`: `angle`, `bezier`, `bounce`, `data-binary`, `data-vector2`, `data-vector3`, `graph-view`, `key`, `move-player-end-bounds`, `move-playhead`, `playback-0.1`, `playback-0.5`, `playback-1.0`, `playback-1.5`, `playback-2.0`, `player-end-bounds`, `rotate-3d`, `time-display-frames`, `time-display-milliseconds`, `time-display-seconds`, `time-display-seconds-frames`, `time-display-ticks`, `vector-angled`, `vector-back`, `vector-bezier`, `vector-bezier-auto-clamp`, `vector-bezier-handles`, `vector-circ`, `vector-cubic`, `vector-expo`, `vector-flat`, `vector-linear`, `vector-quad`, `vector-quart`, `vector-quint`, `vector-sine`, `vertex-free`, `vertex-indeterminate`, `vertex-paired`, `vertical-normalize`, `vertical-uniform`.
- the consuming application: `box-plus`, `file-type-ani`, `file-type-face`, `file-type-mod`, `hand`, `project`, `robot`, `sphere`, `videocamera-off`, `world`, `shopping-bag`, `rotate2`, `line`, `pencil`, `pinned`, `transform-point`, `view360`.
- pruned: `fast`, `filter-box`, `frame`, `hexagon`, `normalized`, `player-next-key`, `player-play`, `player-play2`, `preview-view`, `robot-plus`, `slow`, `uniform`, `vector-bezier-insert-flat`, `vector-bezier-insert-sloped`, `chevron-up`, `clipboard-plus`, `needs-attention`.

Removed components and types by owner:

- `@semio/timeline-editor`: `IconBezier`, `IconDataVector2`, `IconDataVector3`, `Angle`, `Bounce`, `IconDataBinary`, `IconGraphViewProps`, `IconGraphView`, `IconKeyProps`, `IconKey`, `MovePlayerEndBounds`, `MovePlayhead`, `Playback01x`, `Playback05x`, `Playback10x`, `Playback15x`, `Playback20x`, `PlayerEndBounds`, `IconRotate3d`, `IconTimeDisplayFrames`, `IconTimeDisplayMilliseconds`, `IconTimeDisplaySeconds`, `IconTimeDisplaySecondsFrames`, `IconTimeDisplayTicks`, `IconVectorAngledProps`, `IconVectorAngled`, `IconVectorTransitionCurveProps`, `IconVectorLinear`, `IconVectorSine`, `IconVectorQuad`, `IconVectorCubic`, `IconVectorQuart`, `IconVectorQuint`, `IconVectorCirc`, `IconVectorExpo`, `IconVectorBack`, `IconVectorBezierProps`, `IconVectorBezier`, `IconVectorBezierAutoClampProps`, `IconVectorBezierAutoClamp`, `IconVectorBezierHandlesProps`, `IconVectorBezierHandles`, `IconVectorFlatProps`, `IconVectorFlat`, `IconVertexFreeProps`, `IconVertexFree`, `IconVertexIndeterminateProps`, `IconVertexIndeterminate`, `IconVertexPairedProps`, `IconVertexPaired`, `IconVerticalNormalizeProps`, `IconVerticalNormalize`, `IconVerticalUniformProps`, `IconVerticalUniform`, `KeyIconProps`, `KeyIcon`, `IconHandleIndicatorProps`, `IconHandleIndicator`.
- the consuming application: `IconBoxPlus`, `IconFileTypeAni`, `IconFileTypeFace`, `IconFileTypeMod`, `IconHand`, `IconProjectProps`, `IconProject`, `IconRobotProps`, `IconRobot`, `IconSphere`, `IconVideocameraOff`, `WorldElementIcon`.
- pruned: `IconFrame`, `IconHexagon`, `Fast`, `IconFilterBox`, `IconNormalizedProps`, `IconNormalized`, `IconPlayerNextKey`, `IconPlayerPlay`, `IconPlayerPlay2`, `IconPreviewViewProps`, `IconPreviewView`, `IconRobotPlusProps`, `IconRobotPlus`, `Slow`, `IconUniformProps`, `IconUniform`, `IconVectorBezierInsertFlatProps`, `IconVectorBezierInsertFlat`, `IconVectorBezierInsertSlopedProps`, `IconVectorBezierInsertSloped`, `IconPlayPauseProps`, `IconPlayPause`, `IconVariantProps`, `IconVariant`.

`glyphIconRegistry` is the public name of the library's drawn glyph registry,
with its generated module named `glyph.generated.ts`. `semioIconRegistry` has no
compatibility alias. The generic `fit-vertical` glyph uses the `fit-horizontal`
artwork rotated 90°. Ui's Figma manifest lists only ui's keys; component names are
`Icon/<key>` in the shared Figma library.
