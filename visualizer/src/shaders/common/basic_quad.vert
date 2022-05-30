#version 300 es

precision highp float;

layout (location = 0) in vec3 a_position;
layout (location = 1) in vec2 a_uv;

out vec2 vtf_texCoords;

void main() {
    vtf_texCoords = a_uv;
    gl_Position = vec4(a_position, 1.0);
}