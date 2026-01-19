import { onMount, onCleanup } from "solid-js";
import "./WaveShader.css";

const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec3 u_color;

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    
    // Create wave effect
    float wave1 = sin(uv.x * 10.0 + u_time * 2.0) * 0.1;
    float wave2 = sin(uv.x * 15.0 - u_time * 1.5 + 1.0) * 0.05;
    float wave3 = sin(uv.x * 8.0 + u_time * 0.8 + 2.0) * 0.08;
    
    float combinedWave = wave1 + wave2 + wave3;
    float distFromWave = abs(uv.y - 0.5 - combinedWave);
    
    // Glow effect around the wave
    float glow = 0.02 / distFromWave;
    glow = clamp(glow, 0.0, 1.0);
    
    // Additional horizontal waves for ambient effect
    float ambient = sin(uv.y * 20.0 + u_time) * 0.02;
    ambient += sin(uv.x * 25.0 + uv.y * 10.0 - u_time * 0.5) * 0.015;
    
    // Combine colors
    vec3 baseColor = u_color * 0.01;
    vec3 waveColor = u_color * glow;
    vec3 ambientColor = u_color * ambient;
    
    vec3 finalColor = baseColor + waveColor + ambientColor;
    
    gl_FragColor = vec4(finalColor, 0.6);
  }
`;

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

type WaveShaderProps = {
  color?: [number, number, number];
};

export function WaveShader(props: WaveShaderProps) {
  let canvasRef: HTMLCanvasElement | undefined;
  let animationId: number;
  let gl: WebGLRenderingContext | null = null;

  const color = () => props.color ?? [1, 0.74, 0.97];

  onMount(() => {
    if (!canvasRef) return;

    gl = canvasRef.getContext("webgl", { alpha: true });
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource,
    );
    if (!vertexShader || !fragmentShader) return;

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;

    gl.useProgram(program);

    // Create full-screen quad
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLocation = gl.getUniformLocation(program, "u_time");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const colorLocation = gl.getUniformLocation(program, "u_color");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const resize = () => {
      if (!canvasRef || !gl) return;
      canvasRef.width = canvasRef.clientWidth;
      canvasRef.height = canvasRef.clientHeight;
      gl.viewport(0, 0, canvasRef.width, canvasRef.height);
    };

    resize();
    window.addEventListener("resize", resize);

    const startTime = performance.now();

    const render = () => {
      if (!gl || !canvasRef) return;

      const time = (performance.now() - startTime) / 1000;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform1f(timeLocation, time);
      gl.uniform2f(resolutionLocation, canvasRef.width, canvasRef.height);
      gl.uniform3fv(colorLocation, color());

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationId = requestAnimationFrame(render);
    };

    render();

    onCleanup(() => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    });
  });

  return <canvas ref={canvasRef} class="wave-shader-canvas" />;
}
