export type SteamId = string;
export interface SteamUser {
    id: number;
    steamid: SteamId;
    name: string;
}

export class Api {
    private base: string;

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

        return await this.request('users/search', {query}) as SteamUser[];
    }
}