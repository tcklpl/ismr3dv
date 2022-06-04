#version 300 es

precision highp float;

in vec2 vtf_texCoords;
out vec4 out_color;

uniform sampler2D u_buffer_r;
uniform sampler2D u_buffer_g;
uniform sampler2D u_buffer_b;
uniform sampler2D u_buffer_a;
uniform int u_buffer_r_length;
uniform int u_buffer_g_length;
uniform int u_buffer_b_length;
uniform int u_buffer_a_length;
uniform float u_distance_threshold;
uniform int u_available_buffers;

bool isFragmentInRange(vec2 target) {
    float dx = (target.x - vtf_texCoords.x) * 2.0;
    float dy = target.y - vtf_texCoords.y;
    return sqrt(dx * dx + dy * dy) <= u_distance_threshold;
}

float getFragmentImportance(sampler2D targetBuffer, int bufferSize) {
    float importance = 0.0;
    for (int i = 0; i < bufferSize; i++) {
        vec3 bufferInfo = texelFetch(targetBuffer, ivec2(i, 0), 0).xyz;
        if (isFragmentInRange(bufferInfo.xy)) {
            importance += bufferInfo.z;
        }
    }
    return importance;
}

void main() {
    
    float incidenceR = 0.0;
    float incidenceG = 0.0;
    float incidenceB = 0.0;
    float incidenceA = 0.0;

    if (u_available_buffers >= 1) incidenceR = getFragmentImportance(u_buffer_r, u_buffer_r_length);
    if (u_available_buffers >= 2) incidenceG = getFragmentImportance(u_buffer_g, u_buffer_g_length);
    if (u_available_buffers >= 3) incidenceB = getFragmentImportance(u_buffer_b, u_buffer_b_length);
    if (u_available_buffers >= 4) incidenceA = getFragmentImportance(u_buffer_a, u_buffer_a_length);

    out_color = vec4(incidenceR, incidenceG, incidenceB, incidenceA);
}