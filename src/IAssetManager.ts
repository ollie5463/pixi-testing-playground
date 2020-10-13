import { ILoader } from './loaders/ILoader';
import { ManifestPath } from './ManifestPath';

export interface IAssetManager {
	loadManifestFiles(manifestPaths: ManifestPath[]): Promise<void[]>;
	load(fileGroup: string): Promise<void>;
	getAsset(name: string): any;
	registerDefaultLoaders(): void;
	registerLoader(loader: ILoader, isSynchronous: boolean): void;
}
