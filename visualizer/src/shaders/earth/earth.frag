#version 300 es

precision highp float;

in vec2 vtf_texCoord;

in vec3 vtf_normal_cameraSpace;
in vec3 vtf_tangent_cameraSpace;
in vec3 vtf_bitangent_cameraSpace;

out vec4 out_color;

uniform sampler2D u_map_day;
uniform sampler2D u_map_night;
uniform sampler2D u_map_clouds;
uniform sampler2D u_map_normal;
uniform sampler2D u_map_specular;

vec3 calculateNormal(vec4 normalSample) {
    vec3 normalRaw = normalize(normalSample.rgb * 2.0 - 1.0);
    
    mat3 tbn = mat3(
        vtf_tangent_cameraSpace,
        vtf_bitangent_cameraSpace,
        vtf_normal_cameraSpace
    );
    
    return normalize(tbn * normalRaw);
}

void main() {

    vec4 dayMapSample = texture(u_map_day, vtf_texCoord);
    vec4 nightMapSample = texture(u_map_night, vtf_texCoord);
    vec4 cloudMapSample = texture(u_map_clouds, vtf_texCoord);
    vec4 normalMapSample = texture(u_map_normal, vtf_texCoord);
    vec4 specularMapSample = texture(u_map_specular, vtf_texCoord);    

    vec3 normal = calculateNormal(normalMapSample);

    float incidence = dot(normal, vec3(3.0, 2.0, 0.0));

    out_color = vec4(dayMapSample.rgb * incidence, 1.0);
}