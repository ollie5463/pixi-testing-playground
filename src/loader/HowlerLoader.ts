import * as PIXI from 'pixi.js';
import 'pixi-spine';
import { filterStringsBy, triggerPixiLoad, getExtension } from '../utils/LoaderUtils';
import { Howl } from 'howler';
import { AbstractPixiLoader } from './AbstractPixiLoader';

export class HowlerLoader extends AbstractPixiLoader {
	private assetsToLoad: Map<string, string>;
	private base64FilesToLoad: string[];
	private cache: Map<string, string>;
	private onProgressCallback?: () => void;

	constructor(pixiLoader: PIXI.Loader, base64FileExtension = 'sounds.json', soundFileExtensions: string[] = ['m4a', 'wav']) {
		super(pixiLoader);
		this.validExtensions = [base64FileExtension].concat(soundFileExtensions);
		this.assetsToLoad = new Map<string, string>();
		this.base64FilesToLoad = [];
		this.cache = new Map<string, string>();
	}

	public async loadAssets(): Promise<void> {
		await triggerPixiLoad(this.loader);
		for (const base64File of this.base64FilesToLoad) {
			Object.entries(this.loader.resources[base64File].data).forEach(entry => {
				const base64Prefix = this.applyPrefixRegex(base64File.replace('sounds.json', ''));
				this.assetsToLoad.set(base64Prefix + entry[0], entry[1] as string);
			});
		}
		return this.loadSounds();
	}

	public registerOnProgressCallback(onProgressCallback: () => void): void {
		super.registerOnProgressCallback(onProgressCallback);
		this.onProgressCallback = onProgressCallback;
	}

	public getAsset(name: string): any {
		return this.cache.get(name);
	}

	private loadSounds(): Promise<void> {
		const promises: Promise<void>[] = [];
		this.assetsToLoad.forEach((value, key) => {
			const isBase64Sound = !value.includes(key);
			promises.push(
				new Promise((resolve, reject) => {
					let sound;
					if (isBase64Sound) {
						const extension = getExtension(key)?.replace('.', '');
						if (extension && this.validExtensions.includes(extension)) {
							sound = new Howl({ src: value, autoplay: false, format: [extension] });
						} else {
							console.error(`Cannot find audio extension on base 64 sound${key}`);
							resolve();
						}
					} else {
						sound = new Howl({ src: value, autoplay: false });
					}
					if (sound) {
						sound.once('load', () => {
							this.cache.set(key, value);
							if (this.onProgressCallback) {
								this.onProgressCallback();
							}
							resolve();
						});
						sound.once('loaderror', (soundId, error) => {
							reject(new Error(`AssetManager - AudioLoader: Couldnt load sound ${soundId} with error ${error}`));
						});
					}
				})
			);
		});
		return new Promise((resolve, reject) => {
			Promise.all(promises)
				.then(() => resolve())
				.catch(err => reject(err));
		});
	}

	public addAssetsToLoader(assets: string[]): string[] {
		const base64FilesToLoad = filterStringsBy(assets, [this.validExtensions[0]])[0];
		base64FilesToLoad.forEach(entry => {
			this.base64FilesToLoad.push(entry);
			this.loader.add(entry);
		});
		const assetsToload = filterStringsBy(assets, this.validExtensions.slice(1))[0];
		assetsToload.forEach((asset: string) => {
			const assetName = this.applyPrefixRegex(asset);
			this.assetsToLoad.set(assetName, asset);
		});
		const allAssetsToLoad = base64FilesToLoad.concat(assetsToload);
		return filterStringsBy(assets, allAssetsToLoad)[1];
	}
}
