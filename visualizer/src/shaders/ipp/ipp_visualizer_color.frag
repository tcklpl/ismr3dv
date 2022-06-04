#version 300 es

precision highp float;

in vec2 vtf_texCoords;

layout (location = 0) out vec4 out_color;
layout (location = 1) out vec4 out_bloom;

uniform sampler2D u_ipp;
uniform int u_channel;

void main() {

    vec4 ippSample = texture(u_ipp, vtf_texCoords);   

    float incidence =
        u_channel == 0 ? ippSample.r :
        u_channel == 1 ? ippSample.g :
        u_channel == 2 ? ippSample.b :
        ippSample.a;
    
    // out_color = vec4(vec3(0.0 + ippSample.r + ippSample.g + ippSample.b + ippSample.a), 1.0);
    out_color = vec4(vec3(incidence), incidence > 0.0 ? 0.5 : 0.0);
    out_bloom = vec4(0.0);
}