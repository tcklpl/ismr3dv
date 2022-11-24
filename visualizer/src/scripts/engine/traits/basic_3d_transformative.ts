import { Mat4 } from "../data_formats/mat/mat4";
import { Quaternion } from "../data_formats/quaternion";
import { Vec3 } from "../data_formats/vec/vec3";
import { IPositionable } from "./i_positionable";

export class Basic3DTransformative implements IPositionable {

    private _parent?: Basic3DTransformative;

    private _translation: Vec3 = Vec3.fromValue(0);
    private _rotation: Quaternion = Quaternion.fromEulerAngles(0, 0, 0);
    private _scale: Vec3 = Vec3.fromValue(1);

    private _translationMatrix: Mat4 = Mat4.identity();
    private _rotationMatrix: Mat4 = Mat4.identity();
    private _scaleMatrix: Mat4 = Mat4.identity();

    private _modelMatrix: Mat4 = Mat4.identity();
    private _outlineScalar = 1.1;
    private _outlineMatrix: Mat4 = Mat4.scaling(this._outlineScalar, this._outlineScalar, this._outlineScalar);

    private buildModelMatrix() {
        this._modelMatrix = Mat4.identity();
        this._modelMatrix.multiplyBy(this._translationMatrix);
        this._modelMatrix.multiplyBy(this._rotationMatrix);
        this._modelMatrix.multiplyBy(this._scaleMatrix);

        // outline 10% bigger than the model
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

    setRotationEuler(rotation: Vec3): void {
        this._rotation = Quaternion.fromEulerAngles(rotation.x, rotation.y, rotation.z);
        this.buildRotationMatrix();
    }

    setRotationQuaternion(q: Quaternion) {
        this._rotation = q;
        this.buildRotationMatrix();
    }

    lookAt(to: Vec3) {
        this._rotation = Quaternion.lookAt(this._translation, to, Vec3.forward, Vec3.up);
        this.buildRotationMatrix();
    }

    private buildRotationMatrix() {
        this._rotationMatrix = this._rotation.getAsMatrix();
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
        this._rotation = Quaternion.fromEulerAngles(0, 0, 0);
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