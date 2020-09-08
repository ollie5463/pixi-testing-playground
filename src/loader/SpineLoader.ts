import 'pixi-spine';
import spineCore = PIXI.spine.core;
import { removeScalePrefixFromPath, triggerPixiLoad } from '../utils/LoaderUtils';
import { AbstractPixiLoader } from './AbstractPixiLoader';
import { filterStringsBy } from '../utils/LoaderUtils';

export class SpineLoader extends AbstractPixiLoader {
	private bucketScale: number;
	public cache: Map<string, spineCore.SkeletonData>;
	private removeExtensions: string[];

	constructor(pixiLoader: PIXI.Loader, validExtensions?: string[], removeExtensions?: string[]) {
		super(pixiLoader);
		const defaultExtensions = ['spine.json'];
		this.validExtensions = validExtensions || defaultExtensions;
		this.removeExtensions = removeExtensions || ['spine-[0-9].png', 'spine.png', 'spine.atlas'];
		this.bucketScale = 1;
		this.cache = new Map<string, spineCore.SkeletonData>();
	}

	public getAsset(name: string): any {
		return this.cache.get(name);
	}

	public loadAssets(): Promise<void> {
		this.addJSONSpineParsingMiddleware();
		return triggerPixiLoad(this.loader);
	}

	public addAssetsToLoader(assets: string[]): string[] {
		const excludedAssets = super.addAssetsToLoader(assets);
		return filterStringsBy(excludedAssets, this.removeExtensions)[1];
	}

	public setBucketScale(scale: number): void {
		this.bucketScale = scale;
	}

	private addJSONSpineParsingMiddleware(): void {
		this.loader.use(async (resource: PIXI.LoaderResource, next: () => any) => {
			const resourceNameAfterLastDash = resource.name.match('[^-]+$');
			if (resourceNameAfterLastDash && resourceNameAfterLastDash[0] === this.validExtensions[0]) {
				const scale = this.bucketScale;
				const atlas: PIXI.LoaderResource | undefined = this.loader.resources[resource.name + '_atlas'];
				if (!atlas) {
					console.error(`AssetLoader - SpineLoader: Can't find ${resource.name + '_atlas'}`);
					return;
				}
				let atlasData: spineCore.TextureAtlas;
				const spineScalerMetadata: { spineSkeletonScale: number; baseScale: number } = resource.data.scalerMetadata;
				const atlasPromise = new Promise((resolve, reject) => {
					atlasData = new spineCore.TextureAtlas(atlas.data, (path: string, callback: (texture: PIXI.BaseTexture) => any) => {
						let folderPath: string;
						const resourceUrlMatch = resource.url.match('[^/]+$');
						let pathToRemove = null;
						if (resourceUrlMatch && resourceUrlMatch[0]) {
							pathToRemove = resource.url.split(resourceUrlMatch[0]);
						}
						if (pathToRemove) {
							folderPath = pathToRemove[0];
							const texture = PIXI.BaseTexture.from(folderPath + path);
							callback(texture);
							resolve();
						} else {
							reject(`AssetManager - SpineLoader Cannot find the folder path ${pathToRemove} correctly`);
						}
					});
				});
				await atlasPromise
					.then(() => {
						const parser = new spineCore.SkeletonJson(new spineCore.AtlasAttachmentLoader(atlasData));
						parser.scale = scale / spineScalerMetadata.baseScale;
						const skelData: spineCore.SkeletonData = parser.readSkeletonData(resource.data);
						this.cache.set(removeScalePrefixFromPath(resource.url), skelData);
					})
					.catch(err => {
						console.error(err);
					});
			}
			next();
		});
	}
}

// import 'pixi-spine';
// import spineCore = PIXI.spine.core;
// import { AbstractPixiLoader } from '@bolt/bolt-assets';
// import { triggerPixiLoad, filterStringsBy, removeScalePrefixFromPath } from './LoaderUtils';

// export class GameSpineLoader extends AbstractPixiLoader {
// 	protected readonly removeExtensions: string[];
// 	protected bucketScale: number;

// 	public readonly cache: Map<string, spineCore.SkeletonData>;
// 	public readonly customTextureRetriever: ((path: string) => PIXI.BaseTexture) | undefined;

// 	constructor(pixiLoader: PIXI.Loader, customTextureRetriever?: (path: string) => PIXI.BaseTexture, validExtensions?: string[], removeExtensions?: string[]) {
// 		super(pixiLoader);
// 		const defaultExtensions = ['spine.json'];
// 		this.customTextureRetriever = customTextureRetriever;
// 		this.validExtensions = validExtensions || defaultExtensions;
// 		this.removeExtensions = removeExtensions || ['spine-[0-9].png', 'spine.png', 'spine.atlas'];
// 		this.bucketScale = 1;
// 		this.cache = new Map<string, spineCore.SkeletonData>();
// 	}

// 	public getAsset(name: string): any {
// 		return this.cache.get(name);
// 	}

// 	public loadAssets(): Promise<void> {
// 		this.addJSONSpineParsingMiddleware();
// 		return triggerPixiLoad(this.loader);
// 	}

// 	public addAssetsToLoader(assets: string[]): string[] {
// 		const excludedAssets = super.addAssetsToLoader(assets);
// 		return filterStringsBy(excludedAssets, this.removeExtensions)[1];
// 	}

// 	public setBucketScale(scale: number): void {
// 		this.bucketScale = scale;
// 	}

// 	protected addJSONSpineParsingMiddleware(): void {
// 		this.loader.use(async (resource: PIXI.LoaderResource, next: () => any) => {
// 			const resourceNameAfterLastDash = resource.name.match('[^-]+$');
// 			if (resourceNameAfterLastDash && resourceNameAfterLastDash[0] === this.validExtensions[0]) {
// 				const scale = this.bucketScale;
// 				const atlas: PIXI.LoaderResource | undefined = this.loader.resources[resource.name + '_atlas'];
// 				if (!atlas) {
// 					console.error(`AssetLoader - SpineLoader: Can't find ${resource.name + '_atlas'}`);
// 					return;
// 				}
// 				let atlasData: spineCore.TextureAtlas;
// 				const spineScalerMetadata: { spineSkeletonScale: number; baseScale: number } = resource.data.scalerMetadata;
// 				const atlasPromise = new Promise((resolve, reject) => {
// 					atlasData = new spineCore.TextureAtlas(atlas.data, (path: string, callback: (texture: PIXI.BaseTexture) => any) => {
// 						let folderPath: string;
// 						const resourceUrlMatch = resource.url.match('[^/]+$');
// 						let pathToRemove = null;
// 						if (resourceUrlMatch && resourceUrlMatch[0]) {
// 							pathToRemove = resource.url.split(resourceUrlMatch[0]);
// 						}

// 						if (pathToRemove) {
// 							if (this.customTextureRetriever != undefined) {
// 								console.info(`Attempting to load custom Spine texture: ${path}`);
// 								const pathNoExt = path.split('.')[0];
// 								const isBaseTexture = resource.url.indexOf(pathNoExt) >= 0;
// 								const texture = isBaseTexture ? new PIXI.BaseTexture() : this.customTextureRetriever(path);
// 								callback(texture);
// 								resolve();
// 							} else {
// 								folderPath = pathToRemove[0];
// 								const texture = PIXI.BaseTexture.from(folderPath + path);
// 								callback(texture);
// 								resolve();
// 							}
// 						} else {
// 							reject(`AssetManager - SpineLoader Cannot find the folder path ${pathToRemove} correctly`);
// 						}
// 					});
// 				});
// 				await atlasPromise
// 					.then(() => {
// 						const parser = new spineCore.SkeletonJson(new spineCore.AtlasAttachmentLoader(atlasData));
// 						parser.scale = scale / spineScalerMetadata.baseScale;
// 						const skelData: spineCore.SkeletonData = parser.readSkeletonData(resource.data);
// 						this.cache.set(removeScalePrefixFromPath(resource.url), skelData);
// 					})
// 					.catch(err => {
// 						console.error(err);
// 					});
// 			}
// 			next();
// 		});
// 	}

// 	/*protected getAtlasTextureLoaderFunction(url: string): (path: string, callback: (texture: PIXI.BaseTexture) => any) => void {
// 		return (path: string, callback: (texture: PIXI.BaseTexture) => any) => {
// 			if (this.customTextureRetriever != undefined) {
// 				const pathNoExt = path.split('.')[0];
// 				const isBaseTexture = url.indexOf(pathNoExt) >= 0;
// 				const texture = isBaseTexture ? new PIXI.BaseTexture() : this.customTextureRetriever(path);
// 				callback(texture);
// 			}
// 		};
// 	}*/
// }
