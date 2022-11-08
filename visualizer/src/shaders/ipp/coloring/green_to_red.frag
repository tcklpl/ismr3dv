#version 300 es

precision highp float;

in vec2 vtf_texCoords;

out vec4 out_color;

uniform sampler2D u_data;
uniform float u_min;
uniform float u_max;

float normalization(float val) {
    return (val - u_min) / (u_max - u_min);
}

void main() {

    float data = texture(u_data, vtf_texCoords).r;
    float normalized = normalization(data);

    float greenAmount = 1.0 - normalized;
    float redAmount = normalized;

    out_color = vec4(redAmount, greenAmount, 0.0, data > 0.0 ? 1.0 : 0.0);
}