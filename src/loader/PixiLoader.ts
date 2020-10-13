import { triggerPixiLoad } from '../utils/LoaderUtils';
import { AbstractPixiLoader } from './AbstractPixiLoader';

export class PixiLoader extends AbstractPixiLoader {
	constructor(pixiLoader: PIXI.Loader, validExtensions?: string[]) {
		super(pixiLoader);
		const defaultExtensions = ['.png', '.jpeg', '.json', '.xml', '.txt', '.jpg'];
		this.validExtensions = validExtensions || defaultExtensions;
	}

	public loadAssets(): Promise<void> {
		return triggerPixiLoad(this.loader);
	}

	public getAsset(name: string): any {
		return this.loader.resources[name];
	}
}
