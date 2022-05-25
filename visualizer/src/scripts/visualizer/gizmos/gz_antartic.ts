import { Gizmo } from "../../engine/data_formats/gizmos/gizmo";
import { LineLoop } from "../../engine/data_formats/mesh/line_loop";
import { Vec3 } from "../../engine/data_formats/vec/vec3";
import { MUtils } from "../../engine/utils/math_utils";

export class GizmoAntarticCircle extends Gizmo {

    constructor() {
        const points: Vec3[] = [];
        for (let i = -180; i <= 180; i++) {
            points.push(MUtils.latLongToUnitSphere(-66.5, i).multiplyByFactor(1.001));
        }
        super('antartic circle', new LineLoop(points));
    }

}