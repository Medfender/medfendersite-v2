// morphParticles.frag
// Metallic grain fragment shader for the particle points.
// Uses gl_PointCoord to create a 3D, tactile feel (disc + specular + rim).

precision highp float;

varying vec3  vColor;
varying float vAlpha;

void main() {
  // Circular point disc with soft edge
  vec2 uv = gl_PointCoord - 0.5;
  float dist = length(uv);
  float disc = smoothstep(0.5, 0.28, dist);
  if (disc < 0.005) discard;

  // Fake 3D normal derived from point coord curvature
  float z = sqrt(max(0.0, 1.0 - dot(uv * 2.0, uv * 2.0)));
  vec3 normal = normalize(vec3(uv * 2.0, z));

  // Directional light (key light: top-right-front)
  vec3 lightDir = normalize(vec3(0.6, 0.8, 1.0));
  float diffuse = max(dot(normal, lightDir), 0.0);

  // Rim / fresnel glow (cyan-tinted)
  float rim = pow(1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0), 2.5);

  // Specular highlight for metallic grain feel
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 halfVec = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfVec), 0.0), 48.0);

  // Compose color: base color + diffuse lighting + cyan rim + spec
  vec3 col = vColor * (0.35 + diffuse * 0.55);
  col += vec3(0.0, 0.847, 0.965) * rim * 0.55;  // cyan rim glow
  col += vec3(1.0) * spec * 0.7;                  // sharp white spec

  gl_FragColor = vec4(col, disc * vAlpha);
}
