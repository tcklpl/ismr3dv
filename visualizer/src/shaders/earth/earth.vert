#version 300 es

precision highp float;

layout (location = 0) in vec3 a_position;
layout (location = 1) in vec2 a_uv;
layout (location = 2) in vec3 a_normal;
layout (location = 3) in vec3 a_tangent;
layout (location = 4) in vec3 a_bitangent;

out vec2 vtf_texCoord;
out vec4 vtf_viewCoords;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

void main() {
    vec4 viewCoords = u_view * u_model * vec4(a_position, 1.0);
    vtf_viewCoords = viewCoords;
    gl_Position = u_projection * viewCoords;
    vtf_texCoord = vec2(1.0 - a_uv.x, a_uv.y);
}