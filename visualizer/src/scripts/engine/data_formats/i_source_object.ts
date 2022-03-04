import { Material } from "../materials/material";
import { Shader } from "../shaders/shader";
import { Mesh } from "./mesh/mesh";

export interface IObjectSource {
    name: string;
    mesh: Mesh;
    shader: Shader;
    material: Material;
}