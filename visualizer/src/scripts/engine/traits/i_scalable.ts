import { Vec3 } from "../data_formats/vec/vec3";

export interface IScalable {

    setScale(scale: Vec3): void;
    scale(to: Vec3): void;

}