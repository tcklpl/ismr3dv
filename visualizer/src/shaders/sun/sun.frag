#version 300 es

precision highp float;

in vec2 vtf_texCoord;

layout (location = 0) out vec4 out_color;
layout (location = 1) out vec4 out_bloom;

uniform sampler2D u_map_diffuse;

void main() {

    vec4 diffuseSample = texture(u_map_diffuse, vtf_texCoord);   

    // Inverse gamma correction, as this texture is already gamma corrected
    out_color = vec4(pow(diffuseSample.rgb, vec3(2.2)) * 2.0, 1.0);
    out_bloom = out_color;
}