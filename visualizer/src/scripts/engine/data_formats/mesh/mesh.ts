import { Visualizer } from "../../../visualizer/visualizer";
import { BufferUtils } from "../../utils/buffer_utils";
import { Vec2 } from "../vec/vec2";
import { Vec3 } from "../vec/vec3";
import { Vertex } from "./vertex";

export class Mesh {

    private _name: string;
    private _vertices: Vertex[] = [];
    private _filteredVertices: Vertex[] = [];
    private _centroid: Vec3;

    private _gl = Visualizer.instance.gl;

    private _bufPositions: WebGLBuffer;
    private _bufUVs: WebGLBuffer;
    private _bufNormals: WebGLBuffer;
    private _bufTangents: WebGLBuffer;
    private _bufBitangents: WebGLBuffer;
    private _bufIndices: WebGLBuffer;

    private _vao: WebGLVertexArrayObject;
    private _indicesSize: number;

    constructor(name: string, vertices: Vec3[], uvs: Vec2[], normals: Vec3[], indices: Vec3[]) {
        this._name = name;

        // populate _vertices
        indices.forEach(i => this._vertices.push(new Vertex(vertices[i.x - 1], uvs[i.y - 1], normals[i.z - 1])));

        // compute tangents and bitangents
        for (let i = 0; i < this._vertices.length; i += 3) {

            const v0 = this._vertices[i + 0].position;
            const v1 = this._vertices[i + 1].position;
            const v2 = this._vertices[i + 2].position;

            const uv0 = this._vertices[i + 0].uv;
            const uv1 = this._vertices[i + 1].uv;
            const uv2 = this._vertices[i + 2].uv;

            const deltaPos1 = Vec3.subtract(v1, v0);
            const deltaPos2 = Vec3.subtract(v2, v0);

            const deltaUV1 = Vec2.subtract(uv1, uv0);
            const deltaUV2 = Vec2.subtract(uv2, uv0);

            const r = 1.0 / (deltaUV1.x * deltaUV2.y - deltaUV1.y * deltaUV2.x);

            const tangent = Vec3.multiplyByValue(
                Vec3.subtract(
                    Vec3.multiplyByValue(deltaPos1, deltaUV2.y), Vec3.multiplyByValue(deltaPos2, deltaUV1.y)
                ),
                r
            );

            const bitangent = Vec3.multiplyByValue(
                Vec3.subtract(
                    Vec3.multiplyByValue(deltaPos2, deltaUV1.x), Vec3.multiplyByValue(deltaPos1, deltaUV2.x)
                ),
                r
            );

            this._vertices[i + 0].tangent = tangent;
            this._vertices[i + 1].tangent = tangent;
            this._vertices[i + 2].tangent = tangent;
            this._vertices[i + 0].bitangent = bitangent;
            this._vertices[i + 1].bitangent = bitangent;
            this._vertices[i + 2].bitangent = bitangent;
        }

        const filteredIndices: number[] = [];

        this._vertices.forEach(v => {
            let index = this._filteredVertices.findIndex(x => x.equals(v));
            // if not found, isnert on list
            if (index == -1) {
                this._filteredVertices.push(v);
                index = this._filteredVertices.length - 1;
            } else {
                // otherwise, average the tangents
                this._filteredVertices[index].tangent.add(v.tangent);
                this._filteredVertices[index].bitangent.add(v.bitangent);
            }
            filteredIndices.push(index);
        });

        // vertex position buffer
        this._bufPositions = BufferUtils.createBuffer(this._gl);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._bufPositions);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(this._filteredVertices.flatMap(v => v.position.values)), this._gl.STATIC_DRAW);

        // vertex uv buffer
        this._bufUVs = BufferUtils.createBuffer(this._gl);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._bufUVs);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(this._filteredVertices.flatMap(v => v.uv.values)), this._gl.STATIC_DRAW);

        // vertex normal buffer
        this._bufNormals = BufferUtils.createBuffer(this._gl);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._bufNormals);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(this._filteredVertices.flatMap(v => v.normal.values)), this._gl.STATIC_DRAW);

        // create tangent buffer
        this._bufTangents = BufferUtils.createBuffer(this._gl);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._bufTangents);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(this._filteredVertices.flatMap(t => t.tangent.values)), this._gl.STATIC_DRAW);

        // create bitangent buffer
        this._bufBitangents = BufferUtils.createBuffer(this._gl);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._bufBitangents);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(this._filteredVertices.flatMap(t => t.bitangent.values)), this._gl.STATIC_DRAW);

        // create VAO
        this._vao = BufferUtils.createVAO(this._gl);
        this._gl.bindVertexArray(this._vao);

        // bind positions to VAO
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._bufPositions);
        this._gl.vertexAttribPointer(0, 3, this._gl.FLOAT, false, 0, 0);
        this._gl.enableVertexAttribArray(0);

        // bind uvs to VAO
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._bufUVs);
        this._gl.vertexAttribPointer(1, 2, this._gl.FLOAT, false, 0, 0);
        this._gl.enableVertexAttribArray(1);

        // bind normals to VAO
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._bufNormals);
        this._gl.vertexAttribPointer(2, 3, this._gl.FLOAT, false, 0, 0);
        this._gl.enableVertexAttribArray(2);

        // bind tangents to VAO
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._bufTangents);
        this._gl.vertexAttribPointer(3, 3, this._gl.FLOAT, false, 0, 0);
        this._gl.enableVertexAttribArray(3);

        // bind bitangents to VAO
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._bufBitangents);
        this._gl.vertexAttribPointer(4, 3, this._gl.FLOAT, false, 0, 0);
        this._gl.enableVertexAttribArray(4);

        // create index buffer
        this._bufIndices = BufferUtils.createBuffer(this._gl);
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._bufIndices);
        this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(filteredIndices), this._gl.STATIC_DRAW);

        this._indicesSize = filteredIndices.length;

        // calculate centroid
        this._centroid = Vec3.centroid(this._filteredVertices.map(x => x.position));
    }

    get name() {
        return this._name;
    }

    get centroid() {
        return this._centroid;
    }

    bindVAO() {
        this._gl.bindVertexArray(this._vao);
    }

    draw() {
        this.bindVAO();
        this._gl.drawElements(this._gl.TRIANGLES, this._indicesSize, this._gl.UNSIGNED_SHORT, 0);
    }

}