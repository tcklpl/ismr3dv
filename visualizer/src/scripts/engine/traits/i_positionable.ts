import { Vec3 } from "../data_formats/vec/vec3";

export interface IPositionable {

    setPosition(pos: Vec3): void;
    translate(to: Vec3): void;

}