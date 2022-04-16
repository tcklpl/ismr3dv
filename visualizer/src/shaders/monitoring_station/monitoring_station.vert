#version 300 es

precision highp float;

layout (location = 0) in vec3 a_position;
layout (location = 1) in vec2 a_uv;

out vec2 vtf_texCoord;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

void main() {
    vtf_texCoord = vec2(1.0 - a_uv.x, a_uv.y);
    gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.0);
}