#version 300 es

precision highp float;

in vec2 vtf_texCoord;

out vec4 out_color;

uniform sampler2D u_map_diffuse;

void main() {

    vec4 diffuseSample = texture(u_map_diffuse, vtf_texCoord);   

    out_color = vec4(diffuseSample.rgb, 1.0);
}