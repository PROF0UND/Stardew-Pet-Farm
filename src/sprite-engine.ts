export type Frame = [number, number];

export type AnimationOptions = {
    loop?: boolean;
    flip?: boolean;
};

export class Animation {
    frames: Frame[];
    fps: number;
    options: AnimationOptions;

    constructor(frames: Frame[], fps: number, options: AnimationOptions = {}) {
        this.frames = frames;
        this.fps = fps;
        this.options = options;
    }
}

export type SpriteDefinition = {
    file: string;
    frameSize: number;
    scale: number;
    animations: Record<string, Animation | Animation[]>;
};

export class SpriteEngine {
    private el: HTMLElement;
    private def: SpriteDefinition;
    private current?: Animation;
    private frameIndex = 0;
    private timer?: number;
    private spriteUrl: string;
    private flipped = false;

    constructor(el: HTMLElement, def: SpriteDefinition, resourcePath: (file: string) => string) {
        this.el = el;
        this.def = def;
        this.spriteUrl = resourcePath(def.file);
    }

    async load() {
        this.el.style.backgroundImage = `url('${this.spriteUrl}')`;
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error(`Failed to load sprite ${this.def.file}`));
            img.src = this.spriteUrl;
        });
        this.el.style.backgroundSize = `${img.naturalWidth * this.def.scale}px ${img.naturalHeight * this.def.scale}px`;
        this.setFrame([0, 0]);
    }

    play(name: string) {
        const animDef = this.def.animations[name];
        if (!animDef) return;
        const anim = Array.isArray(animDef) ? animDef[0] : animDef;
        if (!anim) return;
        this.stop();
        this.current = anim;
        this.frameIndex = 0;
        this.setFlip(Boolean(anim.options.flip));
        this.setFrame(anim.frames[this.frameIndex]);
        const interval = Math.max(16, Math.floor(1000 / anim.fps));
        this.timer = window.setInterval(() => {
            if (!this.current) return;
            this.frameIndex += 1;
            if (this.frameIndex >= this.current.frames.length) {
                if (this.current.options.loop === false) {
                    this.stop();
                    return;
                }
                this.frameIndex = 0;
            }
            this.setFrame(this.current.frames[this.frameIndex]);
        }, interval);
    }

    stop() {
        if (this.timer) window.clearInterval(this.timer);
        this.timer = undefined;
    }

    private setFlip(flip: boolean) {
        if (this.flipped === flip) return;
        this.flipped = flip;
        this.el.style.transform = flip ? "scaleX(-1)" : "scaleX(1)";
        this.el.style.transformOrigin = "center";
    }

    setFrame(frame: Frame) {
        const x = -(frame[0] * this.def.frameSize) * this.def.scale;
        const y = -(frame[1] * this.def.frameSize) * this.def.scale;
        this.el.style.backgroundPosition = `${x}px ${y}px`;
    }
}
