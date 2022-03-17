#version 300 es

precision highp float;

in vec2 vtf_texCoord;

out vec4 out_color;

uniform sampler2D u_map_day;
uniform sampler2D u_map_night;
uniform sampler2D u_map_clouds;
uniform sampler2D u_map_normal;
uniform sampler2D u_map_specular;

void main() {

    vec4 test1 = texture(u_map_day, vtf_texCoord);
    vec4 test2 = texture(u_map_night, vtf_texCoord);
    vec4 test3 = texture(u_map_clouds, vtf_texCoord);
    vec4 test4 = texture(u_map_normal, vtf_texCoord);
    vec4 test5 = texture(u_map_specular, vtf_texCoord);

    out_color = vec4(test1.rgb, 1.0);
}