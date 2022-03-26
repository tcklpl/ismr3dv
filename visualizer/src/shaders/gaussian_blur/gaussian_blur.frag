#version 300 es

precision highp float;
precision highp int;

in vec2 vtf_texCoords;

out vec4 out_color;

uniform sampler2D u_image;
uniform bool u_horizontal;

float weight[5] = float[] (0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);

float xMultiplier = 5.0;
float yMultiplier = 5.0;

void main() {
    vec2 texOffset = vec2(1.0) / vec2(textureSize(u_image, 0));
    vec3 result = texture(u_image, vtf_texCoords).rgb * weight[0];

    if (u_horizontal) {
        for (int i = 0; i < 5; i++) {
            float fi = float(i);
            result += texture(u_image, vtf_texCoords + vec2(texOffset.x * fi * xMultiplier, 0.0)).rgb * weight[i];
            result += texture(u_image, vtf_texCoords - vec2(texOffset.x * fi * xMultiplier, 0.0)).rgb * weight[i];
        }
    } else {
        for (int i = 0; i < 5; i++) {
            float fi = float(i);
            result += texture(u_image, vtf_texCoords + vec2(0.0, texOffset.x * fi * yMultiplier)).rgb * weight[i];
            result += texture(u_image, vtf_texCoords - vec2(0.0, texOffset.x * fi * yMultiplier)).rgb * weight[i];
        }
    }

    out_color = vec4(result, 1.0);
}