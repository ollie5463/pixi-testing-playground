import * as PIXI from "pixi.js";
window.PIXI = PIXI;
import "pixi-spine"
import 'regenerator-runtime/runtime'
import { AssetManager } from '@bolt/bolt-assets';
import { SpineLoader } from './loader/SpineLoader';
import { AtlasLoader } from './loader/AtlasLoader';

export class Main {
    private static readonly GAME_WIDTH = 800;
    private static readonly GAME_HEIGHT = 600;

    private app!: PIXI.Application;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private spineLoader = new SpineLoader(PIXI.Loader.shared);
    private atlasLoader = new AtlasLoader(PIXI.Loader.shared);
    private manifest = [
        "symbol-disappear-atlas.json",
        "symbol-disappear-atlas-0.png"
    ];

    constructor() {
        window.onload = (): void => {
            // this.spineLoader.addAssetsToLoader(this.manifest);
            // this.spineLoader.loadAssets().then(() => {
            //     this.onAssetsLoaded();
            //     this.helloWorld();
            // });  
            this.atlasLoader.addAssetsToLoader(this.manifest);
            this.atlasLoader.loadAssets().then(() => {
                // this.createSpine();
                this.checkAtlasFiles();
                this.helloWorld();
            });  
        };
    }

    public helloWorld(): void {
        console.log("hello world");
    }

    private checkAtlasFiles(): void {
        console.log(PIXI.utils.TextureCache);
    }

    private createSpine(): void {
        this.createRenderer();

        // spine stuff
        const asset = this.spineLoader.getAsset('./high-1-spine.json');
        const spine = new PIXI.spine.Spine(asset);
        spine.state.setAnimation(0, 'locked', true);
        spine.state.timeScale = 1;

        const stage = this.app.stage;
        spine.x = this.app.renderer.width / 2;
        spine.y = this.app.renderer.height / 2;
        spine.scale.set(2.5);
        stage.addChild(spine);

    }

    private createRenderer(): void {
        this.app = new PIXI.Application({
            backgroundColor: 0xd3d3d3,
            width: Main.GAME_WIDTH,
            height: Main.GAME_HEIGHT,
        });

        document.body.appendChild(this.app.view);

        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        this.app.stage.scale.x = window.innerWidth / Main.GAME_WIDTH;
        this.app.stage.scale.y = window.innerHeight / Main.GAME_HEIGHT;

        window.addEventListener("resize", this.onResize.bind(this));
    }

    private onResize(): void {
        if (!this.app) {
            return;
        }

        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        this.app.stage.scale.x = window.innerWidth / Main.GAME_WIDTH;
        this.app.stage.scale.y = window.innerHeight / Main.GAME_HEIGHT;
    }

    private playSpine(): void {
        const animation = new PIXI.spine.Spine(PIXI.Loader.shared.resources["z"].spineData);
        animation.position.set(Main.GAME_WIDTH/2, Main.GAME_HEIGHT/3)
        // add the animation to the scene and render...
        this.app.stage.addChild(animation);
        animation.scale.x = 0.5;
        animation.scale.y = 0.5;

        if (animation.state.hasAnimation('animation')) {
            // run forever, little boy!
            animation.state.setAnimation(0, 'animation', true);
            // dont run too fast
            animation.state.timeScale = 1;
        }
    }

    private getBird(): PIXI.AnimatedSprite {
        const bird = new PIXI.AnimatedSprite([
            PIXI.Texture.from("birdUp.png"),
            PIXI.Texture.from("birdMiddle.png"),
            PIXI.Texture.from("birdDown.png"),
        ]);
        bird.loop = true;
        bird.animationSpeed = 0.1;
        bird.play();
        bird.scale.set(3);

        return bird;
    }

    private drawMPAImage(): void {
        const sheet = PIXI.Loader.shared.resources['mpa'].data;
        const mpa = new PIXI.Sprite(sheet.textures[0].frames["daily-calendar-assets/images/calendar-tick.png"]);
        // const mpa = PIXI.Sprite.from("daily-calendar-assets/images/calendar-cross.png");
        mpa.position.set(Main.GAME_WIDTH/3, Main.GAME_HEIGHT/3)
        this.app.stage.addChild(mpa);
    }

}

new Main();
