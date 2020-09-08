import { ILoader } from './ILoader';
import { filterStringsBy, removeDefaultAndDefaultLocaleFromPath, removeScalePrefixFromPath } from './LoaderUtils';

export abstract class AbstractPixiLoader implements ILoader {
	protected loader!: PIXI.Loader;
	protected validExtensions!: string[];

	abstract loadAssets(): Promise<void>;
	abstract getAsset(name: string): any;

	constructor(pixiLoader: PIXI.Loader) {
		this.loader = pixiLoader;
	}

	public addAssetsToLoader(assets: string[]): string[] {
		const [includedAssets, excludedAssets] = filterStringsBy(assets, this.validExtensions);
		for (const asset of includedAssets) {
			const assetName = this.applyPrefixRegex(asset);
			this.loader.add(assetName, asset);
		}
		return excludedAssets;
	}

	public registerOnProgressCallback(onProgressCallback: () => void): void {
		this.loader.onProgress = {
			dispatch: onProgressCallback,
		};
	}
	protected applyPrefixRegex(str: string): string {
		const result = removeDefaultAndDefaultLocaleFromPath(str);
		return removeScalePrefixFromPath(result);
	}
}
