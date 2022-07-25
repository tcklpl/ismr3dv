import { Vec3 } from "../data_formats/vec/vec3";

export interface IScreenshotRequest {

    background: 'as-is' | 'custom';
    customColor?: Vec3;

}