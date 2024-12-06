import {
    BuildingState,
    Event,
    Kill,
    ParsedDemo,
    PlayerState,
    ProjectileState,
    ProjectileType,
    WorldBoundaries
} from "./Parser";

function getCacheBuster(): string {
    const url = document.querySelector('script[src*="viewer"]').attributes.src.value;
    return url.substring("/viewer.js".length);
}

export class AsyncParser {
    buffer: ArrayBuffer;
    demo: ParsedDemo;
    world: WorldBoundaries;
    progressCallback: (progress: number) => void;

    constructor(buffer: ArrayBuffer, progressCallback: (progress: number) => void) {
        this.buffer = buffer;
        this.progressCallback = progressCallback;
    }

    cache(): Promise<ParsedDemo> {
        return new Promise((resolve, reject) => {
            const worker = new Worker(`/parse-worker.js${getCacheBuster()}`);
            worker.postMessage({
                buffer: this.buffer
            }, [this.buffer]);
            worker.onmessage = (event) => {
                if (event.data.error) {
                    reject(event.data.error);
                    return;
                } else if (event.data.progress) {
                    this.progressCallback(event.data.progress);
                    return;
                } else if (event.data.demo) {
                    const cachedData: ParsedDemo = event.data.demo;
                    console.log(`packed data: ${(cachedData.data.length / (1024 * 1024)).toFixed(1)}MB`);
                    this.world = cachedData.world;
                    this.demo = new ParsedDemo(
                        cachedData.playerCount,
                        cachedData.buildingCount,
                        cachedData.projectileCount,
                        cachedData.world,
                        cachedData.header,
                        cachedData.data,
                        cachedData.kills,
                        cachedData.playerInfo,
                        cachedData.events,
                        cachedData.tickCount
                    );
                    resolve(this.demo);
                }
            }
        });
    }

    getPlayersAtTick(tick: number): PlayerState[] {
        const players: PlayerState[] = [];
        for (let i = 0; i < this.demo.playerCount; i++) {
            players.push(this.demo.getPlayer(tick, i));
        }

        return players;
    }

    getBuildingsAtTick(tick: number): BuildingState[] {
        const buildings: BuildingState[] = [];
        for (let i = 0; i < this.demo.buildingCount; i++) {
            const building = this.demo.getBuilding(tick, i);
            if (building.health > 0) {
                buildings.push(building);
            }
        }

        return buildings;
    }

    getProjectilesAtTick(tick: number): ProjectileState[] {
        const projectiles: ProjectileState[] = [];
        for (let i = 0; i < this.demo.projectileCount; i++) {
            const projectile = this.demo.getProjectile(tick, i);
            if (projectile.projectileType !== ProjectileType.Unknown && projectile.position.x > this.world.boundary_min.x && projectile.position.y > this.world.boundary_min.y) {
                projectiles.push(projectile);
            }
        }

        return projectiles;
    }

    getKills(): Kill[] {
        return this.demo.kills
    }

    getEvents(): Event[] {
        return this.demo.events
    }
}
