#version 300 es

precision highp float;

in vec2 vtf_texCoords;

layout (location = 0) out vec4 out_color;
layout (location = 1) out vec4 out_bloom;

uniform sampler2D u_ipp;

void main() {

    vec4 ippSample = texture(u_ipp, vtf_texCoords);

    if (ippSample.a == 0.0) discard;
    
    vec3 color = pow(ippSample.rgb, vec3(2.2));
    out_color = vec4(color, ippSample.a * 1.0);
    out_bloom = vec4(0.0);
}