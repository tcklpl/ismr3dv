
export interface IMouseListener {

    onMouseMove?(x: number, y: number): void;
    onMouseLeftClick?(): void;
    onMouseRightClick?(): void;
    onMouseScroll?(dy: number): void; 
    onMouseScrollStop?(): void;

}