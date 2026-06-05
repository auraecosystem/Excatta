precision mediump float;
uniform sampler2D uTex;
uniform float uThreshold;    // 0.0 .. 1.0
varying vec2 vTexCoord;

void main() {
  vec4 c = texture2D(uTex, vTexCoord);
  // convert to luminance (BT.601)
  float lum = dot(c.rgb, vec3(0.299, 0.587, 0.114));
  float outVal = lum >= uThreshold ? 1.0 : 0.0;
  // output binary color, preserve alpha
  gl_FragColor = vec4(vec3(outVal), c.a);
}
