import { AtlasLoader } from './loader/AtlasLoader';
import { IManifest } from './IManifest';
import { ILoader } from './loader/ILoader';
import { PixiLoader } from './loader/PixiLoader';
import { HowlerLoader } from './loader/HowlerLoader';
import { SpineLoader } from './loader/SpineLoader';
import { IAssetManager } from './IAssetManager';
import { ManifestPath } from './ManifestPath';

export class AssetManager implements IAssetManager {
	private manifest: IManifest;
	public asyncLoaders: ILoader[];
	public syncLoaders: ILoader[];
	public bucketScale?: number;
	private loadedCount: number;
	private toLoadTotal: number;
	private pixiLoader: PIXI.Loader;
	private onProgressCallback: (progress: number) => void;

	constructor(onProgressCallback: (progress: number) => void, pixiLoader: PIXI.Loader) {
		this.manifest = {};
		this.asyncLoaders = [];
		this.syncLoaders = [];
		this.loadedCount = 0;
		this.toLoadTotal = 0;
		this.pixiLoader = pixiLoader;
		this.onProgressCallback = onProgressCallback;
	}

	private incrementLoadedCount(): void {
		this.loadedCount++;
		const totalProgress: number = this.loadedCount / this.toLoadTotal;
		this.onProgressCallback(totalProgress);
	}

	private async triggerSyncLoaders(filesToLoad: string[]): Promise<string[]> {
		for (const loader of this.syncLoaders) {
			filesToLoad = loader.addAssetsToLoader(filesToLoad);
			await loader.loadAssets();
		}
		return filesToLoad;
	}

	private triggerAsyncLoaders(filesToLoad: string[]): Promise<void[]> {
		this.asyncLoaders.forEach(loader => {
			filesToLoad = loader.addAssetsToLoader(filesToLoad);
		});

		const promises: Promise<void>[] = [];
		this.asyncLoaders.forEach(loader => {
			promises.push(
				new Promise((resolve, reject) => {
					loader
						.loadAssets()
						.then(() => {
							resolve();
						})
						.catch((e: Error) => {
							reject(e);
						});
				})
			);
		});
		return Promise.all(promises);
	}
	public loadManifestFiles(manifestPaths: ManifestPath[]): Promise<void[]> {
		const promises: Promise<void>[] = [];
		for (const manifestPath of manifestPaths) {
			promises.push(
				new Promise(async resolve => {
					const response = await fetch(manifestPath['path']);
					const manifest: IManifest = await response.json();
					for (const fileGroup in manifest) {
						let manifestToAdd = manifest[fileGroup];
						if (manifestPath['prefix']) {
							manifestToAdd = manifestToAdd.map((resource: string) => manifestPath['prefix'] + resource);
						}
						this.manifest[fileGroup] = this.manifest[fileGroup] ? this.manifest[fileGroup].concat(manifestToAdd) : manifestToAdd;
					}
					resolve();
				})
			);
		}
		return Promise.all(promises);
	}

	/**
	 * Loads all files that exist within the manifest under fileGroup.
	 *
	 * @param fileGroup: Grouping within manifest to be loaded.  These should
	 * generally be grouped according to when they will be needed by the game.
	 * eg. splashScreenAssets, loadOnStart.
	 */
	public async load(fileGroup: string): Promise<void> {
		this.loadedCount = 0;
		let filesRemaining: string[] = [...this.manifest[fileGroup]];
		this.toLoadTotal = Object.values(filesRemaining).length;

		filesRemaining = await this.triggerSyncLoaders(filesRemaining);
		await this.triggerAsyncLoaders(filesRemaining);
	}

	public registerDefaultLoaders(): void {
		this.registerLoader(new AtlasLoader(this.pixiLoader), false);
		this.registerLoader(new SpineLoader(this.pixiLoader), false);
		this.registerLoader(new HowlerLoader(this.pixiLoader), false);
		this.registerLoader(new PixiLoader(this.pixiLoader), false);
	}

	public registerLoader(loader: ILoader, isSynchronous: boolean): void {
		if (loader.setBucketScale) {
			if (this.bucketScale) loader.setBucketScale(this.bucketScale);
			else console.error('Asset Manager: bucket scale needs to be set!!');
		}
		loader.registerOnProgressCallback(this.incrementLoadedCount.bind(this));

		isSynchronous ? this.syncLoaders.push(loader) : this.asyncLoaders.push(loader);
	}

	public getAsset(name: string): any {
		let assetToReturn;
		for (const loader of this.syncLoaders.concat(this.asyncLoaders)) {
			const asset = loader.getAsset(name);
			if (asset) {
				assetToReturn = asset;
				break;
			}
		}
		if (assetToReturn) {
			return assetToReturn;
		} else {
			throw new Error(`Asset not found: ${name}`);
		}
	}
}
