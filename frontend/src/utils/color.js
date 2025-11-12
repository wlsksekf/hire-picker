import { oklch2rgb } from "colorizr";

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function hexToRgb(hex) {
  let normalized = hex.replace("#", "").trim();
  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map((ch) => ch + ch)
      .join("");
  }
  const intVal = parseInt(normalized, 16);
  return {
    r: (intVal >> 16) & 255,
    g: (intVal >> 8) & 255,
    b: intVal & 255,
  };
}

function parseColor(color) {
  if (!color) return { r: 0, g: 0, b: 0 };
  const value = color.trim();
  if (value.toLowerCase() === "transparent") {
    return { r: 0, g: 0, b: 0 };
  }
  if (value.toLowerCase() === "white") {
    return { r: 255, g: 255, b: 255 };
  }
  if (value.toLowerCase() === "black") {
    return { r: 0, g: 0, b: 0 };
  }
  if (value.startsWith("oklch")) {
    try {
      const [l, c, h] = value
        .replace("oklch(", "")
        .replace(")", "")
        .split(/\s+/)
        .map(Number);
      const { r, g, b } = oklch2rgb([l, c, h]);
      return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
    } catch (error) {
      console.error("Failed to parse OKLCH color:", value, error);
      return { r: 0, g: 0, b: 0 };
    }
  }
  if (value.startsWith("rgb")) {
    const match = value.match(/[\d.]+/g);
    if (match) {
      const [r, g, b] = match.map(Number);
      return { r, g, b };
    }
  }
  if (value.startsWith("#")) {
    return hexToRgb(value);
  }
  return { r: 0, g: 0, b: 0 };
}

export function toRgbString(color) {
  const { r, g, b } = parseColor(color);
  return `rgb(${r}, ${g}, ${b})`;
}

export function withAlpha(color, alpha = 1) {
  const { r, g, b } = parseColor(color);
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha)})`;
}

export function mixRgb(colorA, colorB, weightA = 0.5) {
  const ratio = clamp(weightA);
  const ratioB = 1 - ratio;
  const a = parseColor(colorA);
  const b = parseColor(colorB);
  const r = Math.round(a.r * ratio + b.r * ratioB);
  const g = Math.round(a.g * ratio + b.g * ratioB);
  const bVal = Math.round(a.b * ratio + b.b * ratioB);
  return `rgb(${r}, ${g}, ${bVal})`;
}

