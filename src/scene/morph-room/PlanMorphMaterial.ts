import { Color, DoubleSide, GLSL3, ShaderMaterial, Vector2, Vector3 } from 'three'

const vertexShader = /* glsl */ `
  varying vec3 vLocalPosition;

  void main() {
    vLocalPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform mat4 projectionMatrix;
  uniform mat4 modelViewMatrix;
  uniform vec3 uCameraLocal;
  uniform vec3 uBaseColor;
  uniform vec3 uHighlightColor;
  uniform vec3 uShadowColor;
  uniform float uMonochromeMix;
  uniform float uRoomOpacity;
  uniform float uPropOpacity;
  uniform float uFrontWallOpacity;
  uniform float uFrontWallThreshold;
  uniform float uArchitectureActivation;
  uniform float uFurnitureSinkProgress;
  uniform float uReveal;
  uniform float uTime;
  uniform float uFilmGrain;
  uniform float uFilmFlicker;
  uniform float uFilmTemporalEnabled;
  uniform float uStabilityVariant;
  uniform float uStabilityDebugView;
  uniform float uWaverAmount;
  uniform float uWaverScale;
  uniform float uWaverSpeed;
  uniform float uRippleAmount;
  uniform float uRippleRadius;
  uniform float uRippleAge;
  uniform vec2 uRippleOrigin;
  uniform float uNightLookEnabled;
  uniform float uNightLookMix;
  uniform float uNightExposure;
  uniform float uNightShadowLift;
  uniform float uNightLocalGrain;
  uniform vec2 uNightResolution;
  uniform float uNightVignetteStrength;
  uniform float uNightVignetteSoftness;
  uniform float uNightVignetteIrregularity;
  uniform vec2 uNightVignetteOffset;
  uniform float uNightBloomStrength;
  uniform float uNightBloomRadius;
  uniform float uNightBloomCore;
  uniform float uNightDebugView;

  varying vec3 vLocalPosition;
  out vec4 fragColor;

  const float ROOM_WIDTH = 4.128;
  const float ROOM_DEPTH = 2.832;
  const float ROOM_HEIGHT = 2.640;
  const float HALF_WIDTH = ROOM_WIDTH * 0.5;
  const float HALF_DEPTH = ROOM_DEPTH * 0.5;
  const float HALF_HEIGHT = ROOM_HEIGHT * 0.5;
  const float WALL_HALF = 0.072;
  const float FLOOR_Y = -HALF_HEIGHT;
  const float EXTENSION_START_X = -0.360;
  const float EXTENSION_DEPTH = 1.141;
  const float EXTENSION_END_Z = HALF_DEPTH + EXTENSION_DEPTH;
  const float CLOSET_DIVIDER_X = 0.568;

  float sdBox(vec3 point, vec3 halfSize) {
    vec3 distanceToEdge = abs(point) - halfSize;
    return length(max(distanceToEdge, 0.0)) + min(max(distanceToEdge.x, max(distanceToEdge.y, distanceToEdge.z)), 0.0);
  }

  float sdRoundBox(vec3 point, vec3 halfSize, float radius) {
    vec3 distanceToEdge = abs(point) - halfSize + radius;
    return min(max(distanceToEdge.x, max(distanceToEdge.y, distanceToEdge.z)), 0.0)
      + length(max(distanceToEdge, 0.0)) - radius;
  }

  float sdFastBox(vec3 point, vec3 halfSize) {
    vec3 distanceToEdge = abs(point) - halfSize;
    return max(distanceToEdge.x, max(distanceToEdge.y, distanceToEdge.z));
  }

  float sdEllipsoid(vec3 point, vec3 radius) {
    float firstLength = length(point / radius);
    float secondLength = length(point / (radius * radius));
    return firstLength * (firstLength - 1.0) / max(secondLength, 0.0001);
  }

  float sdCapsule(vec3 point, vec3 start, vec3 end, float radius) {
    vec3 pointOffset = point - start;
    vec3 segment = end - start;
    float projection = clamp(dot(pointOffset, segment) / dot(segment, segment), 0.0, 1.0);
    return length(pointOffset - segment * projection) - radius;
  }

  float sdCappedCylinderY(vec3 point, float halfHeight, float radius) {
    vec2 distanceToEdge = abs(vec2(length(point.xz), point.y)) - vec2(radius, halfHeight);
    return min(max(distanceToEdge.x, distanceToEdge.y), 0.0) + length(max(distanceToEdge, 0.0));
  }

  float sdTorusY(vec3 point, vec2 radius) {
    return length(vec2(length(point.xz) - radius.x, point.y)) - radius.y;
  }

  vec3 rotateY(vec3 point, float angle) {
    float cosine = cos(angle);
    float sine = sin(angle);
    return vec3(
      cosine * point.x + sine * point.z,
      point.y,
      -sine * point.x + cosine * point.z
    );
  }

  float smoothUnion(float firstDistance, float secondDistance, float blendRadius) {
    float blend = clamp(0.5 + 0.5 * (secondDistance - firstDistance) / blendRadius, 0.0, 1.0);
    return mix(secondDistance, firstDistance, blend) - blendRadius * blend * (1.0 - blend);
  }

  float horizontalWall(vec3 point, float centerX, float halfX, float centerY, float halfY, float centerZ) {
    return sdRoundBox(
      point - vec3(centerX, centerY, centerZ),
      vec3(max(halfX, 0.001), max(halfY, 0.001), WALL_HALF),
      0.035
    );
  }

  float verticalWall(vec3 point, float centerZ, float halfZ, float centerY, float halfY, float centerX) {
    return sdRoundBox(
      point - vec3(centerX, centerY, centerZ),
      vec3(WALL_HALF, max(halfY, 0.001), max(halfZ, 0.001)),
      0.035
    );
  }

  float buildingFloorField(vec3 point) {
    float mainFloor = sdRoundBox(
      point - vec3(0.0, FLOOR_Y - WALL_HALF, 0.0),
      vec3(HALF_WIDTH, WALL_HALF, HALF_DEPTH),
      0.045
    );
    float extensionHalfWidth = (HALF_WIDTH - EXTENSION_START_X) * 0.5;
    float extensionCenterX = (HALF_WIDTH + EXTENSION_START_X) * 0.5;
    // Carry the extension underneath the main slab. Two coplanar slabs that
    // merely touch at HALF_DEPTH can expose their SDF transition as a hairline.
    const float floorOverlap = 0.16;
    float extensionStartZ = HALF_DEPTH - floorOverlap;
    float extensionHalfDepth = (EXTENSION_END_Z - extensionStartZ) * 0.5;
    float extensionCenterZ = (EXTENSION_END_Z + extensionStartZ) * 0.5;
    float extensionFloor = sdRoundBox(
      point - vec3(extensionCenterX, FLOOR_Y - WALL_HALF, extensionCenterZ),
      vec3(extensionHalfWidth, WALL_HALF, extensionHalfDepth),
      0.045
    );
    return min(mainFloor, extensionFloor);
  }

  float buildingWallField(vec3 point) {
    const float windowOneCenter = -1.234;
    const float windowOneHalfWidth = ROOM_WIDTH / 6.0;
    const float windowTwoCenter = -0.425;
    const float windowTwoHalfWidth = ROOM_DEPTH / 6.0;
    const float windowHalfHeight = ROOM_HEIGHT / 6.0;
    const float doorCenter = 1.459;
    const float doorHalfWidth = 0.338;
    const float doorTop = 0.700;

    float backLeftEnd = windowOneCenter - windowOneHalfWidth;
    float backRightStart = windowOneCenter + windowOneHalfWidth;
    float backWall = horizontalWall(point, (-HALF_WIDTH + backLeftEnd) * 0.5, (backLeftEnd + HALF_WIDTH) * 0.5, 0.0, HALF_HEIGHT, -HALF_DEPTH);
    backWall = smoothUnion(backWall, horizontalWall(point, (backRightStart + HALF_WIDTH) * 0.5, (HALF_WIDTH - backRightStart) * 0.5, 0.0, HALF_HEIGHT, -HALF_DEPTH), 0.065);
    backWall = smoothUnion(backWall, horizontalWall(point, windowOneCenter, windowOneHalfWidth, (-HALF_HEIGHT - windowHalfHeight) * 0.5, (HALF_HEIGHT - windowHalfHeight) * 0.5, -HALF_DEPTH), 0.065);
    backWall = smoothUnion(backWall, horizontalWall(point, windowOneCenter, windowOneHalfWidth, (HALF_HEIGHT + windowHalfHeight) * 0.5, (HALF_HEIGHT - windowHalfHeight) * 0.5, -HALF_DEPTH), 0.065);

    float leftBackEnd = windowTwoCenter - windowTwoHalfWidth;
    float leftFrontStart = windowTwoCenter + windowTwoHalfWidth;
    float leftWall = verticalWall(point, (-HALF_DEPTH + leftBackEnd) * 0.5, (leftBackEnd + HALF_DEPTH) * 0.5, 0.0, HALF_HEIGHT, -HALF_WIDTH);
    leftWall = smoothUnion(leftWall, verticalWall(point, (leftFrontStart + HALF_DEPTH) * 0.5, (HALF_DEPTH - leftFrontStart) * 0.5, 0.0, HALF_HEIGHT, -HALF_WIDTH), 0.065);
    leftWall = smoothUnion(leftWall, verticalWall(point, windowTwoCenter, windowTwoHalfWidth, (-HALF_HEIGHT - windowHalfHeight) * 0.5, (HALF_HEIGHT - windowHalfHeight) * 0.5, -HALF_WIDTH), 0.065);
    leftWall = smoothUnion(leftWall, verticalWall(point, windowTwoCenter, windowTwoHalfWidth, (HALF_HEIGHT + windowHalfHeight) * 0.5, (HALF_HEIGHT - windowHalfHeight) * 0.5, -HALF_WIDTH), 0.065);

    float distance = min(backWall, leftWall);

    distance = min(distance, verticalWall(point, (-HALF_DEPTH + EXTENSION_END_Z) * 0.5, (EXTENSION_END_Z + HALF_DEPTH) * 0.5, 0.0, HALF_HEIGHT, HALF_WIDTH));
    distance = min(distance, horizontalWall(point, (-HALF_WIDTH + EXTENSION_START_X) * 0.5, (EXTENSION_START_X + HALF_WIDTH) * 0.5, 0.0, HALF_HEIGHT, HALF_DEPTH));
    distance = min(distance, verticalWall(point, (HALF_DEPTH + EXTENSION_END_Z) * 0.5, EXTENSION_DEPTH * 0.5, 0.0, HALF_HEIGHT, EXTENSION_START_X));
    distance = min(distance, verticalWall(point, (HALF_DEPTH + EXTENSION_END_Z) * 0.5, EXTENSION_DEPTH * 0.5, 0.0, HALF_HEIGHT, CLOSET_DIVIDER_X));

    float doorLeftEnd = doorCenter - doorHalfWidth;
    float doorRightStart = doorCenter + doorHalfWidth;
    float doorWall = horizontalWall(point, (EXTENSION_START_X + doorLeftEnd) * 0.5, (doorLeftEnd - EXTENSION_START_X) * 0.5, 0.0, HALF_HEIGHT, EXTENSION_END_Z);
    doorWall = smoothUnion(doorWall, horizontalWall(point, (doorRightStart + HALF_WIDTH) * 0.5, (HALF_WIDTH - doorRightStart) * 0.5, 0.0, HALF_HEIGHT, EXTENSION_END_Z), 0.065);
    doorWall = smoothUnion(doorWall, horizontalWall(point, doorCenter, doorHalfWidth, (doorTop + HALF_HEIGHT) * 0.5, (HALF_HEIGHT - doorTop) * 0.5, EXTENSION_END_Z), 0.065);
    distance = min(distance, doorWall);
    return distance;
  }

  float openingFrameField(vec3 point) {
    float activation = uArchitectureActivation;
    float frameThickness = mix(0.018, 0.060, activation);
    float frameDepth = mix(WALL_HALF, 0.095, activation);
    float retreat = (1.0 - activation) * 0.16;
    const float windowHalfHeight = ROOM_HEIGHT / 6.0;

    const float windowOneCenter = -1.234;
    const float windowOneHalfWidth = ROOM_WIDTH / 6.0;
    float windowOneZ = -HALF_DEPTH;
    float frame = sdRoundBox(point - vec3(windowOneCenter - windowOneHalfWidth, 0.0, windowOneZ), vec3(frameThickness, windowHalfHeight + frameThickness, frameDepth), 0.035);
    frame = smoothUnion(frame, sdRoundBox(point - vec3(windowOneCenter + windowOneHalfWidth, 0.0, windowOneZ), vec3(frameThickness, windowHalfHeight + frameThickness, frameDepth), 0.035), 0.030);
    frame = smoothUnion(frame, sdRoundBox(point - vec3(windowOneCenter, -windowHalfHeight, windowOneZ), vec3(windowOneHalfWidth, frameThickness, frameDepth), 0.035), 0.030);
    frame = smoothUnion(frame, sdRoundBox(point - vec3(windowOneCenter, windowHalfHeight, windowOneZ), vec3(windowOneHalfWidth, frameThickness, frameDepth), 0.035), 0.030);

    const float windowTwoCenter = -0.425;
    const float windowTwoHalfWidth = ROOM_DEPTH / 6.0;
    float windowTwoX = -HALF_WIDTH;
    float secondFrame = sdRoundBox(point - vec3(windowTwoX, 0.0, windowTwoCenter - windowTwoHalfWidth), vec3(frameDepth, windowHalfHeight + frameThickness, frameThickness), 0.035);
    secondFrame = smoothUnion(secondFrame, sdRoundBox(point - vec3(windowTwoX, 0.0, windowTwoCenter + windowTwoHalfWidth), vec3(frameDepth, windowHalfHeight + frameThickness, frameThickness), 0.035), 0.030);
    secondFrame = smoothUnion(secondFrame, sdRoundBox(point - vec3(windowTwoX, -windowHalfHeight, windowTwoCenter), vec3(frameDepth, frameThickness, windowTwoHalfWidth), 0.035), 0.030);
    secondFrame = smoothUnion(secondFrame, sdRoundBox(point - vec3(windowTwoX, windowHalfHeight, windowTwoCenter), vec3(frameDepth, frameThickness, windowTwoHalfWidth), 0.035), 0.030);
    frame = min(frame, secondFrame);

    const float doorCenter = 1.459;
    const float doorHalfWidth = 0.338;
    const float doorTop = 0.700;
    float doorZ = EXTENSION_END_Z;
    float doorCenterY = (FLOOR_Y + doorTop) * 0.5;
    float doorHalfHeight = (doorTop - FLOOR_Y) * 0.5;
    float doorFrame = sdRoundBox(point - vec3(doorCenter - doorHalfWidth, doorCenterY, doorZ), vec3(frameThickness, doorHalfHeight + frameThickness, frameDepth), 0.035);
    doorFrame = smoothUnion(doorFrame, sdRoundBox(point - vec3(doorCenter + doorHalfWidth, doorCenterY, doorZ), vec3(frameThickness, doorHalfHeight + frameThickness, frameDepth), 0.035), 0.030);
    doorFrame = smoothUnion(doorFrame, sdRoundBox(point - vec3(doorCenter, doorTop, doorZ), vec3(doorHalfWidth, frameThickness, frameDepth), 0.035), 0.030);
    frame = min(frame, doorFrame);
    return frame + retreat;
  }

  float detachedTreeField(vec3 point) {
    float activation = uArchitectureActivation;
    const float treeScale = 1.02;
    vec3 localPoint = (point - vec3(-1.100, FLOOR_Y, 1.990)) / treeScale;
    float treeBounds = sdEllipsoid(
      localPoint - vec3(0.0, 1.22 * activation, 0.0),
      mix(vec3(0.12), vec3(0.68, 2.48, 0.58), activation)
    );
    if (treeBounds > 0.34) return (treeBounds + (1.0 - activation) * 0.28) * treeScale;

    float lowerRadius = mix(0.024, 0.145, activation);
    float tree = sdCapsule(
      localPoint,
      vec3(-0.012, -0.060, 0.018) * activation,
      vec3(0.006, 0.700, 0.004) * activation,
      lowerRadius
    );
    float middleTrunk = sdCapsule(
      localPoint,
      vec3(0.004, 0.420, 0.006) * activation,
      vec3(0.020, 1.220, -0.010) * activation,
      mix(0.022, 0.105, activation)
    );
    tree = smoothUnion(tree, middleTrunk, 0.085 * activation + 0.006);
    float upperTrunk = sdCapsule(
      localPoint,
      vec3(0.018, 0.940, -0.008) * activation,
      vec3(-0.015, 1.690, 0.010) * activation,
      mix(0.020, 0.073, activation)
    );
    tree = smoothUnion(tree, upperTrunk, 0.070 * activation + 0.006);

    vec3 crownRadius = mix(vec3(0.055), vec3(0.41, 0.61, 0.35), activation);
    float crown = sdEllipsoid(
      localPoint - vec3(-0.025, 2.030, 0.0) * activation,
      crownRadius
    );
    float lowerCrown = sdEllipsoid(
      localPoint - vec3(-0.245, 1.830, 0.060) * activation,
      mix(vec3(0.050), vec3(0.300, 0.365, 0.300), activation)
    );
    crown = smoothUnion(crown, lowerCrown, 0.150 * activation + 0.008);
    float sideCrown = sdEllipsoid(
      localPoint - vec3(0.235, 1.900, -0.045) * activation,
      mix(vec3(0.048), vec3(0.270, 0.340, 0.270), activation)
    );
    crown = smoothUnion(crown, sideCrown, 0.140 * activation + 0.008);
    tree = smoothUnion(tree, crown, 0.110 * activation + 0.008);
    return (tree + (1.0 - activation) * 0.28) * treeScale;
  }

  float furnitureSink(float delay) {
    return smoothstep(delay, 1.0, uFurnitureSinkProgress) * 1.58;
  }

  float flowerpotField(vec3 point) {
    vec3 localPoint = point - vec3(-1.57, FLOOR_Y + 0.82 - furnitureSink(0.10), -1.19);
    float bounds = sdFastBox(localPoint - vec3(0.0, 0.23, 0.0), vec3(0.27, 0.52, 0.27));
    if (bounds > 0.24) return bounds;

    float pot = sdCappedCylinderY(localPoint, 0.13, 0.13);
    pot = smoothUnion(pot, sdTorusY(localPoint - vec3(0.0, 0.13, 0.0), vec2(0.13, 0.025)), 0.022);
    float plant = sdCapsule(localPoint, vec3(0.0, 0.12, 0.0), vec3(-0.03, 0.44, 0.01), 0.018);
    plant = min(plant, sdCapsule(localPoint, vec3(-0.01, 0.25, 0.0), vec3(-0.13, 0.38, 0.03), 0.014));
    plant = min(plant, sdCapsule(localPoint, vec3(-0.01, 0.29, 0.0), vec3(0.14, 0.43, -0.02), 0.014));
    plant = smoothUnion(plant, sdEllipsoid(localPoint - vec3(-0.15, 0.40, 0.03), vec3(0.11, 0.045, 0.065)), 0.025);
    plant = smoothUnion(plant, sdEllipsoid(localPoint - vec3(0.16, 0.45, -0.02), vec3(0.12, 0.050, 0.070)), 0.025);
    plant = smoothUnion(plant, sdEllipsoid(localPoint - vec3(-0.02, 0.49, 0.0), vec3(0.09, 0.055, 0.075)), 0.025);
    return min(pot, plant);
  }

  float deskAndChairField(vec3 point) {
    vec3 deskPoint = point - vec3(-1.08, FLOOR_Y - furnitureSink(0.00), -0.79);
    float bounds = sdFastBox(deskPoint - vec3(0.16, 0.46, 0.17), vec3(0.92, 0.60, 0.84));
    if (bounds > 0.28) return bounds;

    float desk = sdRoundBox(deskPoint - vec3(0.0, 0.72, 0.0), vec3(0.59, 0.055, 0.28), 0.045);
    desk = min(desk, sdCapsule(deskPoint, vec3(-0.49, 0.06, -0.19), vec3(-0.49, 0.67, -0.19), 0.042));
    desk = min(desk, sdCapsule(deskPoint, vec3(0.49, 0.06, -0.19), vec3(0.49, 0.67, -0.19), 0.042));
    desk = min(desk, sdCapsule(deskPoint, vec3(-0.49, 0.06, 0.19), vec3(-0.49, 0.67, 0.19), 0.042));
    desk = min(desk, sdCapsule(deskPoint, vec3(0.49, 0.06, 0.19), vec3(0.49, 0.67, 0.19), 0.042));
    desk = min(desk, sdRoundBox(deskPoint - vec3(0.0, 0.625, 0.23), vec3(0.32, 0.075, 0.055), 0.025));

    vec3 chairPoint = rotateY(deskPoint - vec3(0.68, 0.0, 0.58), -0.16);
    float chair = sdRoundBox(chairPoint - vec3(0.0, 0.40, 0.0), vec3(0.23, 0.055, 0.22), 0.055);
    chair = min(chair, sdRoundBox(chairPoint - vec3(0.0, 0.67, 0.17), vec3(0.23, 0.25, 0.045), 0.065));
    chair = min(chair, sdCapsule(chairPoint, vec3(-0.17, 0.04, -0.14), vec3(-0.17, 0.35, -0.14), 0.032));
    chair = min(chair, sdCapsule(chairPoint, vec3(0.17, 0.04, -0.14), vec3(0.17, 0.35, -0.14), 0.032));
    chair = min(chair, sdCapsule(chairPoint, vec3(-0.17, 0.04, 0.14), vec3(-0.17, 0.35, 0.14), 0.032));
    chair = min(chair, sdCapsule(chairPoint, vec3(0.17, 0.04, 0.14), vec3(0.17, 0.35, 0.14), 0.032));
    return min(desk, chair);
  }

  float catBedField(vec3 point) {
    vec3 localPoint = rotateY(
      point - vec3(-1.64, FLOOR_Y - furnitureSink(0.05), 0.37),
      -0.22
    );
    float bounds = sdFastBox(localPoint - vec3(0.0, 0.21, 0.0), vec3(0.48, 0.34, 0.44));
    if (bounds > 0.24) return bounds;

    float cushion = sdEllipsoid(localPoint - vec3(0.0, 0.10, 0.02), vec3(0.31, 0.075, 0.27));
    float bolsters = sdCapsule(localPoint, vec3(-0.30, 0.12, -0.20), vec3(-0.30, 0.15, 0.18), 0.09);
    bolsters = smoothUnion(bolsters, sdCapsule(localPoint, vec3(0.30, 0.12, -0.20), vec3(0.30, 0.15, 0.18), 0.09), 0.055);
    bolsters = smoothUnion(bolsters, sdCapsule(localPoint, vec3(-0.25, 0.17, 0.22), vec3(0.25, 0.17, 0.22), 0.10), 0.065);
    float halfHood = sdTorusY(localPoint - vec3(0.0, 0.25, 0.18), vec2(0.27, 0.055));
    halfHood = max(halfHood, -localPoint.z + 0.09);
    return min(cushion, min(bolsters, halfHood));
  }

  float bedField(vec3 point) {
    vec3 localPoint = point - vec3(1.48, FLOOR_Y - furnitureSink(0.02), 0.21);
    float bounds = sdFastBox(localPoint - vec3(0.0, 0.34, 0.0), vec3(0.59, 0.56, 1.04));
    if (bounds > 0.28) return bounds;

    float bed = sdRoundBox(localPoint - vec3(0.0, 0.15, 0.0), vec3(0.46, 0.15, 0.86), 0.08);
    bed = smoothUnion(bed, sdRoundBox(localPoint - vec3(0.0, 0.34, 0.02), vec3(0.43, 0.13, 0.81), 0.10), 0.055);
    bed = min(bed, sdRoundBox(localPoint - vec3(0.0, 0.48, -0.78), vec3(0.47, 0.43, 0.065), 0.075));
    float pillow = sdEllipsoid(localPoint - vec3(0.0, 0.51, -0.56), vec3(0.32, 0.09, 0.20));
    float blanket = sdRoundBox(localPoint - vec3(0.0, 0.48, 0.26), vec3(0.40, 0.055, 0.46), 0.07);
    blanket = smoothUnion(blanket, sdCapsule(localPoint, vec3(-0.39, 0.46, -0.18), vec3(0.39, 0.46, -0.18), 0.045), 0.035);
    return min(bed, min(pillow, blanket));
  }

  float cabinetField(vec3 point) {
    vec3 localPoint = point - vec3(1.64, FLOOR_Y - furnitureSink(0.08), -1.06);
    float bounds = sdFastBox(localPoint - vec3(0.0, 0.59, 0.0), vec3(0.50, 0.72, 0.40));
    if (bounds > 0.26) return bounds;

    float cabinet = sdRoundBox(localPoint - vec3(0.0, 0.62, 0.0), vec3(0.32, 0.57, 0.23), 0.055);
    cabinet = min(cabinet, sdRoundBox(localPoint - vec3(-0.325, 0.78, 0.0), vec3(0.025, 0.35, 0.205), 0.018));
    cabinet = min(cabinet, sdRoundBox(localPoint - vec3(-0.325, 0.33, 0.0), vec3(0.025, 0.075, 0.205), 0.018));
    cabinet = min(cabinet, sdCapsule(localPoint, vec3(-0.36, 0.70, -0.07), vec3(-0.36, 0.86, -0.07), 0.018));
    cabinet = min(cabinet, sdCapsule(localPoint, vec3(-0.36, 0.70, 0.07), vec3(-0.36, 0.86, 0.07), 0.018));
    cabinet = min(cabinet, sdCapsule(localPoint, vec3(-0.24, 0.03, -0.15), vec3(-0.24, 0.08, -0.15), 0.035));
    cabinet = min(cabinet, sdCapsule(localPoint, vec3(-0.24, 0.03, 0.15), vec3(-0.24, 0.08, 0.15), 0.035));
    cabinet = min(cabinet, sdCapsule(localPoint, vec3(0.24, 0.03, -0.15), vec3(0.24, 0.08, -0.15), 0.035));
    cabinet = min(cabinet, sdCapsule(localPoint, vec3(0.24, 0.03, 0.15), vec3(0.24, 0.08, 0.15), 0.035));
    return cabinet;
  }

  float furnitureField(vec3 point) {
    float furniture = flowerpotField(point);
    furniture = min(furniture, deskAndChairField(point));
    furniture = min(furniture, catBedField(point));
    furniture = min(furniture, bedField(point));
    furniture = min(furniture, cabinetField(point));
    return furniture;
  }

  vec3 deformedScenePoint(vec3 point) {
    float meltHeight = smoothstep(FLOOR_Y + 0.10, HALF_HEIGHT, point.y);
    float meltFlow = 0.58
      + sin(point.x * 1.72 + sin(point.z * 1.28) + uTime * 0.035) * 0.24
      + sin(point.z * 2.36 - point.x * 0.44 - uTime * 0.021) * 0.12;
    vec3 deformedPoint = point;
    deformedPoint.y += meltHeight * meltFlow * uWaverAmount * 3.15;
    deformedPoint.x += sin(point.y * 2.1 + point.z * 1.35) * meltHeight * uWaverAmount * 0.42;
    return deformedPoint;
  }

  vec4 evaluateSceneField(vec3 point, float cutawayNearWalls) {
    vec3 meltedPoint = deformedScenePoint(point);

    float architectureHeight = mix(0.065, 1.0, uArchitectureActivation);
    vec3 collapsedPoint = meltedPoint;
    collapsedPoint.y = FLOOR_Y + (meltedPoint.y - FLOOR_Y) / architectureHeight;

    float floorDistance = buildingFloorField(meltedPoint)
      + (1.0 - uArchitectureActivation) * 0.105;
    float wallDistance = buildingWallField(collapsedPoint) * architectureHeight;
    float frameDistance = openingFrameField(collapsedPoint) * architectureHeight;
    float treeDistance = detachedTreeField(collapsedPoint) * architectureHeight;
    float furnitureDistance = furnitureField(meltedPoint);
    if (cutawayNearWalls > 0.5) {
      vec2 cameraDirection = normalize(uCameraLocal.xz + vec2(0.0001, 0.0));
      float nearWallCoordinate = dot(point.xz, cameraDirection);
      if (nearWallCoordinate > 0.12) wallDistance = 99.0;
    }
    float buildingDistance = smoothUnion(floorDistance, wallDistance, 0.075);
    buildingDistance = smoothUnion(buildingDistance, frameDistance, 0.055);
    float featureDistance = min(frameDistance, min(treeDistance, furnitureDistance));
    float signedDistance = min(buildingDistance, min(treeDistance, furnitureDistance));

    float nearestNonWall = min(floorDistance, featureDistance);
    float wallInfluence = 1.0 - smoothstep(-0.025, 0.085, wallDistance - nearestNonWall);
    float featureInfluence = 1.0 - smoothstep(-0.025, 0.10, featureDistance - min(floorDistance, wallDistance));

    float waveTime = uTime * uWaverSpeed;
    float fieldWave = sin((meltedPoint.x + meltedPoint.z * 0.67) * uWaverScale + waveTime)
      * cos((meltedPoint.y - meltedPoint.z * 0.38) * uWaverScale * 0.73 - waveTime * 0.71);
    signedDistance += fieldWave * uWaverAmount;
    float rippleDistance = distance(point.xz, uRippleOrigin);
    float rippleFront = abs(rippleDistance - uRippleAge * 1.35);
    float rippleEnvelope = smoothstep(uRippleRadius, 0.0, rippleFront) * exp(-uRippleAge * 0.55);
    signedDistance -= sin(rippleDistance * 17.0 - uRippleAge * 10.0) * rippleEnvelope * uRippleAmount;
    return vec4(signedDistance, wallInfluence, featureInfluence, frameDistance);
  }

  vec4 sceneField(vec3 point) {
    return evaluateSceneField(point, 0.0);
  }

  vec4 sceneInteriorField(vec3 point) {
    return evaluateSceneField(point, 1.0);
  }

  vec3 estimateNormal(vec3 point) {
    const float epsilon = 0.004;
    const vec2 direction = vec2(1.0, -1.0) * 0.5773 * epsilon;
    return normalize(
      direction.xyy * sceneField(point + direction.xyy).x
      + direction.yyx * sceneField(point + direction.yyx).x
      + direction.yxy * sceneField(point + direction.yxy).x
      + direction.xxx * sceneField(point + direction.xxx).x
    );
  }

  vec3 estimateStableWallNormal(vec3 point, vec3 fallbackNormal) {
    const float epsilon = 0.006;
    const vec2 direction = vec2(1.0, -1.0) * 0.5773 * epsilon;
    vec3 wallGradient =
      direction.xyy * buildingWallField(point + direction.xyy)
      + direction.yyx * buildingWallField(point + direction.yyx)
      + direction.yxy * buildingWallField(point + direction.yxy)
      + direction.xxx * buildingWallField(point + direction.xxx);
    float gradientLength = length(wallGradient);
    return gradientLength > 0.0001 ? wallGradient / gradientLength : fallbackNormal;
  }

  float ambientOcclusion(vec3 point, vec3 normal) {
    float occlusion = 0.0;
    float weight = 1.0;
    for (int sampleIndex = 1; sampleIndex <= 3; sampleIndex += 1) {
      float distanceAlongNormal = 0.05 * float(sampleIndex);
      float sampledDistance = sceneField(point + normal * distanceAlongNormal).x;
      occlusion += max(distanceAlongNormal - sampledDistance, 0.0) * weight;
      weight *= 0.52;
    }
    return clamp(1.0 - occlusion * 2.15, 0.30, 1.0);
  }

  float random(vec2 value) {
    return fract(sin(dot(value, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float nightVignetteMask() {
    vec2 safeResolution = max(uNightResolution, vec2(1.0));
    vec2 centered = gl_FragCoord.xy / safeResolution - vec2(0.5) - uNightVignetteOffset;
    centered.x *= safeResolution.x / safeResolution.y * 0.82;
    float angle = atan(centered.y, centered.x);
    float lowFrequencyWarp = sin(angle * 2.0 + 0.74) * 0.052
      + sin(angle * 3.0 - 1.15) * 0.029
      + sin(angle * 5.0 + 0.38) * 0.014;
    float warpedRadius = length(centered) + lowFrequencyWarp * uNightVignetteIrregularity;
    float feather = mix(0.055, 0.24, uNightVignetteSoftness);
    float edge = smoothstep(0.40 - feather, 0.64 + feather * 0.35, warpedRadius);
    return 1.0 - edge * uNightVignetteStrength;
  }

  vec3 shadeSurface(vec3 point, vec3 normal, float wallInfluence) {
    float occlusion = ambientOcclusion(point, normal);
    float diffuse = dot(normal, normalize(vec3(-0.45, 0.82, 0.38))) * 0.5 + 0.5;
    float stableWallVisibility = 0.0;
    if (uStabilityVariant > 0.5 && wallInfluence > 0.015) {
      vec3 surfaceToCamera = normalize(uCameraLocal - point);
      float viewFacing = abs(dot(normal, surfaceToCamera));
      float stableWallFill = mix(0.30, 0.46, viewFacing) * wallInfluence;
      diffuse = max(diffuse, stableWallFill);
      stableWallVisibility = smoothstep(0.015, 0.35, wallInfluence);
    }
    vec3 color = mix(uShadowColor, uBaseColor, smoothstep(0.08, 0.72, diffuse));
    color = mix(color, uHighlightColor, smoothstep(0.70, 1.0, diffuse) * 0.65);
    color *= mix(0.58, 1.0, occlusion);
    if (uStabilityVariant > 0.5 && stableWallVisibility > 0.0) {
      vec3 stableWallColorFloor = mix(uShadowColor, uBaseColor, 0.42);
      color = max(color, stableWallColorFloor * stableWallVisibility);
    }
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(color, vec3(luminance), uMonochromeMix);
    float frameTime = floor(uTime * 12.0) / 12.0 * uFilmTemporalEnabled;
    float grain = random(gl_FragCoord.xy + frameTime * 149.0) - 0.5;
    float flicker = (random(vec2(frameTime, 7.31)) - 0.5) * uFilmFlicker;
    color = max(color + grain * uFilmGrain + flicker, 0.0);
    if (uNightLookEnabled > 0.5) {
      float sourceLuminance = dot(color, vec3(0.299, 0.587, 0.114));
      float exposedLuminance = 1.0 - exp(-sourceLuminance * uNightExposure * 1.85);
      float midResponse = smoothstep(0.025, 0.68, exposedLuminance);
      float highlightResponse = smoothstep(0.58, 0.96, exposedLuminance);
      vec3 nightShadow = vec3(0.004, 0.022, 0.019);
      vec3 nightMid = vec3(0.055, 0.315, 0.195);
      vec3 nightHighlight = vec3(0.68, 0.94, 0.62);
      vec3 nightColor = mix(nightShadow, nightMid, midResponse);
      nightColor = mix(nightColor, nightHighlight, highlightResponse);
      nightColor += vec3(0.015, 0.095, 0.055) * uNightShadowLift * (1.0 - exposedLuminance);
      float localGrain = random(gl_FragCoord.xy * 0.71 + floor(uTime * 8.0) * 83.0) - 0.5;
      nightColor += localGrain * uNightLocalGrain * mix(1.0, 0.35, exposedLuminance);
      color = mix(color, max(nightColor, 0.0), uNightLookMix);
    }
    return color;
  }

  vec3 applyFurnitureRim(vec3 color, vec3 point, vec3 normal) {
    float furnitureProximity = 1.0 - smoothstep(
      0.012,
      0.070,
      abs(furnitureField(deformedScenePoint(point)))
    );
    vec3 viewDirection = normalize(uCameraLocal - point);
    float grazingAngle = 1.0 - abs(dot(normal, viewDirection));
    float rim = smoothstep(0.52, 0.94, grazingAngle) * furnitureProximity;
    vec3 furnitureRimColor = vec3(0.10, 0.72, 0.62);
    return color + furnitureRimColor * rim * 0.105;
  }

  float resolveFrontWall(vec3 point, vec3 normal, float wallInfluence) {
    vec3 horizontalNormal = vec3(normal.x, 0.0, normal.z);
    vec3 viewDirection = vec3(uCameraLocal.x - point.x, 0.0, uCameraLocal.z - point.z);
    float verticalSurface = smoothstep(0.45, 0.88, length(horizontalNormal));
    float cameraFacing = dot(normalize(horizontalNormal + vec3(0.0001, 0.0, 0.0)), normalize(viewDirection + vec3(0.0001, 0.0, 0.0)));
    if (uStabilityVariant > 0.5) {
      vec2 roomCenter = vec2(0.0, 0.30);
      vec2 cameraPlanarDirection = normalize(uCameraLocal.xz - roomCenter + vec2(0.0001, 0.0));
      float nearWallCoordinate = dot(point.xz - roomCenter, cameraPlanarDirection);
      cameraFacing = smoothstep(-0.55, 0.15, nearWallCoordinate);
    }
    return wallInfluence * verticalSurface * smoothstep(uFrontWallThreshold, 0.98, cameraFacing);
  }

  bool insideBounds(vec3 point) {
    return point.x > -2.40 && point.x < 2.40
      && point.y > -1.58 && point.y < 1.58
      && point.z > -1.70 && point.z < 2.82;
  }

  vec3 edgeCandidateDebugColor(float edgeRisk) {
    vec3 candidateColor = mix(
      vec3(1.0, 0.72, 0.04),
      vec3(1.0, 0.08, 0.025),
      smoothstep(0.42, 0.82, edgeRisk)
    );
    return edgeRisk > 0.12 ? candidateColor : vec3(0.004, 0.007, 0.008);
  }

  void main() {
    vec3 rayDirection = normalize(vLocalPosition - uCameraLocal);
    vec3 point = vLocalPosition + rayDirection * 0.002;
    bool firstHit = false;
    bool debugEdgeCandidates = uStabilityVariant > 0.5 && uStabilityDebugView > 0.5;
    bool debugFrontWallRisk = uStabilityVariant > 0.5 && uStabilityDebugView > 1.5;
    debugEdgeCandidates = debugEdgeCandidates && !debugFrontWallRisk;
    float rayAngularFootprint = 0.0;
    float closestDistance = 999.0;
    vec3 closestPoint = point;

    if (debugEdgeCandidates) {
      rayAngularFootprint = max(length(dFdx(rayDirection)), length(dFdy(rayDirection)));
    }

    for (int stepIndex = 0; stepIndex < 64; stepIndex += 1) {
      float distanceToSurface = sceneField(point).x;
      if (debugEdgeCandidates && abs(distanceToSurface) < closestDistance) {
        closestDistance = abs(distanceToSurface);
        closestPoint = point;
      }
      if (distanceToSurface < 0.0045) {
        firstHit = true;
        break;
      }
      point += rayDirection * max(distanceToSurface * 0.86, 0.002);
      if (!insideBounds(point)) break;
    }

    float revealFade = uReveal * uReveal * (3.0 - 2.0 * uReveal);

    if (!firstHit) {
      if (debugEdgeCandidates) {
        float closestRayDepth = length(closestPoint - uCameraLocal);
        float worldPixelFootprint = max(closestRayDepth * rayAngularFootprint, 0.0001);
        float edgeScore = closestDistance / worldPixelFootprint;
        float edgeRisk = 1.0 - smoothstep(0.75, 2.0, edgeScore);
        if (edgeRisk > 0.02) {
          vec4 debugClipPosition = projectionMatrix * modelViewMatrix * vec4(closestPoint, 1.0);
          gl_FragDepth = debugClipPosition.z / debugClipPosition.w * 0.5 + 0.5;
          fragColor = vec4(edgeCandidateDebugColor(edgeRisk), 0.92 * revealFade);
          return;
        }
      }
      discard;
    }

    vec3 firstPoint = point;
    vec4 firstField = sceneField(firstPoint);
    vec3 firstNormal = estimateNormal(firstPoint);

    if (debugEdgeCandidates) {
      float closestRayDepth = length(closestPoint - uCameraLocal);
      float worldPixelFootprint = max(closestRayDepth * rayAngularFootprint, 0.0001);
      float edgeScore = closestDistance / worldPixelFootprint;
      float proximityRisk = 1.0 - smoothstep(0.45, 1.40, edgeScore);
      float grazingRisk = 1.0 - smoothstep(
        0.06,
        0.28,
        abs(dot(firstNormal, -rayDirection))
      );
      float edgeRisk = grazingRisk * mix(0.55, 1.0, proximityRisk);
      vec4 debugClipPosition = projectionMatrix * modelViewMatrix * vec4(firstPoint, 1.0);
      gl_FragDepth = debugClipPosition.z / debugClipPosition.w * 0.5 + 0.5;
      fragColor = vec4(
        edgeCandidateDebugColor(edgeRisk),
        mix(0.78, 0.95, edgeRisk) * revealFade
      );
      return;
    }

    bool useStabilizedFrontWall = uStabilityVariant > 0.5;
    float firstWallInfluence = firstField.y;
    if (useStabilizedFrontWall) {
      float firstWallProximity = 1.0 - smoothstep(
        0.012,
        0.110,
        abs(buildingWallField(firstPoint))
      );
      firstWallInfluence = max(firstWallInfluence, firstWallProximity);
    }
    vec3 firstColor = applyFurnitureRim(
      shadeSurface(firstPoint, firstNormal, firstWallInfluence),
      firstPoint,
      firstNormal
    );
    float tunedFirstOpacity = mix(uRoomOpacity, uPropOpacity, firstField.z);
    float baseFirstOpacity = mix(0.44, 0.96, tunedFirstOpacity);
    vec3 frontWallNormal = firstNormal;

    if (useStabilizedFrontWall && firstWallInfluence > 0.015) {
      vec3 stableWallNormal = estimateStableWallNormal(firstPoint, firstNormal);
      vec3 blendedWallNormal = mix(firstNormal, stableWallNormal, clamp(firstWallInfluence, 0.0, 1.0));
      float blendedNormalLength = length(blendedWallNormal);
      frontWallNormal = blendedNormalLength > 0.0001
        ? blendedWallNormal / blendedNormalLength
        : stableWallNormal;
    }

    float frontWall = resolveFrontWall(firstPoint, frontWallNormal, firstWallInfluence);
    float frontWallFadedOpacity = mix(baseFirstOpacity, uFrontWallOpacity, frontWall);
    float firstOpacity = frontWallFadedOpacity;

    vec3 compositedColor = firstColor;
    float compositedOpacity = firstOpacity;
    float secondaryWeight = 1.0;
    bool traceSecondarySurface = frontWall > 0.015;
    bool secondarySurfaceHit = false;
    float openingFrameDistance = abs(firstField.w);

    if (useStabilizedFrontWall) {
      secondaryWeight = smoothstep(0.02, 0.20, frontWall);
      traceSecondarySurface = secondaryWeight > 0.001;
    }

    if (traceSecondarySurface) {
      vec3 secondPoint = firstPoint + rayDirection * (useStabilizedFrontWall ? 0.028 : 0.018);
      bool exitedFirstSurface = useStabilizedFrontWall;
      if (!useStabilizedFrontWall) {
        for (int exitIndex = 0; exitIndex < 24; exitIndex += 1) {
          float exitDistance = sceneField(secondPoint).x;
          if (exitDistance > 0.009) {
            exitedFirstSurface = true;
            break;
          }
          secondPoint += rayDirection * 0.022;
        }
      }

      bool secondHit = false;
      if (exitedFirstSurface) {
        for (int secondIndex = 0; secondIndex < 48; secondIndex += 1) {
          if (!useStabilizedFrontWall && secondIndex >= 44) break;
          float secondDistance = useStabilizedFrontWall
            ? sceneInteriorField(secondPoint).x
            : sceneField(secondPoint).x;
          if (secondDistance < 0.0045) {
            secondHit = true;
            break;
          }
          secondPoint += rayDirection * max(secondDistance * 0.84, 0.002);
          if (!insideBounds(secondPoint)) break;
        }
      }

      if (secondHit) {
        secondarySurfaceHit = true;
        vec4 secondField = sceneField(secondPoint);
        openingFrameDistance = min(openingFrameDistance, abs(secondField.w));
        vec3 secondNormal = estimateNormal(secondPoint);
        vec3 secondColor = applyFurnitureRim(
          shadeSurface(secondPoint, secondNormal, secondField.y),
          secondPoint,
          secondNormal
        );
        float secondOpacity = mix(0.44, 0.96, mix(uRoomOpacity, uPropOpacity, secondField.z));

        if (useStabilizedFrontWall) {
          float secondaryContribution = secondOpacity * (1.0 - firstOpacity) * secondaryWeight;
          float combinedOpacity = firstOpacity + secondaryContribution;
          compositedColor = (
            firstColor * firstOpacity
            + secondColor * secondaryContribution
          ) / max(combinedOpacity, 0.001);
          compositedOpacity = combinedOpacity;
        } else {
          float combinedOpacity = firstOpacity + secondOpacity * (1.0 - firstOpacity);
          compositedColor = (
            firstColor * firstOpacity
            + secondColor * secondOpacity * (1.0 - firstOpacity)
          ) / max(combinedOpacity, 0.001);
          compositedOpacity = combinedOpacity;
        }
      }
    }

    if (debugFrontWallRisk) {
      float safeFrontWall = frontWall * (secondarySurfaceHit ? 1.0 : 0.0);
      float riskyFrontWall = frontWall * (secondarySurfaceHit ? 0.0 : 1.0);
      vec3 debugColor = vec3(riskyFrontWall, safeFrontWall * 0.82, 0.015);
      vec4 debugClipPosition = projectionMatrix * modelViewMatrix * vec4(firstPoint, 1.0);
      gl_FragDepth = debugClipPosition.z / debugClipPosition.w * 0.5 + 0.5;
      fragColor = vec4(debugColor, mix(0.72, 0.96, max(riskyFrontWall, safeFrontWall)) * revealFade);
      return;
    }

    if (uNightLookEnabled > 0.5) {
      float bloomCore = 1.0 - smoothstep(0.012, 0.035 + uNightBloomCore * 0.020, openingFrameDistance);
      float bloomHalo = 1.0 - smoothstep(0.06, max(uNightBloomRadius, 0.061), openingFrameDistance);
      bloomHalo = max(bloomHalo - bloomCore * 0.58, 0.0);
      float vignette = nightVignetteMask();
      float subjectRelief = bloomHalo * 0.20 + bloomCore * 0.28;
      vignette = mix(vignette, max(vignette, 0.78), subjectRelief);
      compositedColor *= mix(1.0, vignette, uNightLookMix);
      vec3 halationColor = vec3(0.42, 0.78, 0.38);
      float halation = (bloomCore * uNightBloomCore * 0.55 + bloomHalo * 0.20) * uNightBloomStrength;
      vec3 bloomSignal = halationColor * halation * uNightLookMix;
      compositedColor += bloomSignal * (1.0 - clamp(compositedColor, 0.0, 1.0));
      if (uNightDebugView > 0.5) {
        compositedColor = uNightDebugView < 1.5
          ? vec3(bloomCore, bloomHalo * 0.72, 0.02)
          : vec3(vignette);
        compositedOpacity = 0.94;
      }
    }

    vec4 clipPosition = projectionMatrix * modelViewMatrix * vec4(firstPoint, 1.0);
    gl_FragDepth = clipPosition.z / clipPosition.w * 0.5 + 0.5;
    fragColor = vec4(compositedColor, compositedOpacity * revealFade);
  }
`

export class PlanMorphMaterial extends ShaderMaterial {
  constructor() {
    super({
      glslVersion: GLSL3,
      uniforms: {
        uCameraLocal: { value: new Vector3(0, 0, 5) },
        uBaseColor: { value: new Color('#66766b') },
        uHighlightColor: { value: new Color('#46e6dd') },
        uShadowColor: { value: new Color('#06133f') },
        uMonochromeMix: { value: 0.04 },
        uRoomOpacity: { value: 0.2 },
        uPropOpacity: { value: 0.66 },
        uFrontWallOpacity: { value: 0.12 },
        uFrontWallThreshold: { value: 0.53 },
        uArchitectureActivation: { value: 1 },
        uFurnitureSinkProgress: { value: 0 },
        uReveal: { value: 0 },
        uTime: { value: 0 },
        uFilmGrain: { value: 0.04 },
        uFilmFlicker: { value: 0 },
        uFilmTemporalEnabled: { value: 1 },
        uStabilityVariant: { value: 0 },
        uStabilityDebugView: { value: 0 },
        uWaverAmount: { value: 0 },
        uWaverScale: { value: 3.4 },
        uWaverSpeed: { value: 0 },
        uRippleAmount: { value: 0 },
        uRippleRadius: { value: 1.25 },
        uRippleAge: { value: 99 },
        uRippleOrigin: { value: new Vector2() },
        uNightLookEnabled: { value: 0 },
        uNightLookMix: { value: 1 },
        uNightExposure: { value: 1.08 },
        uNightShadowLift: { value: 0.065 },
        uNightLocalGrain: { value: 0.055 },
        uNightResolution: { value: new Vector2(1, 1) },
        uNightVignetteStrength: { value: 0.72 },
        uNightVignetteSoftness: { value: 0.34 },
        uNightVignetteIrregularity: { value: 0.18 },
        uNightVignetteOffset: { value: new Vector2(-0.025, 0.015) },
        uNightBloomStrength: { value: 0.42 },
        uNightBloomRadius: { value: 0.36 },
        uNightBloomCore: { value: 0.32 },
        uNightDebugView: { value: 0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: true,
      depthTest: true,
      side: DoubleSide,
      toneMapped: false,
    })
  }
}
