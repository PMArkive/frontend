import {FilterSet} from "./filterbar";

export type SteamId = string;

export interface SteamUser {
    id: number;
    steamid: SteamId;
    name: string;
}

export class Api {
    private readonly base: string;

    constructor(base: string) {
        this.base = base;
    }

    getApiUrl(url) {
        return this.base + url;
    }

    request(url, params = {}, json = true): Promise<string | any> {
        let queryParams = new URLSearchParams(params);
        return fetch(this.getApiUrl(url) + '?' + queryParams)
            .then((response) => {
                if (json) {
                    return response.json()
                } else {
                    return response.text();
                }
            });
    }

    async searchPlayer(query: string): Promise<SteamUser[]> {
        if (query.length < 2) {
            return [];
        }

        const players = await this.request('users/search', {query}) as SteamUser[];
        for (let player of players) {
            localStorage.setItem(`player.${player.steamid}`, JSON.stringify(player));
        }
        return players
    }

    async getPlayer(id: string | number): Promise<SteamUser> {
        const cached = localStorage.getItem(`player.${id}`);
        if (cached) {
            return JSON.parse(cached);
        }
        const player = await this.request(`users/${id}`, {}) as SteamUser;
        localStorage.setItem(`player.${id}`, JSON.stringify(player));
        return player;
    }
}