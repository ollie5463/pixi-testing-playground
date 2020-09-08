// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface ILoader {
	loadAssets(): Promise<void>;
	addAssetsToLoader(assets: string[]): string[];
	registerOnProgressCallback(cb: () => void): void;
	setBucketScale?(scale: number): void;
	getAsset(name: string): any;
}
