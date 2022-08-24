#version 300 es

precision highp float;

in vec2 vtf_texCoords;

out vec4 out_color;

uniform sampler2D u_data;
const float PI = 3.141592653;

void main() {

    float data = texture(u_data, vtf_texCoords).r;
    float valRadians = data * 2.0 * PI;

    float cosRadians = cos(valRadians);

    float r = valRadians >= PI ? cosRadians : -1.0;
    float g = cos(valRadians + PI);
    float b = valRadians <= PI ? cosRadians : -1.0;
    
    r = (r + 1.0) / 2.0;
    g = (g + 1.0) / 2.0;
    b = (b + 1.0) / 2.0;

    out_color = vec4(r, g, b, data > 0.0 ? 1.0 : 0.0);
}