import { SocketEvents } from "./SocketEvents";


export class BaseSocketEventable {
    private readonly eventListeners: Map<string, Array<(...args: any) => void>> = new Map<string, Array<(...args: any) => void>>();

    protected emit<Event extends keyof SocketEvents>(event: Event, ...args: Parameters<SocketEvents[Event]>): void {
        const listeners: ((...args: any) => void)[] | undefined = this.eventListeners.get(event as string);

        if (listeners) {
            listeners.forEach((listener: (...args: any) => void): void => {
                listener(...args);
            });
        }
    }

    public on<Event extends keyof SocketEvents>(event: Event, listener: SocketEvents[Event]): void {
        if (!this.eventListeners.has(event as string)) {
            this.eventListeners.set(event as string, []);
        }

        const listeners: ((...args: any) => void)[] = this.eventListeners.get(event as string)!;

        listeners.push(listener);
    }
}
