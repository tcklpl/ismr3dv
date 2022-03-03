import { Vec3 } from "../data_formats/vec/vec3";

export interface IRotatable {

    setRotation(rotation: Vec3): void;
    rotate(to: Vec3): void;

}