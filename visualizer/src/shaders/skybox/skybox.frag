#version 300 es

precision highp float;

layout (location = 0) out vec4 out_color;
layout (location = 1) out vec4 out_bloom;

in vec3 vtf_texCoords;

uniform samplerCube u_skybox;

void main() {
    out_color = texture(u_skybox, vtf_texCoords);
    out_color = vec4(pow(out_color.rgb, vec3(2.2)), 1.0);
    out_bloom = vec4(0.0);
}
