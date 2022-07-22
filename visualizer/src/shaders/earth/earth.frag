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

/*
    Calculate the fragment's normal vector in model space
*/
vec3 calculateNormal() {
    vec4 normalMapTexel = texture(u_map_normal, vtf_texCoord);
    vec3 normalRaw = normalize(normalMapTexel.rgb * 2.0 - 1.0);
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

vec3 calculateSpecular(float lightIncidence, vec4 specularMapTexel, vec3 color) {
    vec3 t = (u_view * vec4(u_sun_position, 1.0)).xyz;
    vec3 l2 = normalize(t - vtf_vertPos_cameraSpace.xyz);
    return calculateSpecularIntensity(l2, lightIncidence, specularMapTexel.r, 0.7) * color;
}

float calculateFresnel() {
    vec3 fragmentToCamera = normalize(-vtf_vertPos_cameraSpace.xyz);
    float facingCamera = dot(normalize(vtf_normal_cameraSpace), fragmentToCamera);
    return 1.0 - facingCamera;
}

void main() {

    // Current texel from all the textures
    vec4 dayMapTexel = texture(u_map_day, vtf_texCoord);
    vec4 nightMapTexel = texture(u_map_night, vtf_texCoord);
    vec4 cloudMapTexel = texture(u_map_clouds, vtf_texCoord);
    vec4 specularMapTexel = texture(u_map_specular, vtf_texCoord);

    vec3 normal = calculateNormal();

    // Calculate the light incidence based on the sun
    vec3 lightDirection = u_sun_position - vtf_vertPos_modelSpace.xyz;
    vec3 lightDirectionUnit = normalize(lightDirection);
    float incidence = dot(normal, lightDirectionUnit);

    // Mix day and night map based on light incidence
    vec4 dayNight = mix(vec4(dayMapTexel.rgb, 1.0), vec4(nightMapTexel.rgb, 1.0), 1.0 - clamp(incidence * 2.0, 0.0, 1.0));
    
    float cloudIntensity = incidence / 2.0;
    vec4 clouds = vec4(cloudMapTexel.rgb, cloudIntensity);

    vec3 specular = calculateSpecular(incidence, specularMapTexel, vec3(2.0, 2.0, 1.0));

    float fresnel = calculateFresnel();
    float ringIntensity = fresnel <= 0.75 ? 0.0 : (fresnel - 0.75 ) * 5.0;

    vec3 ringDayColor = vec3(0.55, 0.78, 1.0);
    vec3 ringNightColor = vec3(0.25, 0.34, 0.43);

    vec3 ringColor = mix(ringNightColor, ringDayColor, incidence);

    out_color = dayNight;
    out_color += vec4(ringColor * ringIntensity * 2.0, 1.0);
    out_color += (clouds * clouds.w);
    out_color += vec4(specular, 1.0);

    // Inverse gamma correction, as this texture is already gamma corrected
    out_color = vec4(pow(out_color.rgb, vec3(2.2)), 1.0);

    out_bloom = vec4(ringColor * ringIntensity * 0.3, 1.0);
}