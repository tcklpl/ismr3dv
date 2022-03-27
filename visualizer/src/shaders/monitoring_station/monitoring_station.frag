#version 300 es

precision highp float;

in vec2 vtf_texCoord;
in vec4 vtf_vertPos_modelSpace;

in vec3 vtf_normal_modelSpace;
in vec3 vtf_tangent_modelSpace;
in vec3 vtf_bitangent_modelSpace;

layout (location = 0) out vec4 out_color;
layout (location = 1) out vec4 out_bloom;

uniform sampler2D u_map_diffuse;
uniform sampler2D u_map_normal;

uniform vec3 u_sun_position;

vec3 calculateNormal(vec4 normalSample) {
    vec3 normalRaw = normalize(normalSample.rgb * 2.0 - 1.0);

    mat3 tbn = mat3(
        vtf_tangent_modelSpace,
        vtf_bitangent_modelSpace,
        vtf_normal_modelSpace
    );

    return normalize(tbn * normalRaw);
}

void main() {

    vec4 diffuseSample = texture(u_map_diffuse, vtf_texCoord);
    vec4 normalMapSample = texture(u_map_normal, vtf_texCoord);

    vec3 normal = calculateNormal(normalMapSample);

    vec3 lightDirection = u_sun_position - vtf_vertPos_modelSpace.xyz;
    vec3 lightDirectionUnit = normalize(lightDirection);

    float incidence = dot(normal, lightDirectionUnit);

    out_color = vec4(diffuseSample.rgb * incidence, 1.0);
    out_bloom = vec4(vec3(0.0), 1.0);
}