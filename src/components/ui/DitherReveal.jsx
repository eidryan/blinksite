import React, { forwardRef, useImperativeHandle, useEffect, useRef } from 'react';

const vertexSrc = `#version 300 es
precision mediump float;
layout(location = 0) in vec4 a_position;
void main() { gl_Position = a_position; }
`;

const fragmentSrc = `#version 300 es
precision mediump float;

uniform vec2 u_resolution;
uniform float u_progress;
uniform float u_ringCount;
uniform float u_bandWidth;
uniform float u_type;
uniform float u_pxSize;
uniform float u_innerBright;
uniform float u_outerDim;

out vec4 fragColor;

float hash21(vec2 p) {
  p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}

const int bayer2x2[4] = int[4](0, 2, 3, 1);
const int bayer4x4[16] = int[16](
  0,  8,  2, 10, 12,  4, 14,  6,
  3, 11,  1,  9, 15,  7, 13,  5
);
const int bayer8x8[64] = int[64](
   0, 32,  8, 40,  2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44,  4, 36, 14, 46,  6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
   3, 35, 11, 43,  1, 33,  9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47,  7, 39, 13, 45,  5, 37,
  63, 31, 55, 23, 61, 29, 53, 21
);

float getBayerValue(vec2 uv, int size) {
  ivec2 pos = ivec2(mod(uv, float(size)));
  int index = pos.y * size + pos.x;
  if (size == 2) return float(bayer2x2[index]) / 4.0;
  else if (size == 4) return float(bayer4x4[index]) / 16.0;
  else if (size == 8) return float(bayer8x8[index]) / 64.0;
  return 0.0;
}

float getDitherThreshold(vec2 fragCoord, float pxSize, int ditherType) {
  vec2 ditherUv = fragCoord / pxSize;
  if (ditherType == 1) return hash21(floor(ditherUv));
  else if (ditherType == 2) return getBayerValue(ditherUv, 2);
  else if (ditherType == 3) return getBayerValue(ditherUv, 4);
  else return getBayerValue(ditherUv, 8);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv -= 0.5;

  float aspect = u_resolution.x / u_resolution.y;
  vec2 pos = uv;
  pos.x *= aspect;
  float dist = length(pos);

  // No progress = fully transparent
  if (u_progress < 0.001) {
    fragColor = vec4(0.0, 0.0, 0.0, 0.0);
    return;
  }

  // Band boundaries
  float outerRadius = u_progress * 1.6;
  float innerRadius = outerRadius - u_bandWidth;

  // OUTSIDE: fully transparent
  if (dist > outerRadius) {
    fragColor = vec4(0.0, 0.0, 0.0, 0.0);
    return;
  }

  // CENTER: fully transparent (next section shows)
  if (dist < innerRadius) {
    fragColor = vec4(0.0, 0.0, 0.0, 0.0);
    return;
  }

  // In the gradient band: compute brightness
  float t = 1.0 - (dist - innerRadius) / u_bandWidth;
  t = clamp(t, 0.0, 1.0);

  // Quantize into discrete steps
  float stepSize = 1.0 / u_ringCount;
  float quantizedT = floor(t / stepSize) * stepSize + stepSize * 0.5;
  quantizedT = clamp(quantizedT, 0.0, 1.0);

  float brightness = mix(u_outerDim, u_innerBright, quantizedT);

  // Dither threshold test
  int ditherType = int(floor(u_type));
  float threshold = getDitherThreshold(gl_FragCoord.xy, u_pxSize, ditherType);

  // RING BAND: dithered white dots
  float pixel = step(threshold, brightness);

  // pixel=1 -> white dot (opaque), pixel=0 -> transparent (hero shows)
  fragColor = vec4(1.0, 1.0, 1.0, pixel);
}
`;

const DitherReveal = forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const progressRef = useRef(0);

  // Expose progress property to GSAP
  useImperativeHandle(ref, () => ({
    get progress() { return progressRef.current; },
    set progress(v) { progressRef.current = v; }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false });
    if (!gl) {
      console.error('WebGL2 not supported');
      return;
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    const compileShader = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Shader error:', gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    const vsh = compileShader(gl.VERTEX_SHADER, vertexSrc);
    const fsh = compileShader(gl.FRAGMENT_SHADER, fragmentSrc);

    if (!vsh || !fsh) return;

    const program = gl.createProgram();
    gl.attachShader(program, vsh);
    gl.attachShader(program, fsh);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Link error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return;
    }

    gl.useProgram(program);

    const posLoc = gl.getAttribLocation(program, 'a_position');
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1
    ]), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const loc = {
      u_resolution: gl.getUniformLocation(program, 'u_resolution'),
      u_progress: gl.getUniformLocation(program, 'u_progress'),
      u_ringCount: gl.getUniformLocation(program, 'u_ringCount'),
      u_bandWidth: gl.getUniformLocation(program, 'u_bandWidth'),
      u_type: gl.getUniformLocation(program, 'u_type'),
      u_pxSize: gl.getUniformLocation(program, 'u_pxSize'),
      u_innerBright: gl.getUniformLocation(program, 'u_innerBright'),
      u_outerDim: gl.getUniformLocation(program, 'u_outerDim'),
    };

    const resize = () => {
      // Need to measure parent to be responsive, but since this is overlaying 
      // the window, we can just use window dimensions.
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener('resize', resize);
    resize();

    let rafId;
    const render = () => {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);

      gl.uniform2f(loc.u_resolution, canvas.width, canvas.height);
      gl.uniform1f(loc.u_progress, progressRef.current);

      // Hardcoded tuned parameters from prompt requirement
      gl.uniform1f(loc.u_ringCount, 3);
      gl.uniform1f(loc.u_bandWidth, 0.25);
      gl.uniform1f(loc.u_type, 4); // 4 = 8x8 Bayer
      gl.uniform1f(loc.u_pxSize, 3);
      gl.uniform1f(loc.u_innerBright, 0.40);
      gl.uniform1f(loc.u_outerDim, 0.05);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafId);
      gl.deleteProgram(program);
      gl.deleteShader(vsh);
      gl.deleteShader(fsh);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full block pointer-events-none"
    />
  );
});

DitherReveal.displayName = 'DitherReveal';

export default DitherReveal;
