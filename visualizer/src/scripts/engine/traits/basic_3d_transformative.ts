import { Mat4 } from "../data_formats/mat/mat4";
import { Vec3 } from "../data_formats/vec/vec3";
import { IPositionable } from "./i_positionable";
import { IRotatable } from "./i_rotatable";
import { IScalable } from "./i_scalable";

export class Basic3DTransformative implements IPositionable, IRotatable, IScalable {

    private _parent?: Basic3DTransformative;

    private _translation: Vec3 = Vec3.fromValue(0);
    private _rotation: Vec3 = Vec3.fromValue(0);
    private _scale: Vec3 = Vec3.fromValue(1);

    private _translationMatrix: Mat4 = Mat4.identity();
    private _rotationMatrix: Mat4 = Mat4.identity();
    private _scaleMatrix: Mat4 = Mat4.identity();
    private _lookAtMatrix: Mat4 = Mat4.identity();

    private _usingLookAtMatrix: boolean = false;

    private _modelMatrix: Mat4 = Mat4.identity();
    private _outlineScalar = 1.1;
    private _outlineMatrix: Mat4 = Mat4.scaling(this._outlineScalar, this._outlineScalar, this._outlineScalar);

    private buildModelMatrix() {
        this._modelMatrix = Mat4.identity();
        if (this._usingLookAtMatrix) {
            this._modelMatrix.multiplyBy(this._lookAtMatrix);
        } else {
            this._modelMatrix.multiplyBy(this._translationMatrix);
            this._modelMatrix.multiplyBy(this._rotationMatrix);
        }
        this._modelMatrix.multiplyBy(this._scaleMatrix);

        // outline 1% bigger than the model
        this._outlineMatrix = this._modelMatrix.duplicate().multiplyBy(Mat4.scaling(this._outlineScalar, this._outlineScalar, this._outlineScalar));
        
        if (this._parent) {
            this._modelMatrix = this._parent.modelMatrix.duplicate().multiplyBy(this._modelMatrix);
            this._outlineMatrix = this._parent.modelMatrix.duplicate().multiplyBy(this._outlineMatrix);
        }
    }

    setPosition(pos: Vec3): void {
        this._translation = pos;
        this._translationMatrix = Mat4.translation(pos.x, pos.y, pos.z);
        this.buildModelMatrix();
    }

    translate(to: Vec3): void {
        this._translation.add(to);
        this._translationMatrix.translate(to.x, to.y, to.z);
        this.buildModelMatrix();
    }

    setRotation(rotation: Vec3): void {
        this._usingLookAtMatrix = false;
        this._rotation = rotation;
        this.buildRotationMatrix();
    }

    rotate(to: Vec3): void {
        this._usingLookAtMatrix = false;
        this._rotation.add(to);
        this.buildRotationMatrix();
    }

    lookAt(to: Vec3) {
        this._usingLookAtMatrix = true;
        this._lookAtMatrix = Mat4.lookAt(this._translation, to, new Vec3(0, 1, 0));
        this.buildModelMatrix();
    }

    private buildRotationMatrix() {
        const xRot = Mat4.xRotation(this._rotation.x);
        const yRot = Mat4.yRotation(this._rotation.y);
        const zRot = Mat4.zRotation(this._rotation.z);

        this._rotationMatrix = Mat4.identity();
        this._rotationMatrix.multiplyBy(xRot);
        this._rotationMatrix.multiplyBy(yRot);
        this._rotationMatrix.multiplyBy(zRot);

        this.buildModelMatrix();
    }

    setScale(scale: Vec3): void {
        this._scale = scale;
        this._scaleMatrix = Mat4.scaling(scale.x, scale.y, scale.z);
        this.buildModelMatrix();
    }

    scale(to: Vec3): void {
        this._scale.add(to);
        this._scaleMatrix = Mat4.scaling(this._scale.x, this._scale.y, this._scale.z);
        this.buildModelMatrix();
    }

    resetTransformations() {
        this._translation = Vec3.fromValue(0);
        this._rotation = Vec3.fromValue(0);
        this._scale = Vec3.fromValue(1);

        this._translationMatrix = Mat4.identity();
        this._scaleMatrix = Mat4.identity();
        this.buildRotationMatrix();
    }

    get modelMatrix() {
        return this._modelMatrix;
    }

    get outlineMatrix() {
        return this._outlineMatrix;
    }

    get position() {
        return this._translation;
    }

    get rotation() {
        return this._rotation;
    }

    get currentScale() {
        return this._scale;
    }

    get parent() {
        return this._parent;
    }

    set parent(p: Basic3DTransformative | undefined) {
        this._parent = p;
        this.buildModelMatrix();
    }
    
}