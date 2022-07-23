#version 300 es

precision highp float;

layout (location = 0) in vec3 a_position;

out vec3 vtf_texCoords;

uniform mat4 u_view;
uniform mat4 u_projection;

void main() {
    vec4 pos = gl_Position = u_projection * u_view * vec4(a_position, 1.0);
    gl_Position = pos.xyww;
    vtf_texCoords = a_position;
}