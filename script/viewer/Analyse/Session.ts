export class Session {
    public readonly owner_token: string | null;
    private socket: WebSocket | null;
    public readonly sessionName: string;
    private initialState: PlaybackState | null;
    private readonly onState: (StateUpdate) => void | null;
    private readonly syncUri;

    constructor(name: string, owner_token: string | null = null, initialState: PlaybackState | null, onState: (StateUpdate) => void) {
        this.owner_token = owner_token;
        this.sessionName = name;
        this.initialState = initialState;
        this.onState = onState;
        this.syncUri = document.querySelector('[data-sync]').getAttribute('data-sync');
        this.open();
    }

    public static create(state: PlaybackState, onState: (StateUpdate) => void): Session {
        return new Session(generateToken(), generateToken(), state, onState)
    }

    public static join(name: string, onState: (StateUpdate) => void): Session {
        return new Session(name, null, null, onState);
    }

    private open() {
        if (this.socket) {
            return;
        }
        this.socket = new WebSocket(this.syncUri);
        this.socket.onopen = () => {
            if (this.socket) {
                if (this.owner_token) {
                    if (this.initialState) {
                        this.socket.send(JSON.stringify({
                            type: 'create',
                            session: this.sessionName,
                            token: this.owner_token
                        }));
                        this.socket.send(JSON.stringify({
                            type: 'tick',
                            session: this.sessionName,
                            tick: this.initialState.tick
                        }));
                        this.socket.send(JSON.stringify({
                            type: 'play',
                            session: this.sessionName,
                            play: this.initialState.playing
                        }));
                        this.initialState = null;
                    }
                    this.socket.onmessage = (event) => {
                        const packet = JSON.parse(event.data) as Packet;
                        if (packet.type === 'clients') {
                            this.onState({
                                clients: packet.count
                            });
                        }
                    }
                } else {
                    this.socket.send(JSON.stringify({
                        type: 'join',
                        session: this.sessionName
                    }));
                    this.socket.onmessage = (event) => {
                        const packet = JSON.parse(event.data) as Packet;
                        if (packet.type === 'tick') {
                            this.onState({
                                tick: packet.tick
                            });
                        }
                        if (packet.type === 'play') {
                            if (packet.play) {
                                this.onState({
                                    playing: true
                                });
                            } else {
                                this.onState({
                                    playing: false
                                });
                            }
                        }
                    }
                }
            }
        };
        this.socket.onclose = () => {
            this.socket = null;
            setTimeout(this.open.bind(this), 250);
        };
        this.socket.onerror = () => {
            this.socket = null;
            setTimeout(this.open.bind(this), 250);
        };
    }

    public isOwner(): boolean {
        return this.owner_token !== null;
    }

    public update(update: StateUpdate): void {
        if (this.socket && this.isOwner()) {
            if (update["tick"]) {
                this.socket.send(JSON.stringify({
                    type: 'tick',
                    session: this.sessionName,
                    tick: update["tick"]
                }));
            }
            if (update.hasOwnProperty("playing")) {
                this.socket.send(JSON.stringify({
                    type: 'play',
                    session: this.sessionName,
                    play: update["playing"]
                }));
            }
        }
    }
}

function generateToken(): string {
    let string = "";
    const alphabet = "abcdefghijklmnopqrstuvwxyz";

    while (string.length < 6) {
        string += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return string;
}

export interface PlaybackState {
    tick: number,
    playing: boolean,
    clients: number,
}

export type StateUpdate = Partial<PlaybackState>;

interface JoinPacket {
    type: 'join';
    session: string;
}

interface CreatePacket {
    type: 'create';
    session: string;
}

export interface TickPacket {
    type: 'tick';
    session: string;
    tick: number;
}

export interface PlayPacket {
    type: 'play';
    session: string;
    play?: boolean;
}

export interface ClientsPacket {
    type: 'clients';
    session: string;
    count: number;
}

export type Packet = JoinPacket | CreatePacket | TickPacket | PlayPacket | ClientsPacket;