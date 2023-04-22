import {mapBoundaries} from './boundaries';

mapBoundaries['koth_viaduct'] = mapBoundaries['koth_product_rc8'];
mapBoundaries['cp_prolands'] = mapBoundaries['cp_badlands'];

const mapAliases = new Map<string, string>([
	['cp_prolands', 'cp_badlands']
]);

function getMapBasename(map: string): string {
	if (map.startsWith('cp_gullywash_f') && !map.startsWith('cp_gullywash_final')) {
		return 'cp_gullywash_f6';
	}
	if (mapBoundaries[map]) {
		return map;
	}
	const trimMapName = (map) => {
		while (map.lastIndexOf('_') > map.indexOf('_')) {
			map = map.substr(0, map.lastIndexOf('_'));
		}
		return map;
	};
	const trimmed = trimMapName(map);
	if (mapBoundaries[trimmed]) {
		return trimmed;
	}
	for (const existingMap of Object.keys(mapBoundaries)) {
		if (trimMapName(existingMap) === map) {
			return existingMap;
		}
	}
	for (const existingMap of Object.keys(mapBoundaries)) {
		if (trimMapName(existingMap) === trimmed) {
			return existingMap;
		}
	}
	return map;
}

export function findMapAlias(map: string): string {
	const baseName = getMapBasename(map);
	const alias = mapAliases.get(baseName);
	return alias ? alias : baseName;
}

export interface MapBoundries {
	boundary_min: {
		x: number;
		y: number;
	};
	boundary_max: {
		x: number;
		y: number;
	}
}

export function getMapBoundaries(map: string): MapBoundries | null {
	const mapAlias = findMapAlias(map);
	return mapBoundaries[mapAlias];
}
