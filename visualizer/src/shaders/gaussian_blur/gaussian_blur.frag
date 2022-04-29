#version 300 es

precision highp float;
precision highp int;

in vec2 vtf_texCoords;

out vec4 out_color;

uniform sampler2D u_image;
uniform float u_kernel[50];
uniform int u_kernel_size;
uniform bool u_horizontal;

void main() {
    vec2 texOffset = vec2(1.0) / vec2(textureSize(u_image, 0));
    vec3 result = vec3(0.0);

    if (u_horizontal) {
        for (int i = 0; i < u_kernel_size; i++) {
            float fi = float(i);
            result += texture(u_image, vtf_texCoords + vec2(texOffset.x * fi, 0.0)).rgb * u_kernel[i];
            result += texture(u_image, vtf_texCoords - vec2(texOffset.x * fi, 0.0)).rgb * u_kernel[i];
        }
    } else {
        for (int i = 0; i < u_kernel_size; i++) {
            float fi = float(i);
            result += texture(u_image, vtf_texCoords + vec2(0.0, texOffset.y * fi)).rgb * u_kernel[i];
            result += texture(u_image, vtf_texCoords - vec2(0.0, texOffset.y * fi)).rgb * u_kernel[i];
        }
    }

    out_color = vec4(result, 1.0);
}