#version 300 es

precision highp float;

in vec2 vtf_texCoords;

out vec4 out_color;

uniform sampler2D u_color_buffer;
uniform sampler2D u_bloom_buffer;
uniform bool u_bloom;

void main() {
    vec3 color = texture(u_color_buffer, vtf_texCoords).rgb;
    vec3 bloom = texture(u_bloom_buffer, vtf_texCoords).rgb;

    if (u_bloom) {
        color += bloom;
    }

    out_color = vec4(color, 1.0);
}