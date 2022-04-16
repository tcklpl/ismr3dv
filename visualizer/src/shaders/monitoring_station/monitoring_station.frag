#version 300 es

precision highp float;

in vec2 vtf_texCoord;

layout (location = 0) out vec4 out_color;
layout (location = 1) out vec4 out_bloom;

uniform vec3 u_color;

void main() {

    out_color = vec4(u_color, 1.0);
    out_bloom = vec4(vec3(0.0), 1.0);
}