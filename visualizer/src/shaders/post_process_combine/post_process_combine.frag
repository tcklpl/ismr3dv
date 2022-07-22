#version 300 es

precision highp float;

in vec2 vtf_texCoords;

out vec4 out_color;

uniform sampler2D u_color_buffer;
uniform sampler2D u_bloom_buffer;
uniform bool u_bloom;

uniform float u_exposure;
uniform float u_bloom_strength;
uniform float u_gamma;

void main() {
    vec3 color = texture(u_color_buffer, vtf_texCoords).rgb;
    vec3 bloom = texture(u_bloom_buffer, vtf_texCoords).rgb;

    if (u_bloom) {
        color = mix(color, bloom, u_bloom_strength);
    }

    // tone mapping
    color = vec3(1.0) - exp(-color * u_exposure);
    // gamma correction
    color = pow(color, vec3(1.0 / u_gamma));

    out_color = vec4(color, 1.0);
}