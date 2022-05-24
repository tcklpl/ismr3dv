#version 300 es

precision highp float;

layout (location = 0) out vec4 out_color;
layout (location = 1) out vec4 out_bloom;

uniform vec3 u_color;
uniform bool u_apply_bloom;

void main() {

    out_color = vec4(u_color, 1.0);
    out_bloom = vec4(u_apply_bloom ? u_color * 0.5 : vec3(0.0), 1.0);
}