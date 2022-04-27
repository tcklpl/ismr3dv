#version 300 es

precision highp float;

in vec2 vtf_texCoords;

out vec4 out_color;

uniform sampler2D u_bloom_pass_1;
uniform sampler2D u_bloom_pass_2;
uniform sampler2D u_bloom_pass_3;

uniform int u_box_blur_intensity;

vec3 box_blur(sampler2D map) {
    vec2 texelSize = vec2(1.0) / vec2(textureSize(map, 0));
    vec3 result = vec3(0.0);
    for (int x = -u_box_blur_intensity; x <= u_box_blur_intensity; x++) {
        for (int y = -u_box_blur_intensity; y <= u_box_blur_intensity; y++) {
            result += texture(map, vtf_texCoords + vec2(x, y) * texelSize).rgb;
        }
    }
    return result / 9.0;
}

void main() {
    vec3 b1 = box_blur(u_bloom_pass_1);
    vec3 b2 = box_blur(u_bloom_pass_2);
    vec3 b3 = box_blur(u_bloom_pass_3);

    vec3 color = b1 + b2 + b3;

    out_color = vec4(color, 1.0);
}