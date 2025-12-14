// utils/sensorCalculations.ts

export interface SensorData {
  accelerometer: { x: number; y: number; z: number };
  magnetometer: { x: number; y: number; z: number };
  pitch: number;
  roll: number;
  timestamp: number;
}

export interface ProcessedData {
  pitch: number;
  roll: number;
  heading: number;
  magnitude: number;
  tiltCompensatedHeading: number;
  gravityVector: number;
  horizontalAcceleration: number;
}

export function calculateProcessedData(data: SensorData): ProcessedData {
  const { accelerometer: a, magnetometer: m } = data;

  // Pitch (forward/backward tilt) in degrees
  const pitch = (Math.atan2(a.y, a.z) * 180) / Math.PI;

  // Roll (left/right tilt) in degrees
  const roll = (Math.atan2(a.x, a.z) * 180) / Math.PI;

  // Heading (azimuth/direction) in degrees
  let heading = (Math.atan2(m.y, m.x) * 180) / Math.PI;
  if (heading < 0) heading += 360;

  // Magnitude (total acceleration)
  const magnitude = Math.sqrt(a.x ** 2 + a.y ** 2 + a.z ** 2);

  // Tilt-compensated heading
  const pitchRad = (pitch * Math.PI) / 180;
  const rollRad = (roll * Math.PI) / 180;

  const Xh = m.x * Math.cos(pitchRad) + m.z * Math.sin(pitchRad);
  const Yh =
    m.x * Math.sin(rollRad) * Math.sin(pitchRad) +
    m.y * Math.cos(rollRad) -
    m.z * Math.sin(rollRad) * Math.cos(pitchRad);

  let tiltCompensatedHeading = (Math.atan2(Yh, Xh) * 180) / Math.PI;
  if (tiltCompensatedHeading < 0) tiltCompensatedHeading += 360;

  // Gravity vector angle
  const gravityVector = Math.acos(a.z / magnitude) * (180 / Math.PI);

  // Horizontal acceleration
  const horizontalAcceleration = Math.sqrt(a.x ** 2 + a.y ** 2);

  return {
    pitch: Number(pitch.toFixed(1)),
    roll: Number(roll.toFixed(1)),
    heading: Number(heading.toFixed(2)),
    magnitude: Number(magnitude.toFixed(2)),
    tiltCompensatedHeading: Number(tiltCompensatedHeading.toFixed(2)),
    gravityVector: Number(gravityVector.toFixed(2)),
    horizontalAcceleration: Number(horizontalAcceleration.toFixed(2)),
  };
}

export function getCardinalDirection(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}
