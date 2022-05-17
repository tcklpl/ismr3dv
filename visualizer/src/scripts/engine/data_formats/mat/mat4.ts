import { MUtils } from "../../utils/math_utils";
import { IUniformable } from "../i_uniformable";
import { Vec3 } from "../vec/vec3";
import { Vec4 } from "../vec/vec4";

export class Mat4 implements IUniformable {

    values: number[] = new Array<number>(16);

    constructor(values: number[]) {
        if (values.length != 16) throw `Failed to create 4x4 matrix with ${values.length} values`;
        this.values = values;
    }

    duplicate() {
        return new Mat4(this.values);
    }

    bindUniform(gl: WebGL2RenderingContext, to: WebGLUniformLocation): void {
        gl.uniformMatrix4fv(to, false, new Float32Array(this.values));
    }

    set(row: number, col: number, value: number) {
        if (row > 3 || col > 3) throw `Cannot access position ${row}-${col} on a 4x4 matrix`;
        this.values[row * 4 + col] = value;
    }

    get(row: number, col: number): number {
        if (row > 3 || col > 3) throw `Cannot access position ${row}-${col} on a 4x4 matrix`;
        return this.values[row * 4 + col];
    }

    scale(x: number, y: number, z: number) {
        this.multiplyBy(Mat4.scaling(x, y, z));
    }

    translate(x: number, y: number, z: number) {
        this.multiplyBy(Mat4.translation(x, y, z));
    }

    xRotate(angle: number) {
        this.multiplyBy(Mat4.xRotation(MUtils.degToRad(angle)));
    }

    yRotate(angle: number) {
        this.multiplyBy(Mat4.yRotation(MUtils.degToRad(angle)));
    }

    zRotate(angle: number) {
        this.multiplyBy(Mat4.zRotation(MUtils.degToRad(angle)));
    }

    multiplyBy(other: Mat4) {
        var a00 = this.values[0 * 4 + 0];
        var a01 = this.values[0 * 4 + 1];
        var a02 = this.values[0 * 4 + 2];
        var a03 = this.values[0 * 4 + 3];
        var a10 = this.values[1 * 4 + 0];
        var a11 = this.values[1 * 4 + 1];
        var a12 = this.values[1 * 4 + 2];
        var a13 = this.values[1 * 4 + 3];
        var a20 = this.values[2 * 4 + 0];
        var a21 = this.values[2 * 4 + 1];
        var a22 = this.values[2 * 4 + 2];
        var a23 = this.values[2 * 4 + 3];
        var a30 = this.values[3 * 4 + 0];
        var a31 = this.values[3 * 4 + 1];
        var a32 = this.values[3 * 4 + 2];
        var a33 = this.values[3 * 4 + 3];
        var b00 = other.values[0 * 4 + 0];
        var b01 = other.values[0 * 4 + 1];
        var b02 = other.values[0 * 4 + 2];
        var b03 = other.values[0 * 4 + 3];
        var b10 = other.values[1 * 4 + 0];
        var b11 = other.values[1 * 4 + 1];
        var b12 = other.values[1 * 4 + 2];
        var b13 = other.values[1 * 4 + 3];
        var b20 = other.values[2 * 4 + 0];
        var b21 = other.values[2 * 4 + 1];
        var b22 = other.values[2 * 4 + 2];
        var b23 = other.values[2 * 4 + 3];
        var b30 = other.values[3 * 4 + 0];
        var b31 = other.values[3 * 4 + 1];
        var b32 = other.values[3 * 4 + 2];
        var b33 = other.values[3 * 4 + 3];
        this.values = [
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
        ];
    }

    multiplyByVec4(m: Vec4) {
        const resVector = [];
        for (let i = 0; i < 4; i++) {
            resVector.push(
                this.values[0 * 4 + i] * m.x +
                this.values[1 * 4 + i] * m.y +
                this.values[2 * 4 + i] * m.z +
                this.values[3 * 4 + i] * m.w
            );
        }
        return new Vec4(resVector[0], resVector[1], resVector[2], resVector[3]);
    }

    static identity(): Mat4 {
        return new Mat4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    static scaling(x: number, y: number, z: number): Mat4 {
        return new Mat4([
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        ]);
    }

    static translation(x: number, y: number, z: number): Mat4 {
        return new Mat4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        ]);
    }

    static xRotation(angle: number): Mat4 {
        let rad = MUtils.degToRad(angle);
        return this.xRotationRad(rad);
    }

    static xRotationRad(angle: number) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        return new Mat4([
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1,
        ]);
    }

    static yRotation(angle: number): Mat4 {
        let rad = MUtils.degToRad(angle);
        return this.yRotationRad(rad);
    }

    static yRotationRad(angle: number): Mat4 {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        return new Mat4([
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1,
        ]);
    }

    static zRotation(angle: number): Mat4 {
        let rad = MUtils.degToRad(angle);
        return this.zRotationRad(rad);
    }

    static zRotationRad(angle: number): Mat4 {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        return new Mat4([
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ]);
    }

    static perspective(fovRadians: number, aspect: number, near: number, far: number): Mat4 {
        var f = Math.tan(Math.PI * 0.5 - 0.5 * fovRadians);
        var rangeInv = 1.0 / (near - far);

        return new Mat4([
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0,
        ]);
    }

    static orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4 {
        return new Mat4([
            2 / (right - left), 0, 0, 0,
            0, 2 / (top - bottom), 0, 0,
            0, 0, 2 / (near - far), 0,
            (left + right) / (left - right), (bottom + top) / (bottom - top), (near + far) / (near - far), 1
        ]);
    }

    static lookAt(cameraPos: Vec3, target: Vec3, up: Vec3): Mat4 {
        let zAxis = Vec3.normalize(Vec3.subtract(cameraPos, target));
        let xAxis = Vec3.normalize(Vec3.cross(up, zAxis));
        let yAxis = Vec3.normalize(Vec3.cross(zAxis, xAxis));
        return new Mat4([
            xAxis.x, xAxis.y, xAxis.z, 0,
            yAxis.x, yAxis.y, yAxis.z, 0,
            zAxis.x, zAxis.y, zAxis.z, 0,
            cameraPos.x, cameraPos.y, cameraPos.z, 1
        ]);
    }

    static inverse(m: Mat4): Mat4 {
        let m00 = m.values[0 * 4 + 0];
        let m01 = m.values[0 * 4 + 1];
        let m02 = m.values[0 * 4 + 2];
        let m03 = m.values[0 * 4 + 3];
        let m10 = m.values[1 * 4 + 0];
        let m11 = m.values[1 * 4 + 1];
        let m12 = m.values[1 * 4 + 2];
        let m13 = m.values[1 * 4 + 3];
        let m20 = m.values[2 * 4 + 0];
        let m21 = m.values[2 * 4 + 1];
        let m22 = m.values[2 * 4 + 2];
        let m23 = m.values[2 * 4 + 3];
        let m30 = m.values[3 * 4 + 0];
        let m31 = m.values[3 * 4 + 1];
        let m32 = m.values[3 * 4 + 2];
        let m33 = m.values[3 * 4 + 3];
        let tmp_0 = m22 * m33;
        let tmp_1 = m32 * m23;
        let tmp_2 = m12 * m33;
        let tmp_3 = m32 * m13;
        let tmp_4 = m12 * m23;
        let tmp_5 = m22 * m13;
        let tmp_6 = m02 * m33;
        let tmp_7 = m32 * m03;
        let tmp_8 = m02 * m23;
        let tmp_9 = m22 * m03;
        let tmp_10 = m02 * m13;
        let tmp_11 = m12 * m03;
        let tmp_12 = m20 * m31;
        let tmp_13 = m30 * m21;
        let tmp_14 = m10 * m31;
        let tmp_15 = m30 * m11;
        let tmp_16 = m10 * m21;
        let tmp_17 = m20 * m11;
        let tmp_18 = m00 * m31;
        let tmp_19 = m30 * m01;
        let tmp_20 = m00 * m21;
        let tmp_21 = m20 * m01;
        let tmp_22 = m00 * m11;
        let tmp_23 = m10 * m01;

        var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
            (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
        var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
            (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
        var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
            (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
        var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
            (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

        var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

        return new Mat4([
            d * t0,
            d * t1,
            d * t2,
            d * t3,
            d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
                (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
            d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
                (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
            d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
                (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
            d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
                (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
            d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
                (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
            d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
                (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
            d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
                (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
            d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
                (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
            d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
                (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
            d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
                (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
            d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
                (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
            d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
                (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02)),
        ]);
    }

    static frustum(left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4 {
        let dx = right - left;
        let dy = top - bottom;
        let dz = far - near;

        return new Mat4([
            2 * near / dx, 0, 0, 0,
            0, 2 * near / dy, 0, 0,
            (left + right) / dx, (top + bottom) / dy, -(far + near) / dz, -1,
            0, 0, -2 * near * far / dz, 0
        ]);
    }

    static NDCtoUV() {
        let m = this.identity();
        m.translate(0.5, 0.5, 0.5);
        m.scale(0.5, 0.5, 0.5);
        return m;
    }
}