#version 300 es

precision highp float;

in vec2 vtf_texCoords;
out vec4 out_color;

uniform sampler2D u_buffer;
uniform int u_buffer_length;
uniform float u_distance_threshold;

void main() {
    
    float incidence = 0.0;

    for (int i = 0; i < u_buffer_length; i++) {
        vec3 bufferInfo = texelFetch(u_buffer, ivec2(i, 0), 0).xyz;
        if (distance(vtf_texCoords, bufferInfo.xy) <= u_distance_threshold) {
            incidence += 0.1;
        }
    }

    out_color = vec4(incidence);
}