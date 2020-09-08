import * as PIXI from 'pixi.js';
import { triggerPixiLoad, filterStringsBy, removeScalePrefixFromPath } from '../utils/LoaderUtils';
import { AbstractPixiLoader } from './AbstractPixiLoader';

export class AtlasLoader extends AbstractPixiLoader {
	constructor(pixiLoader: PIXI.Loader, validExtensions?: string[]) {
		super(pixiLoader);

		const defaultExtensions = ['atlas-[0-9].png', 'atlas_[0-9].png', 'atlas.json'];
		this.validExtensions = validExtensions || defaultExtensions;
	}

	public loadAssets(): Promise<void> {
		return triggerPixiLoad(this.loader, this.processAtlasFiles.bind(this));
	}

	public getAsset(name: string): any {
		return PIXI.utils.TextureCache[name];
	}

	private processAtlasFiles(): void {
		const [allAtlasJsonPaths] = filterStringsBy(Object.keys(this.loader.resources), ['atlas.json']);

		allAtlasJsonPaths.forEach((atlasJsonPath: string) => {
			this.processTextures(atlasJsonPath);
		});
	}

	private processTextures(atlasJsonPath: string): void {
		const splitPath = atlasJsonPath.split('/');
		const basePath = atlasJsonPath.substr(0, atlasJsonPath.length - splitPath[splitPath.length - 1].length);

		let textures: object[] = [];
		textures = this.loader.resources[atlasJsonPath]['data']['textures'];

		textures.forEach((textureInfo: any) => {
			const baseTexture = PIXI.utils.TextureCache[basePath + textureInfo['meta']['image']];
			if (baseTexture === undefined) {
				throw new Error(`Spritesheet source '${basePath + textureInfo.meta.image}' cannot be found`);
			}
			Object.keys(textureInfo.frames).forEach(frameKey => {
				this.processTexture(frameKey, textureInfo.frames, baseTexture, basePath);
			});
		});
	}

	private processTexture(frameKey: string, frameInfos: any, baseTexture: PIXI.BaseTexture, basePath: string): void {
		const frameInfo = frameInfos[frameKey];
		const frameArea = frameInfo.frame;
		const frameOrig = new PIXI.Rectangle(0, 0, frameInfo.sourceSize.w, frameInfo.sourceSize.h);
		let frameTrim = undefined;
		let frameRect;

		if (frameInfo.rotated) {
			frameRect = new PIXI.Rectangle(frameArea.x, frameArea.y, frameArea.h, frameArea.w);
		} else {
			frameRect = new PIXI.Rectangle(frameArea.x, frameArea.y, frameArea.w, frameArea.h);
		}
		if (frameInfo.trimmed) {
			frameTrim = new PIXI.Rectangle(frameInfo.spriteSourceSize.x, frameInfo.spriteSourceSize.y, frameArea.w, frameArea.h);
		}
		const texture = new PIXI.Texture(baseTexture, frameRect, frameOrig, frameTrim, frameInfo.rotated ? 2 : 0);

		PIXI.utils.TextureCache[removeScalePrefixFromPath(basePath + frameKey)] = texture;
	}
}
