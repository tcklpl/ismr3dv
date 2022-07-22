#version 300 es
/*
    Physics based bloom - downsampling
    https://learnopengl.com/Guest-Articles/2022/Phys.-Based-Bloom

    Originally from the Call of Duty method, presented at ACM Siggraph 2014.
*/

precision highp float;

uniform sampler2D u_src_texture;
uniform vec2 u_src_resolution;

in vec2 vtf_texCoords;
out vec3 downsample;

void main() {
    vec2 srcTexelSize = 1.0 / u_src_resolution;
    float x = srcTexelSize.x;
    float y = srcTexelSize.y;

    /*
        Take 13 samples around the current texel:

        a - b - c
        - j - k -
        d - e - f
        - l - m -
        g - h - i
    */
    vec3 a = texture(u_src_texture, vec2(vtf_texCoords.x - 2.0 * x, vtf_texCoords.y + 2.0 * y)).rgb;
    vec3 b = texture(u_src_texture, vec2(vtf_texCoords.x          , vtf_texCoords.y + 2.0 * y)).rgb;
    vec3 c = texture(u_src_texture, vec2(vtf_texCoords.x + 2.0 * x, vtf_texCoords.y + 2.0 * y)).rgb;

    vec3 d = texture(u_src_texture, vec2(vtf_texCoords.x - 2.0 * x, vtf_texCoords.y)).rgb;
    vec3 e = texture(u_src_texture, vec2(vtf_texCoords.x          , vtf_texCoords.y)).rgb;
    vec3 f = texture(u_src_texture, vec2(vtf_texCoords.x + 2.0 * x, vtf_texCoords.y)).rgb;

    vec3 g = texture(u_src_texture, vec2(vtf_texCoords.x - 2.0 * x, vtf_texCoords.y - 2.0 * y)).rgb;
    vec3 h = texture(u_src_texture, vec2(vtf_texCoords.x          , vtf_texCoords.y - 2.0 * y)).rgb;
    vec3 i = texture(u_src_texture, vec2(vtf_texCoords.x + 2.0 * x, vtf_texCoords.y - 2.0 * y)).rgb;

    vec3 j = texture(u_src_texture, vec2(vtf_texCoords.x - x, vtf_texCoords.y + y)).rgb;
    vec3 k = texture(u_src_texture, vec2(vtf_texCoords.x + x, vtf_texCoords.y + y)).rgb;
    vec3 l = texture(u_src_texture, vec2(vtf_texCoords.x - x, vtf_texCoords.y - y)).rgb;
    vec3 m = texture(u_src_texture, vec2(vtf_texCoords.x + x, vtf_texCoords.y - y)).rgb;

    downsample = e * 0.125;
    downsample += (a + c + g + i) * 0.03125;
    downsample += (b + d + f + h) * 0.0625;
    downsample += (j + k + l + m) * 0.125;
}