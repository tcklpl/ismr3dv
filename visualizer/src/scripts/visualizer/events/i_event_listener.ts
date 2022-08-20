
export interface IEventListener {

    token: string;
    listener: (...args: any[]) => any;

}