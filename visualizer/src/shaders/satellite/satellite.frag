#version 300 es

precision highp float;

in vec2 vtf_texCoord;
in vec4 vtf_vertPos_modelSpace;
in vec4 vtf_vertPos_cameraSpace;
in vec3 vtf_normal_cameraSpace;
in vec3 vtf_normal;

layout (location = 0) out vec4 out_color;
layout (location = 1) out vec4 out_bloom;

uniform sampler2D u_map_diffuse;
uniform sampler2D u_map_specular;

uniform vec3 u_sun_position;
uniform mat4 u_view;

/*
    Calculates the specular intensity of the fragment.
    lightDirectionUnit  Unit vector from the sun to this fragment in camera space.
    multiplier          Intensity multiplier, contains the dot product of the light incidence, relevant map texels
                        and an arbitrary value to change the intensity (0.7).
*/
float calculateSpecularIntensity(vec3 lightDirectionUnit, float multiplier) {
    vec3 viewDir = -(vtf_vertPos_cameraSpace.xyz / vtf_vertPos_cameraSpace.w);
    vec3 reflectDir = 2.0 * dot(vtf_normal_cameraSpace, lightDirectionUnit) * vtf_normal_cameraSpace - lightDirectionUnit;
    vec3 reflection = normalize(reflectDir);
    vec3 toCamera = normalize(viewDir);
    float cosAngle = dot(reflection, toCamera);
    cosAngle = clamp(cosAngle, 0.0, 1.0);
    cosAngle = pow(cosAngle, 3.0);
    return cosAngle * multiplier;
}

/*
    Calculates the specular color of the fragment.
    lightIncidence      The dot product of the light incidence in this fragment.
    specularMapTexel    UV mapped texel from the specular map.
    color               The specular color.

    Takes in consideration 100% of the specular map and 50% of the cloud map.
*/
vec3 calculateSpecular(float lightIncidence, vec4 specularMapTexel, vec3 color) {
    vec3 sunPositionViewSpace = (u_view * vec4(u_sun_position, 1.0)).xyz;
    vec3 sunToFragmentUnit = normalize(sunPositionViewSpace - vtf_vertPos_cameraSpace.xyz);
    float multiplier = lightIncidence * specularMapTexel.r;
    return calculateSpecularIntensity(sunToFragmentUnit, multiplier) * color;
}

void main() {

    // Current texel from all the textures
    vec4 diffuseTexel = texture(u_map_diffuse, vtf_texCoord);
    vec4 specularMapTexel = texture(u_map_specular, vtf_texCoord);

    // Calculate the light incidence based on the sun
    vec3 lightDirection = u_sun_position - vtf_vertPos_modelSpace.xyz;
    vec3 lightDirectionUnit = normalize(lightDirection);
    float incidence = dot(vtf_normal, lightDirectionUnit);
    float clampedIncidence = clamp(incidence, 0.0, 1.0);

    vec3 specular = calculateSpecular(clampedIncidence, specularMapTexel, vec3(2.0, 2.0, 1.0));

    out_color = diffuseTexel * clamp(clampedIncidence, 0.2, 1.0);
    out_color += vec4(specular, 1.0);

    // Inverse gamma correction, as this texture is already gamma corrected
    vec3 color = pow(out_color.rgb, vec3(2.2));
    out_color = vec4(color, 1.0);
    out_bloom = vec4(specular, 1.0);
}