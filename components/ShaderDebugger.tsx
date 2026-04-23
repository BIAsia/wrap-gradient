import React, { useRef, useEffect, useState, useCallback } from 'react';
import { THEME } from '../config/theme';

// ── Shader types ──────────────────────────────────────────────
type ShaderType = 'cushion' | 'liquid' | 'mesh' | 'aurora' | 'noise';

// ── Preset palette data from gradient-shader.md ───────────────
interface PresetPalette {
  name: string;
  nameZh: string;
  family: string;
  colors: string[];
}

const SHADER_PRESETS: PresetPalette[] = [
  // Cushion reference
  { name: 'Sky Pillow', nameZh: '天枕', family: 'Cushion', colors: ['#E42820', '#F8A8B4', '#F2EDEC', '#CCDFF0', '#1AB2EC'] },
  // RedYellow
  { name: 'Burning Sky', nameZh: '烈空', family: 'RedYellow', colors: ['#C4C4C4','#E48D3E','#DF2512','#1F100D','#000000'] },
  { name: 'Dyed Horizon', nameZh: '霞染', family: 'RedYellow', colors: ['#DDE0EE','#DFC9AD','#F8A4A4','#F1603F','#EF2F6A'] },
  { name: 'Peach Aura', nameZh: '桃霓', family: 'RedYellow', colors: ['#8FCCCD','#FF74B4','#FF420A'] },
  { name: 'Warm Glow', nameZh: '晨曦', family: 'RedYellow', colors: ['#E8CCB0','#F8A808','#F88891','#F59898'] },
  { name: 'Sunset Glow', nameZh: '夕霞', family: 'RedYellow', colors: ['#B6D3EF','#E8CCB0','#F09050','#F1889F'] },
  // BluePurple
  { name: 'Glacial Glow', nameZh: '冰川', family: 'BluePurple', colors: ['#020C19','#253899','#007BDC','#B399F4','#EBCDCD'] },
  { name: 'Stellar', nameZh: '星幕', family: 'BluePurple', colors: ['#F6D0DB','#0646CE','#182D7C','#28173B'] },
  { name: 'Awakening', nameZh: '初醒', family: 'BluePurple', colors: ['#C9E8CD','#60ACD4','#4760A1','#1F100D'] },
  { name: 'Twilight Sky', nameZh: '夜阑', family: 'BluePurple', colors: ['#E3CCE6','#4E8CD5','#6068C2','#38364E'] },
  { name: 'Dream Haze', nameZh: '梦霭', family: 'BluePurple', colors: ['#EBD5EB','#A1BEE8','#807BCA'] },
  { name: 'Frost Dawn', nameZh: '霜降', family: 'BluePurple', colors: ['#DCDEE8','#DAA1AF','#5572B6','#7C62A5'] },
  // GreenYellow
  { name: 'Tranquil Bay', nameZh: '海湾', family: 'GreenYellow', colors: ['#DBE4D0','#8DB8A7','#2D8E9A','#076491','#154288','#262780'] },
  { name: 'Mint Sugar', nameZh: '薄荷糖', family: 'GreenYellow', colors: ['#DECEE8','#CBBAEE','#7DC0FB','#00C7A5'] },
  { name: 'Lakeside Glow', nameZh: '湖光', family: 'GreenYellow', colors: ['#EEEDAC','#A7E1A7','#3898EF','#119BB8'] },
  { name: 'Spring Sky', nameZh: '晴空', family: 'GreenYellow', colors: ['#F5D6C2','#7DD6E8','#5ABF8A'] },
  { name: 'Meadow', nameZh: '原野', family: 'GreenYellow', colors: ['#FBDBC3','#7BC34A','#BCB708'] },
  // Contrast
  { name: 'Floral', nameZh: '花漾', family: 'Contrast', colors: ['#C9DB78','#FAB760','#FF93A3','#EE8ECB'] },
  { name: 'Waltz', nameZh: '华尔兹', family: 'Contrast', colors: ['#F4B1A8','#E36787','#7913DF','#221060'] },
  { name: 'Midnight Bourbon', nameZh: '午夜波本', family: 'Contrast', colors: ['#F2846D','#D66AA4','#1F3FCE','#101A7C'] },
  { name: 'Amber Mist', nameZh: '雾色暖阳', family: 'Contrast', colors: ['#E0A800','#FF7C5B','#E08E81','#91ABCC'] },
  { name: 'Mint Blossom', nameZh: '樱草', family: 'Contrast', colors: ['#C0D589','#ABC0C5','#EE90CC'] },
  // Dark
  { name: 'Phantom', nameZh: '魅影', family: 'Dark', colors: ['#C45419','#A8425E','#73218F','#400A75','#240845','#020200'] },
  { name: 'Dusky Horizon', nameZh: '暮色线', family: 'Dark', colors: ['#F2C6EB','#4F70B5','#3D5C94','#354050','#40200A'] },
  { name: 'Champagne', nameZh: '古典香槟', family: 'Dark', colors: ['#CEEAB8','#B07840','#961600','#383330','#002E37'] },
  { name: 'Jungle', nameZh: '丛林', family: 'Dark', colors: ['#C8A828','#4A8C38','#1C4020'] },
  { name: 'Fading Night', nameZh: '渐明', family: 'Dark', colors: ['#DEBFD0','#878CB8','#215C80','#3D3660','#211020'] },
  // Light
  { name: 'Soft Bubble', nameZh: '泡沫', family: 'Light', colors: ['#F5EBD9','#F2D4DB','#EBBDDE','#CCBAE3','#8CBFF0','#78B0FF'] },
  { name: 'Tonic', nameZh: '汤力水', family: 'Light', colors: ['#E3EDF0','#E8EBB8','#F0DEA3','#E8B078','#F29682'] },
  { name: 'Peach', nameZh: '水蜜桃', family: 'Light', colors: ['#D9F5FA','#FCDAD6','#FCBAC9','#F0B2F5'] },
  { name: 'Sun Flower', nameZh: '向阳', family: 'Light', colors: ['#FFD9C3','#F5C7C4','#D1BAE3','#C2B8F0','#D6A6F0'] },
  { name: 'Tangerine Sparkle', nameZh: '青桔气泡', family: 'Light', colors: ['#F0FAF0','#A8E8C0'] },
];

// ── Per-type parameter definitions ────────────────────────────
interface ParamDef {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

// LIQUID — SDF metaballs with smooth union + glow halos
const LIQUID_PARAMS: ParamDef[] = [
  { key: 'timeSpeed', label: 'Time Speed', min: 0.02, max: 0.4, step: 0.01, defaultValue: 0.15 },
  { key: 'blobCount', label: 'Blob Density', min: 3.0, max: 8.0, step: 1.0, defaultValue: 5.0 },
  { key: 'blobRadius', label: 'Blob Radius', min: 0.08, max: 0.35, step: 0.01, defaultValue: 0.18 },
  { key: 'smoothK', label: 'Smooth Union K', min: 0.05, max: 0.8, step: 0.01, defaultValue: 0.35 },
  { key: 'glowIntensity', label: 'Glow Intensity', min: 0.5, max: 5.0, step: 0.1, defaultValue: 2.5 },
  { key: 'glowFalloff', label: 'Glow Falloff', min: 1.0, max: 8.0, step: 0.2, defaultValue: 3.5 },
  { key: 'orbitRadius', label: 'Orbit Radius', min: 0.05, max: 0.4, step: 0.01, defaultValue: 0.22 },
  { key: 'noiseWarp', label: 'Noise Warp', min: 0.0, max: 0.15, step: 0.005, defaultValue: 0.04 },
  { key: 'vignette', label: 'Vignette', min: 0.0, max: 1.0, step: 0.05, defaultValue: 0.3 },
];

// MESH — Voronoi cellular with animated centers + edge glow
const MESH_PARAMS: ParamDef[] = [
  { key: 'timeSpeed', label: 'Time Speed', min: 0.02, max: 0.5, step: 0.01, defaultValue: 0.12 },
  { key: 'cellScale', label: 'Cell Scale', min: 1.5, max: 6.0, step: 0.1, defaultValue: 3.0 },
  { key: 'edgeGlow', label: 'Edge Glow', min: 0.0, max: 1.0, step: 0.02, defaultValue: 0.25 },
  { key: 'edgeSharpness', label: 'Edge Sharpness', min: 1.0, max: 12.0, step: 0.5, defaultValue: 4.0 },
  { key: 'cellWobble', label: 'Cell Wobble', min: 0.0, max: 1.0, step: 0.05, defaultValue: 0.55 },
  { key: 'blendSoftness', label: 'Color Blend', min: 0.0, max: 1.0, step: 0.02, defaultValue: 0.5 },
  { key: 'grain', label: 'Film Grain', min: 0.0, max: 0.04, step: 0.002, defaultValue: 0.01 },
];

// AURORA — Turbulence-veined curtains + volumetric bloom
const AURORA_PARAMS: ParamDef[] = [
  { key: 'timeSpeed', label: 'Time Speed', min: 0.02, max: 0.3, step: 0.01, defaultValue: 0.08 },
  { key: 'curtainLayers', label: 'Curtain Layers', min: 2.0, max: 5.0, step: 1.0, defaultValue: 4.0 },
  { key: 'foldIntensity', label: 'Fold Intensity', min: 0.2, max: 2.0, step: 0.05, defaultValue: 1.0 },
  { key: 'turbulence', label: 'Turbulence', min: 0.0, max: 1.0, step: 0.02, defaultValue: 0.35 },
  { key: 'verticalStretch', label: 'Vertical Stretch', min: 0.15, max: 0.6, step: 0.02, defaultValue: 0.32 },
  { key: 'centerY', label: 'Center Y', min: 0.2, max: 0.8, step: 0.02, defaultValue: 0.52 },
  { key: 'bloom', label: 'Bloom', min: 0.0, max: 0.5, step: 0.01, defaultValue: 0.18 },
  { key: 'starDensity', label: 'Star Field', min: 0.0, max: 1.0, step: 0.05, defaultValue: 0.3 },
  { key: 'vignette', label: 'Vignette', min: 0.0, max: 1.2, step: 0.05, defaultValue: 0.5 },
];

// NOISE — Marble turbulence + Voronoi fracture overlay
const NOISE_PARAMS: ParamDef[] = [
  { key: 'timeSpeed', label: 'Time Speed', min: 0.01, max: 0.15, step: 0.005, defaultValue: 0.04 },
  { key: 'marbleScale', label: 'Marble Scale', min: 1.0, max: 6.0, step: 0.2, defaultValue: 2.5 },
  { key: 'marbleIntensity', label: 'Marble Distortion', min: 1.0, max: 8.0, step: 0.2, defaultValue: 4.0 },
  { key: 'voronoiScale', label: 'Fracture Scale', min: 2.0, max: 10.0, step: 0.5, defaultValue: 5.0 },
  { key: 'voronoiMix', label: 'Fracture Mix', min: 0.0, max: 0.6, step: 0.02, defaultValue: 0.2 },
  { key: 'crackGlow', label: 'Crack Glow', min: 0.0, max: 2.0, step: 0.05, defaultValue: 0.6 },
  { key: 'warpDepth', label: 'Warp Depth', min: 0.0, max: 1.0, step: 0.02, defaultValue: 0.35 },
  { key: 'contrastCurve', label: 'Contrast', min: 0.5, max: 3.0, step: 0.1, defaultValue: 1.4 },
  { key: 'vignette', label: 'Vignette', min: 0.0, max: 1.0, step: 0.05, defaultValue: 0.4 },
];

// CUSHION — Squircle with 3D sphere lighting + flowing shimmer
const CUSHION_PARAMS: ParamDef[] = [
  { key: 'timeSpeed',         label: 'Time Speed',       min: 0.01, max: 0.2,  step: 0.005, defaultValue: 0.06  },
  { key: 'skewAmount',        label: 'Skew Amount',      min: 0.0,  max: 0.18, step: 0.005, defaultValue: 0.055 },
  { key: 'skewSpeed',         label: 'Skew Speed',       min: 0.05, max: 1.0,  step: 0.05,  defaultValue: 0.28  },
  { key: 'shimmerIntensity',  label: 'Shimmer Intensity',min: 0.0,  max: 0.5,  step: 0.01,  defaultValue: 0.11  },
  { key: 'shimmerFalloff',    label: 'Shimmer Width',    min: 3.0,  max: 40.0, step: 0.5,   defaultValue: 22.0  },
  { key: 'flowSpeed',         label: 'Flow Speed',       min: 0.1,  max: 2.0,  step: 0.05,  defaultValue: 0.48  },
  { key: 'specIntensity',     label: 'Specular',         min: 0.0,  max: 1.0,  step: 0.02,  defaultValue: 0.22  },
  { key: 'glowStrength',      label: 'Edge Glow',        min: 0.0,  max: 0.5,  step: 0.01,  defaultValue: 0.14  },
  { key: 'shapeSize',         label: 'Shape Size',       min: 0.25, max: 0.5,  step: 0.01,  defaultValue: 0.40  },
  { key: 'noiseWarp',         label: 'Noise Warp',       min: 0.0,  max: 0.08, step: 0.005, defaultValue: 0.025 },
];

const PARAMS_MAP: Record<ShaderType, ParamDef[]> = {
  cushion: CUSHION_PARAMS,
  liquid: LIQUID_PARAMS,
  mesh: MESH_PARAMS,
  aurora: AURORA_PARAMS,
  noise: NOISE_PARAMS,
};

// ── Hex to GLSL vec3 ──────────────────────────────────────────
function hexToVec3(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return `vec3(${r.toFixed(3)}, ${g.toFixed(3)}, ${b.toFixed(3)})`;
}

// ── Shared GLSL fragments ─────────────────────────────────────

// Hash functions for Voronoi, stars, grain
const HASH_LIB = `
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
vec2 hash2(vec2 p){
  p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
  return fract(sin(p) * 43758.5453);
}
`;

const SIMPLEX_NOISE = `
vec3 mod289(vec3 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec2 mod289(vec2 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec3 permute(vec3 x){ return mod289(((x*34.0)+10.0)*x); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0,i1.y,1.0)) + i.x + vec3(0.0,i1.x,1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0*fract(p*C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314*(a0*a0+h*h);
  vec3 g;
  g.x  = a0.x *x0.x  + h.x *x0.y;
  g.yz = a0.yz*x12.xz + h.yz*x12.yw;
  return 130.0 * dot(m, g);
}
`;

const FBM = `
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 rot = mat2(0.8776, 0.4794, -0.4794, 0.8776);
  for(int i = 0; i < 5; i++){
    v += a * snoise(p);
    p = rot * p * 2.0;
    a *= 0.5;
  }
  return v;
}
`;

// Turbulence: abs(noise) FBM — veined marble patterns, NOT domain warp
const TURBULENCE = `
float turbulence(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 rot = mat2(0.8776, 0.4794, -0.4794, 0.8776);
  for(int i = 0; i < 6; i++){
    v += a * abs(snoise(p));
    p = rot * p * 2.02;
    a *= 0.49;
  }
  return v;
}
`;

// Voronoi returning (nearest_dist, second_nearest_dist, cell_id)
const VORONOI = `
vec3 voronoi(vec2 p, float t){
  vec2 n = floor(p);
  vec2 f = fract(p);
  float d1 = 8.0, d2 = 8.0;
  float id = 0.0;
  for(int j = -1; j <= 1; j++){
    for(int i = -1; i <= 1; i++){
      vec2 g = vec2(float(i), float(j));
      vec2 o = hash2(n + g);
      o = 0.5 + 0.5 * sin(t * 0.8 + 6.2831 * o);
      vec2 r = g + o - f;
      float d = dot(r, r);
      if(d < d1){ d2 = d1; d1 = d; id = dot(n+g, vec2(7.0,113.0)); }
      else if(d < d2){ d2 = d; }
    }
  }
  return vec3(sqrt(d1), sqrt(d2), id);
}
`;

// Smooth SDF union — polynomial (from shaderbase-skills)
const SDF_SMOOTH_UNION = `
float opSmoothUnion(float d1, float d2, float k){
  float h = clamp(0.5 + 0.5*(d2-d1)/k, 0.0, 1.0);
  return mix(d2, d1, h) - k*h*(1.0-h);
}
`;

// Piecewise-linear palette from preset colors
function buildPaletteGLSL(colors: string[]): string {
  const decls = colors.map((c, i) => `vec3 c${i} = ${hexToVec3(c)};`).join('\n');
  const n = colors.length;
  if (n <= 1) return `${decls}\nvec3 palette(float t){ return c0; }`;
  const segments = n - 1;
  let fn = `vec3 palette(float t){\n  t = clamp(t, 0.0, 1.0);\n`;
  for (let i = 0; i < segments; i++) {
    const lo = (i / segments).toFixed(4);
    const hi = ((i + 1) / segments).toFixed(4);
    const width = (1.0 / segments).toFixed(4);
    if (i < segments - 1) {
      fn += `  if(t < ${hi}) return mix(c${i}, c${i + 1}, (t - ${lo}) / ${width});\n`;
    } else {
      fn += `  return mix(c${i}, c${i + 1}, (t - ${lo}) / ${width});\n`;
    }
  }
  fn += `}`;
  return `${decls}\n${fn}`;
}

function buildColorDecls(colors: string[], prefix = 'c'): string {
  return colors.map((c, i) => `vec3 ${prefix}${i} = ${hexToVec3(c)};`).join('\n');
}

// Palette function that references already-declared c0..cN
function buildPaletteFromDecls(count: number): string {
  if (count <= 1) return `vec3 paletteFn(float t){ return c0; }`;
  const segments = count - 1;
  let fn = `vec3 paletteFn(float t){\n  t = clamp(t, 0.0, 1.0);\n`;
  for (let i = 0; i < segments; i++) {
    const lo = (i / segments).toFixed(4);
    const hi = ((i + 1) / segments).toFixed(4);
    const width = (1.0 / segments).toFixed(4);
    if (i < segments - 1) {
      fn += `  if(t < ${hi}) return mix(c${i}, c${i + 1}, (t - ${lo}) / ${width});\n`;
    } else {
      fn += `  return mix(c${i}, c${i + 1}, (t - ${lo}) / ${width});\n`;
    }
  }
  fn += `}`;
  return fn;
}

// ── Shader builders — each type uses fundamentally different techniques ──

function buildFragShader(type: ShaderType, colors: string[], params: Record<string, number>): string {
  const header = `precision highp float;\nuniform float u_time;\nuniform vec2 u_resolution;\n`;

  // ═══════════════════════════════════════════════════════════════
  // CUSHION — Squircle (n=4 superellipse) with sphere-like 3D depth,
  //   vertical gradient palette, skew oscillation, and flowing shimmer.
  // Technique: superellipse SDF → sphere normals from SDF gradient →
  //   Lambertian + specular lighting → animated shimmer band (流光)
  // ═══════════════════════════════════════════════════════════════
  if (type === 'cushion') {
    return `${header}\n${SIMPLEX_NOISE}\n${buildColorDecls(colors)}\n${buildPaletteFromDecls(colors.length)}\n
float squircleSDF(vec2 p, float r) {
  float qx = abs(p.x) / r;
  float qy = abs(p.y) / r;
  float q2x = qx * qx;
  float q2y = qy * qy;
  return pow(q2x * q2x + q2y * q2y, 0.25) - 1.0;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  float t = u_time * ${params.timeSpeed.toFixed(4)};

  // Screen-space centered coords [-0.5, 0.5]
  vec2 p = uv - 0.5;

  // Subtle skew oscillation: shear x by y
  float skew = sin(t * ${params.skewSpeed.toFixed(3)}) * ${params.skewAmount.toFixed(4)};
  p.x += skew * p.y;

  // Squircle (n=4 superellipse) SDF
  float r = ${params.shapeSize.toFixed(3)};
  float d = squircleSDF(p, r);

  // Normalized position in shape space [-1..1]
  vec2 pn = p / r;

  // Gradient: y drives palette (0 = bottom color, 1 = top color)
  float gradT = pn.y * 0.5 + 0.5;

  // Organic noise perturbation of gradient
  float noiseV = snoise(pn * 2.5 + vec2(t * 0.08, t * 0.05)) * ${params.noiseWarp.toFixed(4)};
  gradT = clamp(gradT + noiseV, 0.0, 1.0);

  vec3 col = paletteFn(gradT);

  // 3D cushion: aspect-corrected normals for specular
  vec2 pA = p * vec2(aspect, 1.0) / r;
  float nz = sqrt(max(1.0 - dot(pA, pA) * 0.88, 0.001));
  vec3 nrm = normalize(vec3(pA * 0.88, nz));

  // Edge darkening: thin dark ring only at the very edge of the squircle
  // -d = 0 at edge, 1 at center; full brightness once we're 20% inside
  float rimFade = smoothstep(0.0, 0.22, -d);
  col *= (0.04 + 0.96 * rimFade);

  // Subtle directional bias: top slightly brighter, bottom slightly warmer
  col *= (1.0 + nrm.y * 0.08);

  // Specular highlight
  vec3 ldir = normalize(vec3(-0.08, 0.52, 1.0));
  vec3 halfDir = normalize(ldir + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(dot(nrm, halfDir), 0.0), 32.0) * ${params.specIntensity.toFixed(3)};
  col += vec3(1.0, 0.97, 0.94) * spec;

  // Flowing shimmer band (流光): oscillating bright streak
  float shimPhase = sin(t * ${params.flowSpeed.toFixed(3)}) * 0.32 + cos(t * ${(params.flowSpeed * 0.61).toFixed(3)}) * 0.12;
  float shimY = pn.y - shimPhase;
  float shimX = sin(pn.x * 2.8 + t * ${(params.flowSpeed * 0.45).toFixed(3)}) * 0.035;
  float shimDist = shimY - shimX;
  float shimmer = exp(-shimDist * shimDist * ${params.shimmerFalloff.toFixed(2)}) * ${params.shimmerIntensity.toFixed(3)};
  shimmer *= smoothstep(1.0, 0.2, length(pA)); // fade toward edges
  col += vec3(1.0, 0.96, 0.92) * shimmer;

  // Background: deep dark navy
  vec3 bg = vec3(0.034, 0.032, 0.068);

  // Soft glow halo beyond squircle edge
  float glowDist = max(d, 0.0);
  vec3 edgeCol = paletteFn(gradT);
  float glow = exp(-glowDist * 7.0) * ${params.glowStrength.toFixed(3)};
  bg += edgeCol * glow;

  // Composite squircle onto background
  float mask = smoothstep(0.020, -0.008, d);
  col = mix(bg, col, mask);

  gl_FragColor = vec4(max(col, 0.0), 1.0);
}`;
  }

  // ═══════════════════════════════════════════════════════════════
  // LIQUID — SDF metaballs with smooth union blending + glow halos
  // Technique: Multiple animated SDF circles → smooth boolean union →
  //   distance field drives palette + exponential glow creates lava lamp feel
  // ═══════════════════════════════════════════════════════════════
  if (type === 'liquid') {
    const blobCount = Math.round(params.blobCount || 5);

    // Generate blob positions on unique Lissajous curves
    const blobDefs: string[] = [];
    for (let i = 0; i < blobCount; i++) {
      const angle = (i / blobCount) * 6.2832;
      const freqX = (0.3 + i * 0.17).toFixed(2);
      const freqY = (0.2 + i * 0.13).toFixed(2);
      const phaseX = angle.toFixed(3);
      const phaseY = (angle + 1.57).toFixed(3);
      blobDefs.push(
        `  vec2 b${i} = vec2(0.5*aspect + orbitR*sin(t*${freqX} + ${phaseX}), 0.5 + orbitR*cos(t*${freqY} + ${phaseY}));`
      );
    }

    // SDF smooth union chain
    let sdfChain = `  float d = length(p - b0) - blobR;`;
    for (let i = 1; i < blobCount; i++) {
      const radiusMult = (0.7 + Math.sin(i * 1.3) * 0.3).toFixed(2);
      sdfChain += `\n  d = opSmoothUnion(d, length(p - b${i}) - blobR * ${radiusMult}, smoothK);`;
    }

    // Per-blob proximity color contribution
    const colorContribs: string[] = [];
    for (let i = 0; i < blobCount; i++) {
      const ci = i % colors.length;
      colorContribs.push(`  col += c${ci} * exp(-3.5 * length(p - b${i}));`);
    }

    return `${header}\n${HASH_LIB}\n${SIMPLEX_NOISE}\n${SDF_SMOOTH_UNION}\n${buildColorDecls(colors)}\n${buildPaletteFromDecls(colors.length)}\n
void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = u_time * ${params.timeSpeed.toFixed(4)};
  float blobR = ${params.blobRadius.toFixed(3)};
  float smoothK = ${params.smoothK.toFixed(3)};
  float orbitR = ${params.orbitRadius.toFixed(3)};

  // Subtle noise warp for organic distortion
  p += vec2(snoise(p * 3.0 + t * 0.4), snoise(p * 3.0 + t * 0.3 + 50.0)) * ${params.noiseWarp.toFixed(4)};

${blobDefs.join('\n')}

${sdfChain}

  // Exponential glow from distance field
  float glow = exp(-${params.glowFalloff.toFixed(2)} * max(d, 0.0)) * ${params.glowIntensity.toFixed(2)};

  // Color: proximity-weighted blend from each blob
  vec3 col = vec3(0.0);
${colorContribs.join('\n')}
  col = col / max(length(col), 0.001) * glow;

  // Inside the metaball surface: palette-driven color
  float inside = smoothstep(0.01, -0.02, d);
  float palIdx = fract(atan(p.y - 0.5, p.x - 0.5*aspect) / 6.2832 + 0.5 + t * 0.02);
  palIdx += snoise(p * 4.0 + t * 0.3) * 0.12;
  vec3 innerCol = paletteFn(fract(palIdx));
  col = mix(col, innerCol * (0.8 + glow * 0.3), inside);

  // Vignette
  vec2 vc = uv - 0.5;
  col *= 1.0 - dot(vc, vc) * ${params.vignette.toFixed(3)};
  col = max(col, 0.0);

  gl_FragColor = vec4(col, 1.0);
}`;
  }

  // ═══════════════════════════════════════════════════════════════
  // MESH — Animated Voronoi cells with per-cell color + edge glow
  // Technique: Voronoi noise → cell ID drives palette color,
  //   edge distance creates glowing boundaries, animated cell centers
  // ═══════════════════════════════════════════════════════════════
  if (type === 'mesh') {
    return `${header}\n${HASH_LIB}\n${SIMPLEX_NOISE}\n${VORONOI}\n${buildPaletteGLSL(colors)}\n
void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 st = vec2(uv.x * aspect, uv.y);
  float t = u_time * ${params.timeSpeed.toFixed(4)};

  // Scale and apply subtle noise warp for organic feel
  vec2 p = st * ${params.cellScale.toFixed(2)};
  p += vec2(snoise(st * 2.0 + t * 0.3), snoise(st * 2.0 + t * 0.2 + 50.0)) * ${params.cellWobble.toFixed(3)};

  // Voronoi: get nearest dist, second dist, and cell ID
  vec3 vor = voronoi(p, t);
  float d1 = vor.x;
  float d2 = vor.y;
  float cellId = vor.z;

  // Edge detection: difference between nearest and second nearest
  float edge = d2 - d1;
  float edgeLine = exp(-edge * ${params.edgeSharpness.toFixed(2)});

  // Cell color from palette using cell ID as hash
  float palT = fract(cellId * 0.1731);

  // Blend with neighbor via smooth distance interpolation
  float blend = smoothstep(0.0, ${params.blendSoftness.toFixed(3)}, d1);
  palT = mix(palT, fract(palT + 0.37), blend * 0.3);
  palT += snoise(vec2(cellId * 0.1, t * 0.1)) * 0.08;

  vec3 cellCol = palette(fract(palT));

  // Edge glow: brighten edges with a luminous mix of adjacent colors
  vec3 edgeCol = palette(fract(palT + 0.5));
  vec3 col = mix(cellCol, edgeCol, edgeLine * ${params.edgeGlow.toFixed(3)});

  // Add subtle radial gradient within each cell
  col *= 0.85 + 0.15 * (1.0 - d1 * 1.5);

  // Film grain
  float grain = hash(gl_FragCoord.xy + t * 100.0) * ${params.grain.toFixed(4)};
  col += grain - ${(params.grain / 2).toFixed(4)};

  gl_FragColor = vec4(col, 1.0);
}`;
  }

  // ═══════════════════════════════════════════════════════════════
  // AURORA — Multi-layer curtains with turbulence veins + star field
  // Technique: Turbulence (abs FBM) for organic vein structure inside
  //   curtain folds, multiple overlapping layers, star field background
  // ═══════════════════════════════════════════════════════════════
  if (type === 'aurora') {
    const baseColor = hexToVec3(colors[0]);
    const layerColors = colors.slice(1, 6);
    while (layerColors.length < 5) layerColors.push(colors[colors.length - 1]);

    return `${header}\n${HASH_LIB}\n${SIMPLEX_NOISE}\n${TURBULENCE}\n
vec3 base = ${baseColor};
${layerColors.map((c, i) => `vec3 lc${i} = ${hexToVec3(c)};`).join('\n')}

// Enhanced curtain with turbulence veining
float curtain(vec2 uv, float t,
              float freqX, float freqDetail, float phaseOff,
              float speed, float centerY, float spread, float foldPower, float turbMix){
  // Primary fold — large-scale structure
  float fold = snoise(vec2(uv.x * freqX + t * speed, 0.5 + phaseOff));
  // Detail folds
  fold += 0.5 * snoise(vec2(uv.x * freqDetail - t * speed * 0.6, 1.0 + phaseOff));
  // Fine shimmer
  fold += 0.25 * snoise(vec2(uv.x * freqDetail * 2.0 + t * speed * 0.3,
                              uv.y * 0.8 + phaseOff + 5.0));
  fold /= 1.75;

  // Turbulence veins inside the curtain — abs(noise) creates bright streaks
  float veins = turbulence(vec2(uv.x * freqDetail * 0.8 + t * speed * 0.4,
                                 uv.y * 4.0 + phaseOff * 0.3));
  fold = mix(fold, fold * (0.5 + veins), turbMix);

  float shape = smoothstep(-0.1, 0.5, fold) * foldPower;

  // Gaussian height envelope
  float env = exp(-pow((uv.y - centerY) / spread, 2.0));
  env *= smoothstep(0.0, 0.12, uv.y) * smoothstep(1.0, 0.78, uv.y);

  // Vertical shimmer
  float yWave = snoise(vec2(uv.x * freqX * 1.5 + t * speed * 0.8,
                             uv.y * 3.0 + t * 0.15 + phaseOff));
  env *= 0.65 + 0.35 * (yWave * 0.5 + 0.5);

  return shape * env;
}

// Star field
float stars(vec2 uv, float density){
  vec2 cell = floor(uv * 120.0);
  float h = hash(cell);
  if(h > density) return 0.0;
  vec2 offset = hash2(cell);
  vec2 starPos = (cell + offset) / 120.0;
  float d = length(uv - starPos) * 120.0;
  float brightness = smoothstep(1.2, 0.0, d) * (0.5 + 0.5 * h);
  // Twinkle
  brightness *= 0.7 + 0.3 * sin(h * 100.0 + hash(cell + 0.5) * 6.28);
  return brightness;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * ${params.timeSpeed.toFixed(4)};
  vec3 col = base;

  // Star field background
  float starField = stars(uv, ${params.starDensity.toFixed(3)}) * 0.4;
  col += starField;

  float spread = ${params.verticalStretch.toFixed(3)};
  float cy = ${params.centerY.toFixed(3)};
  float foldPow = ${params.foldIntensity.toFixed(3)};
  float turbMix = ${params.turbulence.toFixed(3)};

  // Layer curtains with different frequencies, speeds, heights
  float i0 = curtain(uv, t, 2.2, 5.5, 0.0, 0.45, cy, spread, foldPow, turbMix);
  col += lc0 * i0 * 0.90;

  float i1 = curtain(uv, t, 1.6, 4.0, 10.0, 0.32, cy - 0.06, spread * 0.9, foldPow * 0.85, turbMix * 0.8);
  col += lc1 * i1 * 0.65;

  float i2 = curtain(uv, t, 3.2, 6.5, 20.0, 0.55, cy + 0.08, spread * 1.15, foldPow * 1.1, turbMix);
  col += lc2 * i2 * 0.75;

  float i3 = curtain(uv, t, 1.3, 3.2, 30.0, 0.22, cy - 0.18, spread * 0.75, foldPow * 0.7, turbMix * 1.2);
  col += lc3 * i3 * 0.35;

  // Optional 5th layer for richer palettes
  float i4 = curtain(uv, t, 2.8, 5.0, 42.0, 0.38, cy + 0.12, spread * 1.05, foldPow * 0.9, turbMix * 0.6);
  col += lc4 * i4 * 0.25;

  // Volumetric bloom — accumulate where brightness is high
  float totalI = i0 + i1 * 0.7 + i2 * 0.5 + i3 * 0.3 + i4 * 0.2;
  col += col * totalI * ${params.bloom.toFixed(3)};

  // Color grading: lift shadows toward base color
  col = mix(col, col + base * 0.04, 1.0 - totalI);

  // Vignette
  vec2 vc = uv - 0.5;
  col *= 1.0 - dot(vc, vc) * ${params.vignette.toFixed(3)};
  col = min(col, 1.0);
  gl_FragColor = vec4(col, 1.0);
}`;
  }

  // ═══════════════════════════════════════════════════════════════
  // NOISE — Marble turbulence + Voronoi fracture overlay
  // Technique: Turbulence (abs FBM) drives marble/smoke veins,
  //   Voronoi edge cracks overlay with glow, domain warp for depth.
  //   Completely different from Liquid (no SDF, no metaballs).
  // ═══════════════════════════════════════════════════════════════
  return `${header}\n${HASH_LIB}\n${SIMPLEX_NOISE}\n${TURBULENCE}\n${VORONOI}\n${buildPaletteGLSL(colors)}\n
void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = u_time * ${params.timeSpeed.toFixed(4)};

  // Domain warp for depth — single pass, NOT the triple-warp of old noise
  vec2 q = vec2(
    snoise(p * 2.0 + t * vec2(0.12, 0.08)),
    snoise(p * 2.0 + vec2(5.2, 1.3) + t * vec2(0.08, 0.14))
  );
  vec2 wp = p + q * ${params.warpDepth.toFixed(3)};

  // MARBLE: turbulence drives sine-wave veins — classic marble technique
  float turb = turbulence(wp * ${params.marbleScale.toFixed(2)} + t * 0.1);
  float marble = sin((wp.x + wp.y) * 3.0 + turb * ${params.marbleIntensity.toFixed(2)}) * 0.5 + 0.5;

  // Apply contrast curve (S-curve via smoothstep)
  float contrast = ${params.contrastCurve.toFixed(2)};
  marble = pow(marble, contrast);

  // Base color from marble pattern
  vec3 col = palette(marble);

  // VORONOI fracture overlay — cracks with glow
  float voroScale = ${params.voronoiScale.toFixed(2)};
  vec3 vor = voronoi(p * voroScale + q * 0.5, t);
  float edge = vor.y - vor.x; // edge = second_nearest - nearest

  // Crack glow: bright lines along Voronoi edges
  float crack = exp(-edge * 8.0) * ${params.crackGlow.toFixed(3)};

  // Voronoi cell tint: shift palette by cell ID
  float cellTint = fract(vor.z * 0.1731);
  vec3 crackCol = palette(fract(cellTint + 0.4));

  // Blend fracture over marble
  col = mix(col, col + crackCol * crack, ${params.voronoiMix.toFixed(3)});

  // Add glow at crack lines
  col += crackCol * crack * ${params.voronoiMix.toFixed(3)} * 0.5;

  // Subtle depth modulation from warp vectors
  col *= 0.9 + 0.1 * (1.0 + length(q));

  // Vignette
  vec2 vc = uv - 0.5;
  col *= 1.0 - dot(vc, vc) * ${params.vignette.toFixed(3)};
  gl_FragColor = vec4(col, 1.0);
}`;
}

const VS = `attribute vec2 a_pos; void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }`;

// ── Component ─────────────────────────────────────────────────
export const ShaderDebugger: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const progRef = useRef<WebGLProgram | null>(null);
  const rafRef = useRef<number>(0);
  const uTimeRef = useRef<WebGLUniformLocation | null>(null);
  const uResRef = useRef<WebGLUniformLocation | null>(null);

  const [shaderType, setShaderType] = useState<ShaderType>('cushion');
  const [selectedPreset, setSelectedPreset] = useState<number>(0); // Sky Pillow
  const [params, setParams] = useState<Record<string, number>>(() => {
    const defs: Record<string, number> = {};
    CUSHION_PARAMS.forEach(p => { defs[p.key] = p.defaultValue; });
    return defs;
  });
  const [isPaused, setIsPaused] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const currentPreset = SHADER_PRESETS[selectedPreset];
  const currentParamDefs = PARAMS_MAP[shaderType];

  // Reset params when shader type changes
  const handleTypeChange = useCallback((type: ShaderType) => {
    setShaderType(type);
    const defs: Record<string, number> = {};
    PARAMS_MAP[type].forEach(p => { defs[p.key] = p.defaultValue; });
    setParams(defs);
  }, []);

  const resetParams = useCallback(() => {
    const defs: Record<string, number> = {};
    currentParamDefs.forEach(p => { defs[p.key] = p.defaultValue; });
    setParams(defs);
  }, [currentParamDefs]);

  // Compile shader
  const compileAndLink = useCallback((gl: WebGLRenderingContext, fragSrc: string) => {
    if (progRef.current) gl.deleteProgram(progRef.current);

    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, VS);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      console.error('VS:', gl.getShaderInfoLog(vs));
    }

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, fragSrc);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.error('FS:', gl.getShaderInfoLog(fs));
      return false;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Link:', gl.getProgramInfoLog(prog));
      return false;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const ap = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(ap);
    gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);

    uTimeRef.current = gl.getUniformLocation(prog, 'u_time');
    uResRef.current = gl.getUniformLocation(prog, 'u_resolution');
    progRef.current = prog;

    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return true;
  }, []);

  // Build and apply shader whenever type, preset, or params change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!glRef.current) {
      glRef.current = canvas.getContext('webgl');
    }
    const gl = glRef.current;
    if (!gl) return;

    const fragSrc = buildFragShader(shaderType, currentPreset.colors, params);
    compileAndLink(gl, fragSrc);

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const frame = (ts: number) => {
      if (!isPaused) {
        gl.uniform1f(uTimeRef.current, ts * 0.001);
      }
      gl.uniform2f(uResRef.current, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [shaderType, selectedPreset, params, isPaused, compileAndLink, currentPreset.colors]);

  // Export string
  const exportString = `// Preset: ${currentPreset.name} ${currentPreset.nameZh} | Type: ${shaderType.charAt(0).toUpperCase() + shaderType.slice(1)}
// Family: ${currentPreset.family}
// Colors: ${currentPreset.colors.join(' ')}
// Parameters:
${Object.entries(params).map(([k, v]) => `//   ${k}: ${v}`).join('\n')}`;

  const families = [...new Set(SHADER_PRESETS.map(p => p.family))];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      {/* Top bar: type selector + controls */}
      <div className={`flex items-center justify-between px-4 py-2 border-b ${THEME.layout.border} shrink-0`}>
        <div className="flex items-center gap-1">
          {(['cushion', 'liquid', 'mesh', 'aurora', 'noise'] as ShaderType[]).map(t => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                shaderType === t
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
              isPaused ? 'bg-destructive text-destructive-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {isPaused ? 'Paused' : 'Pause'}
          </button>
          <button
            onClick={resetParams}
            className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => setShowExport(!showExport)}
            className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
          >
            Export
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Canvas area */}
        <div className="flex-1 relative min-h-0">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
          />
          {/* Preset name overlay */}
          <div className="absolute bottom-4 left-4 pointer-events-none">
            <span className="text-[11px] uppercase tracking-[0.1em] text-white/20">
              {currentPreset.name} {currentPreset.nameZh} · {shaderType}
            </span>
          </div>
        </div>

        {/* Right panel: presets + params */}
        <div className={`w-72 border-l ${THEME.layout.border} flex flex-col min-h-0 overflow-hidden`}>
          {/* Presets section */}
          <div className={`shrink-0 border-b ${THEME.layout.border}`}>
            <div className={`px-3 pt-3 pb-1`}>
              <h3 className={`${THEME.panel.header.title} ${THEME.typography.color.label} mb-2`}>Palette</h3>
            </div>
            <div className="px-3 pb-3 max-h-48 overflow-y-auto space-y-2">
              {families.map(fam => (
                <div key={fam}>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{fam}</div>
                  <div className="flex flex-wrap gap-1">
                    {SHADER_PRESETS.map((p, idx) => {
                      if (p.family !== fam) return null;
                      const gradStr = p.colors.map((c, ci) =>
                        `${c} ${(ci / Math.max(p.colors.length - 1, 1) * 100).toFixed(0)}%`
                      ).join(', ');
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedPreset(idx)}
                          className={`w-8 h-5 rounded-sm transition-all ${
                            selectedPreset === idx ? 'ring-2 ring-primary ring-offset-1 ring-offset-background scale-110' : 'hover:scale-105'
                          }`}
                          style={{ background: `linear-gradient(to right, ${gradStr})` }}
                          title={`${p.name} ${p.nameZh}`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Params section */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="px-3 pt-3 pb-1">
              <h3 className={`${THEME.panel.header.title} ${THEME.typography.color.label} mb-2`}>Parameters</h3>
            </div>
            <div className="px-3 pb-4 space-y-3">
              {currentParamDefs.map(def => (
                <div key={def.key}>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[11px] text-muted-foreground">{def.label}</label>
                    <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                      {(params[def.key] ?? def.defaultValue).toFixed(
                        def.step < 0.01 ? 3 : def.step < 0.1 ? 2 : 1
                      )}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={def.min}
                    max={def.max}
                    step={def.step}
                    value={params[def.key] ?? def.defaultValue}
                    onChange={e => setParams(prev => ({ ...prev, [def.key]: parseFloat(e.target.value) }))}
                    className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                  />
                </div>
              ))}
            </div>

            {/* Color swatches display */}
            <div className="px-3 pb-4">
              <h3 className={`${THEME.panel.header.title} ${THEME.typography.color.label} mb-2`}>Colors</h3>
              <div className="flex gap-1">
                {currentPreset.colors.map((c, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className="w-8 h-8 rounded-sm border border-border"
                      style={{ backgroundColor: c }}
                    />
                    <span className="text-[9px] font-mono text-muted-foreground">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export overlay */}
      {showExport && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-8" onClick={() => setShowExport(false)}>
          <div className="bg-card border border-border rounded-lg p-6 max-w-xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Current Configuration</h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(exportString);
                }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Copy
              </button>
            </div>
            <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">{exportString}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
