#version 300 es

precision highp float;

layout (location = 0) in vec3 a_position;
layout (location = 1) in vec2 a_uv;
layout (location = 2) in vec3 a_normal;
layout (location = 3) in vec3 a_tangent;
layout (location = 4) in vec3 a_bitangent;

out vec2 vtf_texCoord;
out vec4 vtf_vertPos_modelSpace;
out vec4 vtf_vertPos_cameraSpace;

out vec3 vtf_normal_modelSpace;
out vec3 vtf_tangent_modelSpace;
out vec3 vtf_bitangent_modelSpace;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

void main() {
    vec4 modelCoords = u_model * vec4(a_position, 1.0);
    vec4 viewCoords = u_view * modelCoords;

    vtf_texCoord = vec2(1.0 - a_uv.x, a_uv.y);
    vtf_vertPos_modelSpace = modelCoords;
    vtf_vertPos_cameraSpace = viewCoords;

    mat3 modelView3x3 = mat3(inverse(u_model));
    vtf_normal_modelSpace = modelView3x3 * normalize(a_normal);
    vtf_tangent_modelSpace = modelView3x3 * normalize(a_tangent);
    vtf_bitangent_modelSpace = modelView3x3 * normalize(a_bitangent);

    gl_Position = u_projection * viewCoords;
}