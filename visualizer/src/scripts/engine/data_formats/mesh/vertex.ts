import { Vec2 } from "../vec/vec2";
import { Vec3 } from "../vec/vec3";

export class Vertex {

    private _position: Vec3;
    private _uv: Vec2;
    private _normal: Vec3;

    private _tangent!: Vec3;
    private _bitangent!: Vec3;

    private _tangentsToAverage: Vec3[] = [];
    private _bitangentsToAverage: Vec3[] = [];

    constructor(position: Vec3, uv: Vec2, normal: Vec3) {
        this._position = position;
        this._uv = uv;
        this._normal = normal;
    }

    equals(other: Vertex) {
        return this._position.equals(other.position) && this._uv.equals(other.uv) && this._normal.equals(other.normal);
    }

    public get position() {
        return this._position;
    }

    public get uv() {
        return this._uv;
    }

    public get normal() {
        return this._normal;
    }

    public get tangent() {
        return this._tangent;
    }

    public set tangent(o: Vec3) {
        this._tangent = o;
    }

    public get bitangent() {
        return this._bitangent;
    }

    public set bitangent(o: Vec3) {
        this._bitangent = o;
    }

}