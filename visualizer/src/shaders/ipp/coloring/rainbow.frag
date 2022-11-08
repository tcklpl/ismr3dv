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

vec3 hsvToRgb(float h, float s, float v) {
    float h2 = h / 60.0;
    float chroma = v * s;
    float x = chroma * (1.0 - abs(mod(h2, 2.0) - 1.0));
    float m = v - chroma;

    if (h2 <= 1.0) {
        return vec3(chroma + m, x + m, m);
    } else if (h2 <= 2.0) {
        return vec3(x + m, chroma + m, m);
    } else if (h2 <= 3.0) {
        return vec3(m, chroma + m, x + m);
    } else if (h2 <= 4.0) {
        return vec3(m, x + m, chroma + m);
    } else if (h2 <= 5.0) {
        return vec3(x + m, m, chroma + m);
    } else if (h2 <= 6.0) {
        return vec3(chroma + m, m, x + m);
    }
    return vec3(0, 0, 0);
}

void main() {

    float data = texture(u_data, vtf_texCoords).r;
    float normalized = normalization(data);

    // The values will stop at 270 because I don't want purple
    float valDegrees = 270.0 - (normalized * 270.0);

    out_color = vec4(hsvToRgb(valDegrees, 1.0, 1.0), data > 0.0 ? 1.0 : 0.0);
}