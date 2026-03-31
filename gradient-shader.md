---
name: gradient-shader
description: Implement gradient-driven web visuals (Liquid, Mesh, Aurora, Noise-distorted) into the user's project. Reads the existing tech stack (React, Vue, Next.js, Svelte, vanilla, Three.js, etc.) and integrates a production-quality WebGL gradient shader as a component or module that fits the project's conventions. All colors from wrap-gradient's curated preset system.
---

# Gradient Shader — Production Integration

**Identity**: This skill implements gradient-driven visuals into existing web projects. It is not a demo generator.
Read the project first. Match its stack, conventions, and component patterns. Deliver code that belongs in the codebase.

---

## Step 0 — Read the Target Project

Before writing any shader code, understand the project:

1. **Framework**: Check `package.json` for React, Vue, Svelte, Next.js, Nuxt, Astro, vanilla, etc.
2. **Existing GL/canvas setup**: Look for `three`, `@react-three/fiber`, `ogl`, `regl`, `pixi.js`, or existing `<canvas>` patterns. If the project already uses a GL framework, use it — do not introduce a parallel raw WebGL setup.
3. **Styling approach**: CSS Modules, Tailwind, styled-components, vanilla CSS, SCSS — match whatever the project uses.
4. **Component patterns**: File naming, export style, prop conventions, directory structure. Follow them.
5. **Build tooling**: Vite, Webpack, esbuild — understand how GLSL strings will be handled (inline template literals vs. imported `.glsl` files if a GLSL loader exists).

**Integration rules**:
- If the project uses React → create a React component with `useRef` + `useEffect` for WebGL lifecycle, `useCallback` for resize, cleanup on unmount.
- If Vue → `<script setup>` with `ref()`, `onMounted`, `onUnmounted`.
- If Svelte → `onMount` / `onDestroy`, bind canvas element.
- If Three.js / R3F exists → use `ShaderMaterial` on a fullscreen plane, not raw WebGL.
- If vanilla → export a factory function `createGradientShader(container, options)` returning a `{ destroy }` handle.
- If the project already has a component for background effects or canvas rendering, extend or replace it — do not create a parallel system.

---

## Step 1 — Classify the Scene

Read the user's description and map to a gradient type:

| Scene signals | Type |
|---|---|
| Flowing, morphing, alive, liquid, lava, kinetic, color-shifting | **Liquid** |
| Soft, layered, floating orbs, depth, background glow, glassmorphism, gentle | **Mesh** |
| Northern lights, sky, vertical sweep, luminous curtains, space, aurora | **Aurora** |
| Textured, distorted, smoky, dimensional, dramatic, organic, ancient | **Noise** |

Color energy tiebreaker:
- Warm, high-saturation → Liquid
- Cool, luminous, vertical → Aurora
- Soft, pastel, diffuse → Mesh
- Dark, brooding, deep → Noise

If no scene is given, ask one question only: *"What feeling or context should this gradient carry?"*

---

## Step 2 — Select a Preset Palette

Two entry paths: **scene mood** (primary), or **palette family** (when user names one).

### Family → Character + Type Affinity

| Family | Character | Best type | Alt type |
|---|---|---|---|
| **RedYellow** | Warm, energetic, sunrise/sunset | Liquid | Noise |
| **BluePurple** | Cool, deep, celestial, calm | Aurora | Mesh |
| **GreenYellow** | Fresh, natural, alive, spring | Mesh | Liquid |
| **Contrast** | Vibrant tension, pop energy, bold | Liquid | Noise |
| **Dark** | Dramatic, cinematic, luxury, gaming | Noise | Aurora |
| **Light** | Airy, gentle, dream-like, beauty | Mesh | Liquid |

Cross-check: if the scene points to Aurora but the best palette is from RedYellow, switch to Liquid.

### Full Preset Palette Library

Use exact hex values. Colors are ordered perceptually within each preset.

#### RedYellow Family

**Burning Sky 烈空** — gray dawn → fire → near-black
`#C4C4C4` `#E48D3E` `#DF2512` `#1F100D` `#000000`

**Dyed Horizon 霞染** — soft blue-white → coral → magenta
`#DDE0EE` `#DFC9AD` `#F8A4A4` `#F1603F` `#EF2F6A`

**Peach Aura 桃霓** — cyan → hot pink → vivid red
`#8FCCCD` `#FF74B4` `#FF420A`

**Peach Drop 桃露** — similar to Peach Aura, slightly cooler
`#8FCCCD` `#F56BA8` `#FF5620`

**Warm Glow 晨曦** — warm beige → amber → rosy gold
`#E8CCB0` `#F8A808` `#F88891` `#F59898`

**Sunset Glow 夕霞** — steel blue → warm gold → coral pink
`#B6D3EF` `#E8CCB0` `#F09050` `#F1889F`

#### BluePurple Family

**Glacial Glow 冰川** — deep navy → indigo → vivid blue → lavender → blush
`#020C19` `#253899` `#007BDC` `#B399F4` `#EBCDCD`

**Stellar 星幕** — blush pink → vivid blue → navy → dark purple
`#F6D0DB` `#0646CE` `#182D7C` `#28173B`

**Awakening 初醒** — mint → sky blue → slate blue → near-black
`#C9E8CD` `#60ACD4` `#4760A1` `#1F100D`

**Twilight Sky 夜阑** — soft lilac → cornflower → periwinkle → charcoal
`#E3CCE6` `#4E8CD5` `#6068C2` `#38364E`

**Dream Haze 梦霭** — lavender → powder blue → periwinkle
`#EBD5EB` `#A1BEE8` `#807BCA`

**Frost Dawn 霜降** — blue-white → dusty rose → periwinkle → medium purple
`#DCDEE8` `#DAA1AF` `#5572B6` `#7C62A5`

#### GreenYellow Family

**Tranquil Bay 海湾** — sage → teal → mid-ocean → deep navy
`#DBE4D0` `#8DB8A7` `#2D8E9A` `#076491` `#154288` `#262780`

**Mint Sugar 薄荷糖** — soft lavender → cornflower → aqua → teal
`#DECEE8` `#CBBAEE` `#7DC0FB` `#00C7A5`

**Lakeside Glow 湖光** — pale yellow → light green → sky blue → teal
`#EEEDAC` `#A7E1A7` `#3898EF` `#119BB8`

**Spring Sky 晴空** — warm peach → sky cyan → fresh green
`#F5D6C2` `#7DD6E8` `#5ABF8A`

**Spring Days 春日** — blush → teal-mint → emerald → lime
`#EDCED3` `#8FD6BF` `#34C99E` `#A9BF5A`

**Meadow 原野** — warm peach → fresh green → olive gold
`#FBDBC3` `#7BC34A` `#BCB708`

#### Contrast Family

**Floral 花漾** — yellow-green → warm peach → salmon → mauve
`#C9DB78` `#FAB760` `#FF93A3` `#EE8ECB`

**Waltz 华尔兹** — dusty rose → berry → vivid violet → deep blue-purple
`#F4B1A8` `#E36787` `#7913DF` `#221060`

**Midnight Bourbon 午夜波本** — salmon → mauve-pink → royal blue → dark navy
`#F2846D` `#D66AA4` `#1F3FCE` `#101A7C`

**Amber Mist 雾色暖阳** — gold → warm orange → dusty salmon → steel blue
`#E0A800` `#FF7C5B` `#E08E81` `#91ABCC`

**Mint Blossom 樱草** — yellow-green → sage-gray → soft pink
`#C0D589` `#ABC0C5` `#EE90CC`

#### Dark Family

**Phantom 魅影** — burnt orange → dark rose → deep violet → near-black
`#C45419` `#A8425E` `#73218F` `#400A75` `#240845` `#020200`

**Dusky Horizon 暮色线** — blush lavender → steel blue → dark navy → brown-black
`#F2C6EB` `#4F70B5` `#3D5C94` `#354050` `#40200A`

**Champagne 古典香槟** — pale green → warm brown → dark espresso → deep teal
`#CEEAB8` `#B07840` `#961600` `#383330` `#002E37`

**Jungle 丛林** — gold → forest green → deep jungle
`#C8A828` `#4A8C38` `#1C4020`

**Fading Night 渐明** — rose-gray → slate purple → teal-navy → dark burgundy
`#DEBFD0` `#878CB8` `#215C80` `#3D3660` `#211020`

#### Light Family

**Soft Bubble 泡沫** — warm white → blush → soft pink → lavender → sky blue
`#F5EBD9` `#F2D4DB` `#EBBDDE` `#CCBAE3` `#8CBFF0` `#78B0FF`

**Tonic 汤力水** — icy mint → cream → warm peach → salmon
`#E3EDF0` `#E8EBB8` `#F0DEA3` `#E8B078` `#F29682`

**Peach 水蜜桃** — ice blue → blush → soft coral → lavender-pink
`#D9F5FA` `#FCDAD6` `#FCBAC9` `#F0B2F5`

**Sun Flower 向阳** — peach-white → warm pink → soft violet → light purple
`#FFD9C3` `#F5C7C4` `#D1BAE3` `#C2B8F0` `#D6A6F0`

**Tangerine Sparkle 青桔气泡** — near-white → fresh mint
`#F0FAF0` `#A8E8C0`

#### OKLCH High-Saturation Pairs

Use for Liquid (vibrant, kinetic) or vivid Mesh accent points.

`#66FFF5` → `#FF1A75` — neon cyan → hot pink
`#BA66FF` → `#FCFF57` — vivid purple → electric yellow
`#FF66E3` → `#A5FF99` — hot pink → lime
`#AB66FF` → `#8AFFB3` — purple → mint
`#6685FF` → `#FF9838` — periwinkle → orange
`#CCE31C` → `#FB2883` — neon yellow → magenta
`#FFB866` → `#99CAFF` — warm peach → sky blue
`#FFD9C2` → `#D6A6F0` — soft peach → lavender

---

## Step 3 — Shader Core (GLSL)

All four types use WebGL fragment shaders. Every shader shares a common noise foundation.

### Shared: Simplex 2D Noise (Ashima Arts)

Include this in every fragment shader:

```glsl
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
```

### Shared: FBM with Inter-Octave Rotation

```glsl
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
```

### Shared: Palette Function

Convert each preset hex to `vec3(r/255.0, g/255.0, b/255.0)`. Build a piecewise-linear ramp:

```glsl
// Example for 4 stops — adapt stop count and thresholds to the preset
vec3 palette(float t){
  t = clamp(t, 0.0, 1.0);
  if(t < 0.33) return mix(c0, c1, t / 0.33);
  if(t < 0.66) return mix(c1, c2, (t - 0.33) / 0.33);
  return mix(c2, c3, (t - 0.66) / 0.34);
}
```

---

### Type A — Liquid Gradient

Two-layer FBM UV warp creates large-scale organic color flow.

```glsl
void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = u_time * 0.08;

  // Primary warp — low-freq FBM moves color regions
  vec2 warp = vec2(
    fbm(p * 1.2 + vec2(t * 0.3,  t * 0.2)),
    fbm(p * 1.2 + vec2(t * 0.2, -t * 0.3) + 50.0)
  );

  // Secondary warp — adds organic detail
  vec2 warp2 = vec2(
    snoise((p + warp * 0.6) * 1.8 + t * 0.15),
    snoise((p + warp * 0.6) * 1.8 + t * 0.12 + 30.0)
  );

  vec2 warped = uv + warp * 0.18 + warp2 * 0.06;
  float n = fbm(warped * 1.5 + t * 0.05) * 0.5 + 0.5;
  float diag = warped.x * 0.55 + warped.y * 0.45;
  float s = smoothstep(0.08, 0.92, mix(n, diag, 0.40));

  vec3 col = palette(s);
  vec2 vc = uv - 0.5;
  col *= 1.0 - dot(vc, vc) * 0.4;
  gl_FragColor = vec4(col, 1.0);
}
```

### Type B — Mesh Gradient

N Gaussian control points with normalized weighted blending. Points orbit slowly on independent sine paths. Noise perturbation breaks mathematical perfection.

```glsl
void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 st = vec2(uv.x * aspect, uv.y);
  float t = u_time * 0.12;

  // Define control points (adapt count to preset stop count)
  vec2 cp0 = vec2(0.22+0.10*sin(t*0.71), 0.28+0.08*cos(t*0.53));
  vec2 cp1 = vec2(0.80+0.08*sin(t*0.43+2.1), 0.14+0.10*cos(t*0.82+1.5));
  vec2 cp2 = vec2(0.52+0.12*sin(t*0.62+4.2), 0.84+0.08*cos(t*0.37+3.0));
  vec2 cp3 = vec2(0.10+0.06*cos(t*0.91+1.3), 0.66+0.09*sin(t*0.58+2.5));
  vec2 cp4 = vec2(0.88+0.07*sin(t*0.55+3.7), 0.52+0.07*cos(t*0.45+0.8));
  // Scale x by aspect
  cp0.x *= aspect; cp1.x *= aspect; cp2.x *= aspect;
  cp3.x *= aspect; cp4.x *= aspect;

  float sigma = 3.2;
  float w0 = exp(-sigma * dot(st-cp0, st-cp0));
  float w1 = exp(-sigma * dot(st-cp1, st-cp1));
  float w2 = exp(-sigma * dot(st-cp2, st-cp2));
  float w3 = exp(-sigma * dot(st-cp3, st-cp3));
  float w4 = exp(-sigma * dot(st-cp4, st-cp4));

  // Noise perturbation
  float nw = snoise(st * 3.0 + t * 0.1) * 0.08;
  w0 *= 1.0 + nw; w1 *= 1.0 - nw;

  float total = w0+w1+w2+w3+w4 + 0.0001;
  vec3 col = (c0*w0 + c1*w1 + c2*w2 + c3*w3 + c4*w4) / total;

  // Subtle grain
  col += snoise(gl_FragCoord.xy * 0.8) * 0.012;
  gl_FragColor = vec4(col, 1.0);
}
```

### Type C — Aurora Gradient

Multi-layer noise curtains with height envelopes, composited additively over a dark base.

```glsl
// Reusable curtain function
float curtain(vec2 uv, float t,
              float freqX, float freqDetail, float phaseOff,
              float speed, float centerY, float spread){
  float fold = snoise(vec2(uv.x*freqX + t*speed, 0.5+phaseOff));
  fold += 0.5*snoise(vec2(uv.x*freqDetail - t*speed*0.6, 1.0+phaseOff));
  fold += 0.25*snoise(vec2(uv.x*freqDetail*2.0 + t*speed*0.3,
                            uv.y*0.8 + phaseOff + 5.0));
  fold /= 1.75;
  float shape = smoothstep(-0.1, 0.6, fold);
  float env = exp(-pow((uv.y - centerY)/spread, 2.0));
  env *= smoothstep(0.0, 0.15, uv.y) * smoothstep(1.0, 0.75, uv.y);
  float yWave = snoise(vec2(uv.x*freqX*1.5 + t*speed*0.8,
                             uv.y*3.0 + t*0.1 + phaseOff));
  env *= 0.7 + 0.3*(yWave*0.5+0.5);
  return shape * env;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * 0.08;
  vec3 col = BASE_COLOR;   // darkest preset stop

  // Layer 3–4 curtains with different preset colors
  col += COLOR_A * curtain(uv, t, 2.2, 5.5,  0.0, 0.45, 0.55, 0.30) * 0.85;
  col += COLOR_B * curtain(uv, t, 1.8, 4.2, 10.0, 0.32, 0.48, 0.28) * 0.60;
  col += COLOR_C * curtain(uv, t, 3.0, 6.0, 20.0, 0.55, 0.60, 0.35) * 0.70;
  col += COLOR_D * curtain(uv, t, 1.5, 3.5, 30.0, 0.25, 0.35, 0.22) * 0.30;

  // Bloom
  float totalI = length(col - BASE_COLOR);
  col += col * totalI * 0.12;

  // Vignette
  vec2 vc = uv - 0.5;
  col *= 1.0 - dot(vc,vc) * 0.6;
  col = min(col, 1.0);
  gl_FragColor = vec4(col, 1.0);
}
```

### Type D — Noise-distorted Gradient

Inigo Quilez-style triple domain warp — FBM warps FBM warps FBM.

```glsl
void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = u_time * 0.06;

  // First domain-warp pass
  vec2 q = vec2(
    fbm(p + t * vec2(0.12, 0.08)),
    fbm(p + vec2(5.2,1.3) + t * vec2(0.08, 0.14))
  );
  // Second pass — warp the warp
  vec2 r = vec2(
    fbm(p + 4.0*q + vec2(1.7,9.2) + t * vec2(0.06, 0.04)),
    fbm(p + 4.0*q + vec2(8.3,2.8) + t * vec2(0.05, 0.07))
  );
  // Third pass
  float f = fbm(p + 4.0*r + t * 0.03);

  float s = f * 0.5 + 0.5;
  s = mix(s, uv.x*0.4 + uv.y*0.6, 0.28);
  s = smoothstep(0.05, 0.95, s);

  vec3 col = palette(s);
  // Depth modulation from warp vectors
  col = mix(col, col*(1.0 + 0.12*vec3(length(q), length(r)*0.8, dot(q,r))), 0.25);

  vec2 vc = uv - 0.5;
  col *= 1.0 - dot(vc,vc) * 0.5;
  gl_FragColor = vec4(col, 1.0);
}
```

---

## Step 4 — Integrate into the Project

### WebGL Lifecycle

Every integration must handle: **init → resize → animate → destroy**.

**React**:
```jsx
export function GradientShader({ className, style }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');
    // ... compile shaders, create program, setup quad buffer, get uniform locations

    const onResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = canvas.clientWidth  * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener('resize', onResize);
    onResize();

    const frame = (ts) => {
      gl.uniform1f(uTime, ts * 0.001);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} style={style} />;
}
```

**Vue `<script setup>`**:
```vue
<template>
  <canvas ref="canvasEl" :class="props.class" :style="props.style" />
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
const props = defineProps({ class: String, style: Object })
const canvasEl = ref(null)
let raf = 0
onMounted(() => { /* same GL init, resize, frame loop */ })
onUnmounted(() => { cancelAnimationFrame(raf); /* remove listener */ })
</script>
```

**Svelte**:
```svelte
<script>
  import { onMount, onDestroy } from 'svelte'
  let canvas
  let raf = 0
  onMount(() => { /* GL init */ })
  onDestroy(() => { cancelAnimationFrame(raf) })
</script>
<canvas bind:this={canvas} class={$$props.class} />
```

**Three.js / R3F** — if the project already uses it:
```jsx
<mesh>
  <planeGeometry args={[2, 2]} />
  <shaderMaterial
    vertexShader={vertexShader}
    fragmentShader={fragmentShader}
    uniforms={uniforms}
  />
</mesh>
```

**Vanilla module**:
```js
export function createGradientShader(container) {
  const canvas = document.createElement('canvas')
  container.appendChild(canvas)
  // ... GL init, resize observer, frame loop
  return {
    destroy() {
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      canvas.remove()
    }
  }
}
```

### Sizing & Layout

The canvas should conform to its container, not force `100vw × 100vh`:
- Use `canvas.clientWidth / clientHeight` for sizing, not `window.innerWidth`
- Apply `width: 100%; height: 100%;` via the project's styling system
- Use `ResizeObserver` (or the framework's resize mechanism) if the container isn't the viewport
- Always account for `devicePixelRatio` for Retina sharpness

### GLSL String Handling

- **Default**: inline the fragment shader as a JS template literal string
- **If a GLSL/shader loader exists** (e.g. `vite-plugin-glsl`, `raw-loader`): put the shader in a `.frag` or `.glsl` file and import it
- **If Three.js**: pass as `fragmentShader` prop to `ShaderMaterial`

---

## Delivery Requirements

- **Fit the project**: components, file names, exports, styling, directory structure — all must match existing conventions
- **No standalone HTML files** unless the project has no framework (pure static site)
- **Lifecycle discipline**: every `requestAnimationFrame` must be canceled on unmount; every event listener must be removed
- **Canvas sizing from container**: never hardcode viewport dimensions; the component receives its size from its parent via CSS
- **Colors from presets only** — no invented colors
- **Performance**: `precision highp float`, `devicePixelRatio` scaling, 60fps target
- **Comment**: include `// Preset: [name] | Type: [Liquid/Mesh/Aurora/Noise]` at the top of the shader string
- **Dark UI contexts**: reach for Dark or BluePurple family presets
- **Light / minimal UI contexts**: reach for Light family presets
- **High-energy / brand-forward contexts**: reach for Contrast or OKLCH pairs
- **Nature / wellness contexts**: reach for GreenYellow family
