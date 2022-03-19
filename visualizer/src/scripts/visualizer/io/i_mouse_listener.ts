
export interface IMouseListener {

    onMouseMove?(x: number, y: number): void;
    onMouseStop?(): void;
    onMouseLeftClick?(): void;
    onMouseRightClick?(): void;
    onMouseScroll?(dy: number): void; 
    onMouseScrollStop?(): void;
    onMouseMoveOffset?(x: number, y: number): void;

}