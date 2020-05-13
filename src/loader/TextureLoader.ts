import * as PIXI from 'pixi.js';
import loader = PIXI.Loader.shared;
import core = PIXI.spine.core;

// Need to extend interface
// Lets maybe pass extensions in?
export default class TextureLoader{
	private validExtensions: string[];
	public spine?: PIXI.spine.core.SkeletonData;
	constructor() {
		this.validExtensions = ['.png', '.jpeg', '.json', '.xml', '.txt'];
	}

	public loadAssets(manifest: object): Promise<Map<string, PIXI.LoaderResource>> {
		console.log('manifest: ', manifest);
		const filesToLoad: [string, any][] = this.filterUsingValidExtension(manifest);
		console.log('filesToLoad: ', filesToLoad);
		filesToLoad.forEach(entry => {
			loader.add(entry[1]);
		});
		// let customLoaderCalls = 1;
		// const line: string[] = [];
		const customLoader = function (path: string, callback: (tex: PIXI.BaseTexture) => any): void {
			const texture = PIXI.BaseTexture.from('./' + path);
			callback(texture);
		}
		loader.use((resource: PIXI.LoaderResource, next: () => any) => {
			if (resource.extension === 'json') {
				// const scale = 5;
				const atlas = loader.resources[resource.name + '_atlas'];

				const atlasData = new core.TextureAtlas(atlas.data, customLoader);
				const parser = new core.SkeletonJson(new core.AtlasAttachmentLoader(atlasData))
				const skelData = parser.readSkeletonData(resource.data);
				this.spine = skelData;

				console.log('atlasData: ', atlasData);
				console.log('parser: ', parser);
				console.log('skelData: ', skelData);
			}
			next();
		});



		return new Promise((resolve, reject) => {
			loader.load((loader, resources) => {
				const map: Map<string, PIXI.LoaderResource> = new Map<string, PIXI.LoaderResource>();
				Object.entries(resources).forEach(entry => {
					const entry1 = entry[1] as PIXI.LoaderResource;
					if (entry1.error) {
						reject(entry1.error);
					}
					map.set(entry[0], entry1);
				});
				resolve(map);
			});
		});
	}

	private filterUsingValidExtension(manifest: object): [string, any][] {
		const filteredManifest: [string, any][] = Object.entries(manifest).filter(entry => {
			let isValidExtension = false;
			for (const extension of this.validExtensions) {
				if (entry[1].includes(extension)) {
					isValidExtension = true;
				}
			}

			return isValidExtension;
		});
		return filteredManifest;
	}
}