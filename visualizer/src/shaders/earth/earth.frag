#version 300 es

precision highp float;

in vec2 vtf_texCoord;
in vec4 vtf_vertPos_modelSpace;
in vec4 vtf_vertPos_cameraSpace;
in vec3 vtf_normal_cameraSpace;

in vec3 vtf_normal_modelSpace;
in vec3 vtf_tangent_modelSpace;
in vec3 vtf_bitangent_modelSpace;

layout (location = 0) out vec4 out_color;
layout (location = 1) out vec4 out_bloom;

uniform sampler2D u_map_day;
uniform sampler2D u_map_night;
uniform sampler2D u_map_clouds;
uniform sampler2D u_map_normal;
uniform sampler2D u_map_specular;

uniform vec3 u_sun_position;
uniform mat4 u_view;

vec3 calculateNormal(vec4 normalSample) {
    vec3 normalRaw = normalize(normalSample.rgb * 2.0 - 1.0);

    mat3 tbn = mat3(
        vtf_tangent_modelSpace,
        vtf_bitangent_modelSpace,
        vtf_normal_modelSpace
    );

    return normalize(tbn * normalRaw);
}

float calculateSpecularIntensity(vec3 lightDirectionUnit, float lightIncidence, float specularMapValue, float multiplier) {
    vec3 viewDir = -(vtf_vertPos_cameraSpace.xyz / vtf_vertPos_cameraSpace.w);
    vec3 reflectDir = 2.0 * dot(vtf_normal_cameraSpace, lightDirectionUnit) * vtf_normal_cameraSpace - lightDirectionUnit;
    vec3 reflection = normalize(reflectDir);
    vec3 toCamera = normalize(viewDir);
    float cosAngle = dot(reflection, toCamera);
    cosAngle = clamp(cosAngle, 0.0, 1.0);
    cosAngle = pow(cosAngle, 3.0);
    return cosAngle * lightIncidence * specularMapValue * multiplier;
}

void main() {

    vec4 dayMapSample = texture(u_map_day, vtf_texCoord);
    vec4 nightMapSample = texture(u_map_night, vtf_texCoord);
    vec4 cloudMapSample = texture(u_map_clouds, vtf_texCoord);
    vec4 normalMapSample = texture(u_map_normal, vtf_texCoord);
    vec4 specularMapSample = texture(u_map_specular, vtf_texCoord);

    vec3 normal = calculateNormal(normalMapSample);

    vec3 lightDirection = u_sun_position - vtf_vertPos_modelSpace.xyz;
    vec3 lightDirectionUnit = normalize(lightDirection);

    float incidence = dot(normal, lightDirectionUnit);

    vec4 dayNight = mix(vec4(dayMapSample.rgb, 1.0), vec4(nightMapSample.rgb, 1.0), 1.0 - clamp(incidence * 2.0, 0.0, 1.0));
    
    float cloudIntensity = incidence / 2.0;
    vec4 clouds = vec4(cloudMapSample.rgb, cloudIntensity);

    vec3 t = (u_view * vec4(u_sun_position, 1.0)).xyz;
    vec3 l2 = normalize(t - vtf_vertPos_cameraSpace.xyz);
    vec3 specularColor = calculateSpecularIntensity(l2, incidence, specularMapSample.r, 0.7) * vec3(1.0);

    vec3 fragmentToCamera = normalize(-vtf_vertPos_cameraSpace.xyz);
    float facingCamera = dot(normalize(vtf_normal_cameraSpace), fragmentToCamera);
    float ringPower = (1.0 - facingCamera);
    float ringIntensity = ringPower <= 0.75 ? 0.0 : (ringPower - 0.75 ) * 5.0;

    vec3 ringDayColor = vec3(0.55, 0.78, 1.0);
    vec3 ringNightColor = vec3(0.25, 0.34, 0.43);

    vec3 ringColor = mix(ringNightColor, ringDayColor, incidence);

    out_color = dayNight + (clouds * clouds.w) + vec4(specularColor, 1.0) + vec4(ringColor * ringIntensity, 1.0);
    out_bloom = vec4(ringColor * ringIntensity * 0.1, 1.0);
}