import { ItemView, WorkspaceLeaf } from "obsidian";
import { PetDefs } from "./pet-defs";
import { SpriteDefinition, SpriteEngine } from "./sprite-engine";

export const VIEW_TYPE_STARDEW = "stardew-view";

export class StardewView extends ItemView {
    private animationsPaused = false;
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

        this.registerDomEvent(window, 'blur', () => this.pauseAnimations());
        this.registerDomEvent(window, 'focus', () => this.resumeAnimations());
        this.registerDomEvent(document, 'visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
    }

    private readonly ANIMAL_CONFIG: Record<string, SpriteDefinition> = {
        chicken: PetDefs.CHICKEN,
        cow: PetDefs.COW,
        dog: PetDefs.DOG,
        cat: PetDefs.CAT,
    };

    private animals: Array<{
        el: HTMLElement;
        config: SpriteDefinition;
        engine: SpriteEngine;
        x: number;
        y: number;
        state: 'idle' | 'walking';
        direction: 'down' | 'left' | 'right' | 'up';
        idleTimer?: number;
        walkRaf?: number;
    }> = [];

    addAnimal(container: Element, sprite: string, id: string) {
        const config = this.ANIMAL_CONFIG[sprite];
        if (!config) {
            console.warn(`No sprite config found for ${sprite}`);
            return;
        }

        const animal = container.createDiv({ cls: "stardew-animal", attr: { id } });
        const engine = new SpriteEngine(
            animal,
            config,
            (file) => this.app.vault.adapter.getResourcePath(file)
        );
        engine.load().catch((err) => console.error(err));

        const farmEl = container as HTMLElement;
        const maxX = Math.max(0, farmEl.clientWidth - config.frameSize * config.scale);
        const maxY = Math.max(0, farmEl.clientHeight - config.frameSize * config.scale);
        const startX = Math.random() * maxX;
        const startY = Math.random() * maxY;

        animal.style.left = `${startX}px`;
        animal.style.top = `${startY}px`;
        animal.style.width = `${config.frameSize * config.scale}px`;
        animal.style.height = `${config.frameSize * config.scale}px`;

        const animalState = {
            el: animal,
            config,
            engine,
            x: startX,
            y: startY,
            state: 'idle' as const,
            direction: 'down' as const,
        };

        this.animals.push(animalState);
    }

    startAnimations() {
        this.animals.forEach(animal => this.startIdle(animal));
    }

    private startIdle(animalState: typeof this.animals[number]) {
        if (this.animationsPaused) return;
        animalState.state = 'idle';
        animalState.engine.play("idle");
        const idleTime = 5000 + Math.random() * 5000; // 5-10s
        animalState.idleTimer = window.setTimeout(() => this.startWalk(animalState), idleTime);
    }

    private startWalk(animalState: typeof this.animals[number]) {
        if (this.animationsPaused) return;
        animalState.state = 'walking';
        const farm = this.contentEl.querySelector('.stardew-farm') as HTMLElement;
        if (!farm) return;
        const padding = animalState.config.frameSize * animalState.config.scale;
        const maxX = Math.max(0, farm.clientWidth - padding);
        const maxY = Math.max(0, farm.clientHeight - padding);

        const targetX = Math.random() * maxX;
        const targetY = Math.random() * maxY;

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
            animalState.engine.play(this.getMoveAnimName(animalState.direction));

            const duration = Math.max(200, (segment.distance / speed) * 1000);
            const startX = animalState.x;
            const startY = animalState.y;
            const startTime = performance.now();

            const step = (timestamp: number) => {
                if (this.animationsPaused) return;
                const elapsed = timestamp - startTime;
                const progress = Math.min(1, elapsed / duration);
                const nextX = startX + segment.dx * progress;
                const nextY = startY + segment.dy * progress;
                animalState.x = Math.max(0, Math.min(maxX, nextX));
                animalState.y = Math.max(0, Math.min(maxY, nextY));
                animalState.el.style.left = `${animalState.x}px`;
                animalState.el.style.top = `${animalState.y}px`;

                if (progress < 1) {
                    animalState.walkRaf = requestAnimationFrame(step);
                } else {
                    walkSegment(index + 1);
                }
            };

            animalState.walkRaf = requestAnimationFrame(step);
        };

        walkSegment(0);
    }

    async onClose() {
        this.pauseAnimations();
        this.animals = [];
    }

    private pauseAnimations() {
        if (this.animationsPaused) return;
        this.animationsPaused = true;
        this.animals.forEach(animal => {
            if (animal.idleTimer) window.clearTimeout(animal.idleTimer);
            if (animal.walkRaf) cancelAnimationFrame(animal.walkRaf);
            animal.engine.stop();
            animal.idleTimer = undefined;
            animal.walkRaf = undefined;
        });
    }

    private resumeAnimations() {
        if (!this.animationsPaused) return;
        this.animationsPaused = false;
        this.animals.forEach(animal => this.startIdle(animal));
    }

    private getMoveAnimName(direction: 'down' | 'left' | 'right' | 'up') {
        switch (direction) {
            case "down":
                return "moveDown";
            case "left":
                return "moveLeft";
            case "right":
                return "moveRight";
            case "up":
                return "moveUp";
        }
    }
}
