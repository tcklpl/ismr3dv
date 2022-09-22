#version 300 es

precision highp float;

layout (location = 0) in vec3 a_position;
layout (location = 1) in vec2 a_uv;
layout (location = 2) in vec3 a_normal;

out vec2 vtf_texCoord;
out vec4 vtf_vertPos_modelSpace;
out vec4 vtf_vertPos_cameraSpace;
out vec3 vtf_normal_cameraSpace;
out vec3 vtf_normal;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

void main() {
    vec4 modelCoords = u_model * vec4(a_position, 1.0);
    vec4 viewCoords = u_view * modelCoords;

    vtf_texCoord = vec2(a_uv.x, 1.0 - a_uv.y);
    vtf_vertPos_modelSpace = modelCoords;
    vtf_vertPos_cameraSpace = viewCoords;
    mat3 modelView3x3 = mat3(u_view * u_model);
    vtf_normal_cameraSpace = modelView3x3 * a_normal;
    vtf_normal = a_normal;

    gl_Position = u_projection * viewCoords;
}