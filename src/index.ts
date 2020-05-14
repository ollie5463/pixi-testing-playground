import * as PIXI from "pixi.js";
window.PIXI = PIXI;
import "pixi-spine"

import TextureLoader from "./loader/TextureLoader";

export class Main {
    private static readonly GAME_WIDTH = 800;
    private static readonly GAME_HEIGHT = 600;

    private app!: PIXI.Application;

    private textureLoader = new TextureLoader();
    private manifest = {
        // firstLayout: "./layout1.json",
        // breakfast: "./breakfast.xml",
        // sprites: "./spritesData.json",
        // testTxt: "./test.txt",
        // dfgLogoSpine: "./dfg-logo.json", 
        atlasJson: "./dfg-logo.json",
        // mpa: "./multipageatlas/atlas.json",
        // z: "./zephyrspine/clover.json",
        // spriteSheetTest: "./testSpritesheen-0.json",
    };

    constructor() {
        window.onload = (): void => {
            this.textureLoader.loadAssets(this.manifest).then((value:Map<string, PIXI.LoaderResource>) => {
                console.log(value);

                // console.log(PIXI.Loader.shared.resources["breakfast"]);
                // console.log(PIXI.Loader.shared.resources["testTxt"]);
                this.onAssetsLoaded();
            });
        };
    }

    // add for the test example purpose
    public helloWorld(): string {
        return "hello world";
    }


    private onAssetsLoaded(): void {
        this.createRenderer();

        const stage = this.app.stage;

        // const birdFromSprite = this.getBird();
        // birdFromSprite.anchor.set(0.5, 0.5);
        // birdFromSprite.position.set(Main.GAME_WIDTH / 2, Main.GAME_HEIGHT / 2);

        // stage.addChild(birdFromSprite);

        console.log('texture cache: ', PIXI.utils.TextureCache);
        if (this.textureLoader.spine) {
            // const loader = PIXI.Loader.shared;
            const animation = new PIXI.spine.Spine(this.textureLoader.spine);
            animation.position.set(Main.GAME_WIDTH/2, Main.GAME_HEIGHT/3)
            // add the animation to the scene and render...
            stage.addChild(animation);
            animation.scale.x = 0.5;
            animation.scale.y = 0.5;
    
            if (animation.state.hasAnimation('animation')) {
                // run forever, little boy!
                animation.state.setAnimation(0, 'animation', true);
                // dont run too fast
                animation.state.timeScale = 1;
            }
        }


        // const rainbow = PIXI.Loader.shared.resources["spriteSheetTest"].spritesheet?.textures['background-rainbow/images/background-rainbow.png'];
        // console.log(PIXI.Loader.shared.resources);
        // const sprite = new PIXI.Sprite(rainbow);
        // sprite.scale.set(0.5)
        // stage.addChild(sprite);

        // this.playSpine();
        // this.drawMPAImage();
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
