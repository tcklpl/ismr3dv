#version 300 es
/*
    Physics based bloom - upsampling with a 3x3 kernel
    https://learnopengl.com/Guest-Articles/2022/Phys.-Based-Bloom

    Originally from the Call of Duty method, presented at ACM Siggraph 2014.
*/

precision highp float;

uniform sampler2D u_src_texture;
uniform float u_radius;

in vec2 vtf_texCoords;
out vec3 upsample;

void main() {
    float x = u_radius;
    float y = u_radius;

    /*
        Take 9 samples around the current texel:
        a - b - c
        d - e - f
        g - h - i
    */
    vec3 a = texture(u_src_texture, vec2(vtf_texCoords.x - x, vtf_texCoords.y + y)).rgb;
    vec3 b = texture(u_src_texture, vec2(vtf_texCoords.x    , vtf_texCoords.y + y)).rgb;
    vec3 c = texture(u_src_texture, vec2(vtf_texCoords.x + x, vtf_texCoords.y + y)).rgb;

    vec3 d = texture(u_src_texture, vec2(vtf_texCoords.x - x, vtf_texCoords.y)).rgb;
    vec3 e = texture(u_src_texture, vec2(vtf_texCoords.x    , vtf_texCoords.y)).rgb;
    vec3 f = texture(u_src_texture, vec2(vtf_texCoords.x + x, vtf_texCoords.y)).rgb;

    vec3 g = texture(u_src_texture, vec2(vtf_texCoords.x - x, vtf_texCoords.y - y)).rgb;
    vec3 h = texture(u_src_texture, vec2(vtf_texCoords.x    , vtf_texCoords.y - y)).rgb;
    vec3 i = texture(u_src_texture, vec2(vtf_texCoords.x + x, vtf_texCoords.y - y)).rgb;

    /*
        Apply weighted distribution, by using a 3x3 tent filter:
        1    |1 2 1|
        -- * |2 4 2|
        16   |1 2 1|
    */
    upsample = e * 4.0;
    upsample += (b + d + f + h) * 2.0;
    upsample += (a + c + g + i);
    upsample *= 1.0 / 16.0;
}