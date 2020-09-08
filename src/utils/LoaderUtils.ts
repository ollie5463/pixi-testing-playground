import * as PIXI from 'pixi.js';

export function triggerPixiLoad(loader: PIXI.Loader, onComplete?: () => void): Promise<void> {
	return new Promise((resolve, reject) => {
		loader.onComplete.add(() => {
			if (onComplete) onComplete();
			resolve();
		});
		loader.onError.add((e: Error) => {
			reject(e);
		});
		if (!loader.loading) {
			loader.load();
		}
	});
}

export function removeScalePrefixFromPath(filePath: string): string {
	const splitPath: string[] = filePath.split(/scale-[0-9]{1,}\//);
	return splitPath[splitPath.length - 1];
}

export function removeDefaultAndDefaultLocaleFromPath(filePath: string): string {
	const splitPath: string[] = filePath.split(/\b(resources\/default-locale|resources\/default|resources){1,}\/\b/);
	return splitPath[splitPath.length - 1];
}

export function filterStringsBy(strings: string[], regexes: string[]): string[][] {
	const includedStrings = [];
	const excludedStrings = [];
	for (const entry of strings) {
		let doesMatch = false;
		for (const regex of regexes) {
			if (entry.match(regex)) {
				doesMatch = true;
				break;
			}
		}
		doesMatch ? includedStrings.push(entry) : excludedStrings.push(entry);
	}
	return [includedStrings, excludedStrings];
}
export function getExtension(url: string): string | undefined {
	const possibleExtension = url.match(/\.[a-zA-Z0-9]{1,}/);
	if (possibleExtension) {
		return possibleExtension[0];
	}
	return undefined;
}
