#version 300 es

precision highp float;

in vec2 vtf_texCoords;

out vec4 out_color;

uniform sampler2D u_color_buffer;
uniform sampler2D u_bloom_buffer;
uniform float u_exposure;

void main() {
    const float gamma = 1.0;

    vec3 color = texture(u_color_buffer, vtf_texCoords).rgb;
    vec3 bloom = texture(u_bloom_buffer, vtf_texCoords).rgb;

    bool isBlackFragment = color.r == 0.0 && color.g == 0.0 && color.b == 0.0;

    color += bloom;

    vec3 result = vec3(1.0) - exp(-color * u_exposure);
    result = pow(result, vec3(1.0 / gamma));

    out_color = vec4(color, 1.0);
}