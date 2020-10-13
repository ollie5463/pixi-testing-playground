import 'pixi-spine';
import spineCore = PIXI.spine.core;
import { removeScalePrefixFromPath, triggerPixiLoad, removeDefaultAndDefaultLocaleFromPath } from '../utils/LoaderUtils';
import { AbstractPixiLoader } from './AbstractPixiLoader';
import { filterStringsBy } from '../utils/LoaderUtils';
import { Loader, Resource } from 'resource-loader';

export class SpineLoader implements ILoader {
	private bucketScale: number;
	public cache: Map<string, spineCore.SkeletonData>;
	private removeExtensions: string[];
	protected validExtensions!: string[];
	private loader = new Loader()

	constructor(pixiLoader: PIXI.Loader, validExtensions?: string[], removeExtensions?: string[]) {
		// console.log('loader: ', new Loader());
		// super(new Loader();
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
		return new Promise(resolve => {
			console.log('loader: ', this.loader);
			this.loader.load((loader, resources) => {
				// const resource = resources[0];
				for (const resource of Object.values(resources)) {
					if (resource) {
						const textureAtlas = new PIXI.spine.core.TextureAtlas();
						const allTextures = this.retrieveTextures(resource)
						textureAtlas.addTextureHash(allTextures, true);
						console.log('textureAtlas: ', textureAtlas)
						const parser = new spineCore.SkeletonJson(new spineCore.AtlasAttachmentLoader(textureAtlas));
						parser.scale = 16;
						const skelData: spineCore.SkeletonData = parser.readSkeletonData(resource.data);
						this.cache.set(removeScalePrefixFromPath(resource.url), skelData);
					}
				}

				resolve();
			})
		});
		// return triggerPixiLoad(this.loader);
	}
	public registerOnProgressCallback(onProgressCallback: () => void): void {
		(this.loader as any).onProgress = {
			dispatch: onProgressCallback,
		};
	}
	
	public addAssetsToLoader(assets: string[]): string[] {
		// this.createDynamicSpineAtlases();
		const excludedAssets = this.addAssetsToLoader2(assets);
		return filterStringsBy(excludedAssets, this.removeExtensions)[1];
	}
		public addAssetsToLoader2(assets: string[]): string[] {
		const [includedAssets, excludedAssets] = filterStringsBy(assets, this.validExtensions);
		// console.log('includedAssets: ', includedAssets);
		for (const asset of includedAssets) {
			const assetName = this.applyPrefixRegex(asset);
			this.loader.add(assetName, asset);
		}
		return excludedAssets;
		}
	protected applyPrefixRegex(str: string): string {
		const result = removeDefaultAndDefaultLocaleFromPath(str);
		return removeScalePrefixFromPath(result);
	}

	public setBucketScale(scale: number): void {
		this.bucketScale = scale;
	}
	// private createDynamicSpineAtlases(): void {
		
	// }

	private addJSONSpineParsingMiddleware(): void {
		// this.loader.pre((resource, next) => {
		// 	console.log('resource: ', resource)
		// 	next(new Error('dont use'));
		// })

		// this.loader.use((resource: PIXI.LoaderResource, next: () => any) => {
		// 	const resourceNameAfterLastDash = resource.name.match('[^-]+$');
			// debugger
			// if (resourceNameAfterLastDash && this.validExtensions.includes(resourceNameAfterLastDash[0])) {
			// 	// console.log(resourceNameAfterLastDash);
			// // if (resourceNameAfterLastDash && resourceNameAfterLastDash[0] === this.validExtensions[0]) {
			// 	const scale = this.bucketScale;
			// 	const atlasFile: PIXI.LoaderResource | undefined = this.loader.resources[resource.name + '_atlas'];
			// 	if (!atlasFile) {
			// 		console.error(`AssetLoader - SpineLoader: Can't find ${resource.name + '_atlas'}`);
			// 		return;
			// 	}
			// 	let atlasData: spineCore.TextureAtlas;
			// 	// const spineScalerMetadata: { spineSkeletonScale: number; baseScale: number } = resource.data.scalerMetadata;

				
			// 	// const rawSkeletonData = resource.data;
			// 	// const rawAtlasData = atlasFile.data;
			// 	// console.log('rawSkeletonData: ', rawSkeletonData);
			// 	// console.log('rawAtlasData: ', rawAtlasData);
				
				// const textureAtlas = new PIXI.spine.core.TextureAtlas();
				// const allTextures = this.retrieveTextures(resource)
				// textureAtlas.addTextureHash(allTextures, true);
				
			// 	// const textureAtlas = new PIXI.spine.core.TextureAtlas(rawAtlasData, (line, callback) => {
			// 	// 	// console.log('line: ', line);
			// 	// 	const baseTexture = PIXI.utils.TextureCache
			// 	// 	// callback(PIXI.BaseTexture.from(line))
			// 	// })

				// const parser = new spineCore.SkeletonJson(new spineCore.AtlasAttachmentLoader(textureAtlas));
		
			// 	console.log('textureAtlas: ', textureAtlas)
			// 	console.log('parser: ', parser)
			// 	parser.scale = 16;
			// 	// parser.scale = scale / spineScalerMetadata.baseScale || 16;
			// 	// const skelData: spineCore.SkeletonData = parser.readSkeletonData(jsonFile.data);
			// 	// this.cache.set(removeScalePrefixFromPath(jsonFile.url), skelData);
			// 		// })
			// 		// .catch(err => {
			// 			// console.error(err);
			// 		// });
			// }
		// 	next();
		// });
	}
	private retrieveTextures(file: Resource): any {
		const obj: any = {};
		for (const slot of file.data.slots) {
			obj[slot.name] = PIXI.utils.TextureCache[slot.name + '.png']
			// go through skins also
		}
		return obj;
		
	}
}

// import 'pixi-spine';
// import spineCore = PIXI.spine.core;
// import { AbstractPixiLoader } from '@bolt/bolt-assets';
// import { triggerPixiLoad, filterStringsBy, removeScalePrefixFromPath } from './LoaderUtils';
// import { ILoader } from './ILoader';

// export class SpineLoader extends AbstractPixiLoader {
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
// 			console.log('got to json parsing middleware')
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

	/*protected getAtlasTextureLoaderFunction(url: string): (path: string, callback: (texture: PIXI.BaseTexture) => any) => void {
		return (path: string, callback: (texture: PIXI.BaseTexture) => any) => {
			if (this.customTextureRetriever != undefined) {
				const pathNoExt = path.split('.')[0];
				const isBaseTexture = url.indexOf(pathNoExt) >= 0;
				const texture = isBaseTexture ? new PIXI.BaseTexture() : this.customTextureRetriever(path);
				callback(texture);
			}
		};
	}*/
// }
