import { ItemView, WorkspaceLeaf } from "obsidian";

export const VIEW_TYPE_STARDEW = "stardew-view";

export class StardewView extends ItemView {
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType(): string {
        return VIEW_TYPE_STARDEW;
    }

    getDisplayText(): string {
        return "Stardew Animals";
    }

    getIcon(): string {
        return "paw-print"; // Or some icon, maybe "leaf" or custom
    }

    async onOpen() {
        const container = this.contentEl;
        container.empty();
        container.addClass('stardew-container');

        const header = container.createEl("h4", { cls: 'stardew-header', text: "Stardew Valley Animals" });

        // Create the farm area (fills remaining space)
        const farm = container.createDiv({ cls: "stardew-farm" });

        // Set background image from vault sprites folder
        const bgUrl = this.app.vault.adapter.getResourcePath('sprites/backgrounds/grass.png');
        farm.style.backgroundImage = `url('${bgUrl}')`;

        // Add some animals
        this.addAnimal(farm, "chicken", "chicken");
        this.addAnimal(farm, "cow", "cow");
        this.addAnimal(farm, "sheep", "sheep");
        this.addAnimal(farm, "pig", "pig");
        this.addAnimal(farm, "dog", "dog");

        // Start animations
        this.startAnimations();
    }

    private readonly ANIMAL_CONFIG: Record<
        string,
        {
            file: string;
            frameSize: number;
            framesPerDir: number;
            dirs: Array<'down' | 'left' | 'right' | 'up'>;
            originX: number;
            originY: number;
        }
    > = {
        // Chicken sprite contains multiple chicken types; keep the adult chicken at the top-left.
        chicken: {
            file: 'sprites/pets/chicken.png',
            frameSize: 16,
            framesPerDir: 3,
            dirs: ['down', 'left', 'right', 'up'],
            originX: 0,
            originY: 0,
        },
        cow: {
            file: 'sprites/pets/cow.png',
            frameSize: 16,
            framesPerDir: 3,
            dirs: ['down', 'left', 'right', 'up'],
            originX: 0,
            originY: 0,
        },
        sheep: {
            file: 'sprites/pets/sheep.png',
            frameSize: 16,
            framesPerDir: 3,
            dirs: ['down', 'left', 'right', 'up'],
            originX: 0,
            originY: 0,
        },
        pig: {
            file: 'sprites/pets/pig.png',
            frameSize: 16,
            framesPerDir: 3,
            dirs: ['down', 'left', 'right', 'up'],
            originX: 0,
            originY: 0,
        },
        dog: {
            file: 'sprites/pets/dog.png',
            frameSize: 16,
            framesPerDir: 3,
            dirs: ['down', 'left', 'right', 'up'],
            originX: 0,
            originY: 0,
        },
    };

    private animals: Array<{
        el: HTMLElement;
        config: {
            file: string;
            frameSize: number;
            framesPerDir: number;
            dirs: Array<'down' | 'left' | 'right' | 'up'>;
            originX: number;
            originY: number;
        };
        x: number;
        y: number;
        state: 'idle' | 'walking';
        direction: 'down' | 'left' | 'right' | 'up';
        frameIndex: number;
        scale: number;
        idleTimer?: number;
        walkRaf?: number;
        frameTimer?: number;
    }> = [];

    addAnimal(container: Element, sprite: string, id: string) {
        const config = this.ANIMAL_CONFIG[sprite];
        if (!config) {
            console.warn(`No sprite config found for ${sprite}`);
            return;
        }

        const animal = container.createDiv({ cls: "stardew-animal", attr: { id } });
        const spriteUrl = this.app.vault.adapter.getResourcePath(config.file);
        animal.style.backgroundImage = `url('${spriteUrl}')`;
        const scale = 2;
        animal.style.width = `${config.frameSize * scale}px`;
        animal.style.height = `${config.frameSize * scale}px`;

        const farmRect = (container as HTMLElement).getBoundingClientRect();
        const startX = Math.random() * (farmRect.width - config.frameSize * scale);
        const startY = Math.random() * (farmRect.height - config.frameSize * scale);

        animal.style.left = `${startX}px`;
        animal.style.top = `${startY}px`;

        const animalState = {
            el: animal,
            config,
            x: startX,
            y: startY,
            state: 'idle' as const,
            direction: 'down' as const,
            frameIndex: 0,
            scale,
        };

        // Use the natural image size to properly scale the sprite sheet.
        const img = new Image();
        img.onload = () => {
            animal.style.backgroundSize = `${img.naturalWidth * scale}px ${img.naturalHeight * scale}px`;
            this.setSpriteFrame(animalState);
        };
        img.src = spriteUrl;

        this.animals.push(animalState);
    }

    startAnimations() {
        this.animals.forEach(animal => this.startIdle(animal));
    }

    private startIdle(animalState: typeof this.animals[number]) {
        animalState.state = 'idle';
        animalState.frameIndex = 0;
        this.setSpriteFrame(animalState);
        const idleTime = 5000 + Math.random() * 5000; // 5-10s
        animalState.idleTimer = window.setTimeout(() => this.startWalk(animalState), idleTime);
    }

    private startWalk(animalState: typeof this.animals[number]) {
        animalState.state = 'walking';
        const farm = this.contentEl.querySelector('.stardew-farm') as HTMLElement;
        if (!farm) return;
        const rect = farm.getBoundingClientRect();
        const padding = animalState.config.frameSize * animalState.scale;

        const targetX = Math.random() * (rect.width - padding);
        const targetY = Math.random() * (rect.height - padding);

        const dx = targetX - animalState.x;
        const dy = targetY - animalState.y;

        const segments: Array<{
            dx: number;
            dy: number;
            direction: 'down' | 'left' | 'right' | 'up';
            distance: number;
        }> = [];

        if (Math.abs(dx) > 1) {
            segments.push({
                dx,
                dy: 0,
                direction: dx > 0 ? 'right' : 'left',
                distance: Math.abs(dx),
            });
        }
        if (Math.abs(dy) > 1) {
            segments.push({
                dx: 0,
                dy,
                direction: dy > 0 ? 'down' : 'up',
                distance: Math.abs(dy),
            });
        }

        if (!segments.length) {
            this.startIdle(animalState);
            return;
        }

        const speed = 40; // pixels per second

        const walkSegment = (index: number) => {
            if (index >= segments.length) {
                this.startIdle(animalState);
                return;
            }

            const segment = segments[index]!;
            animalState.direction = segment.direction;
            animalState.frameIndex = 1;
            this.setSpriteFrame(animalState);

            const duration = Math.max(200, (segment.distance / speed) * 1000);
            const startX = animalState.x;
            const startY = animalState.y;
            const startTime = performance.now();

            if (animalState.frameTimer) window.clearInterval(animalState.frameTimer);
            animalState.frameTimer = window.setInterval(() => {
                animalState.frameIndex = (animalState.frameIndex + 1) % animalState.config.framesPerDir;
                if (animalState.frameIndex === 0) animalState.frameIndex = 1;
                this.setSpriteFrame(animalState);
            }, 200);

            const step = (timestamp: number) => {
                const elapsed = timestamp - startTime;
                const progress = Math.min(1, elapsed / duration);
                animalState.x = startX + segment.dx * progress;
                animalState.y = startY + segment.dy * progress;
                animalState.el.style.left = `${animalState.x}px`;
                animalState.el.style.top = `${animalState.y}px`;

                if (progress < 1) {
                    animalState.walkRaf = requestAnimationFrame(step);
                } else {
                    if (animalState.frameTimer) window.clearInterval(animalState.frameTimer);
                    walkSegment(index + 1);
                }
            };

            animalState.walkRaf = requestAnimationFrame(step);
        };

        walkSegment(0);
    }

    private setSpriteFrame(animalState: typeof this.animals[number]) {
        const { config, direction, frameIndex, scale } = animalState;
        const dirIndex = config.dirs.indexOf(direction);
        const x = -(config.originX + frameIndex * config.frameSize) * scale;
        const y = -(config.originY + dirIndex * config.frameSize) * scale;
        animalState.el.style.backgroundPosition = `${x}px ${y}px`;
    }

    async onClose() {
        this.animals.forEach(animal => {
            if (animal.idleTimer) window.clearTimeout(animal.idleTimer);
            if (animal.frameTimer) window.clearInterval(animal.frameTimer);
            if (animal.walkRaf) cancelAnimationFrame(animal.walkRaf);
        });
        this.animals = [];
    }
}