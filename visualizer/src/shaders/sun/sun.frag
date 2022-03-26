#version 300 es

precision highp float;

in vec2 vtf_texCoord;

layout (location = 0) out vec4 out_color;
layout (location = 1) out vec4 out_bloom;

uniform sampler2D u_map_diffuse;

void main() {

    vec4 diffuseSample = texture(u_map_diffuse, vtf_texCoord);   

    out_color = vec4(diffuseSample.rgb, 1.0);
    out_bloom = out_color;
}