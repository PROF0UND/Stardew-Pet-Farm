import { Animation, SpriteDefinition } from "./sprite-engine";

type AnimMap = Record<string, Animation | Animation[]>;

function A(frames: [number, number][], fps: number, opts: { loop?: boolean; flip?: boolean } = {}) {
    return new Animation(frames, fps, opts);
}

export class PetAnimations {
    static get DEFAULT(): AnimMap {
        return {
            idle: A([[0, 0]], 5, { loop: false }),
            moveDown: A([[0, 0], [1, 0], [2, 0], [3, 0]], 5),
            moveRight: A([[0, 1], [1, 1], [2, 1], [3, 1]], 5),
            moveLeft: A([[0, 1], [1, 1], [2, 1], [3, 1]], 5, { flip: true }),
            moveUp: A([[0, 2], [1, 2], [2, 2], [3, 2]], 5),
            sleep: A([[0, 3], [1, 3]], 30, { loop: false }),
            special: A([[0, 4], [1, 4], [2, 4], [3, 4], [2, 4], [1, 4], [0, 4], [0, 0]], 5, {
                loop: false,
            }),
        };
    }

    static get CAT(): AnimMap {
        return {
            idle: A([[0, 4], [1, 4], [2, 4]], 5, { loop: false }),
            moveDown: A([[0, 0], [1, 0], [2, 0], [3, 0]], 5),
            moveRight: A([[0, 1], [1, 1], [2, 1], [3, 1]], 5),
            moveUp: A([[0, 2], [1, 2], [2, 2], [3, 2]], 5),
            moveLeft: A([[0, 3], [1, 3], [2, 3], [3, 3]], 5),
            special: A([[0, 5], [1, 5], [2, 5], [3, 5], [0, 5], [2, 4]], 5, { loop: false }),
            sleep: [
                A([[0, 7], [1, 7]], 30),
                A([[0, 6], [1, 6], [2, 6], [3, 6]], 5, { loop: false }),
            ],
        };
    }

    static get DOG(): AnimMap {
        return {
            idle: A([[0, 5], [1, 5], [2, 5], [3, 5]], 5, { loop: false }),
            moveDown: A([[0, 0], [1, 0], [2, 0], [3, 0]], 5),
            moveRight: A([[0, 1], [1, 1], [2, 1], [3, 1]], 5),
            moveUp: A([[0, 2], [1, 2], [2, 2], [3, 2]], 5),
            moveLeft: A([[0, 3], [1, 3], [2, 3], [3, 3]], 5),
            special: A([[1, 6], [0, 6], [2, 6], [3, 5]], 5, { loop: false }),
            sleep: A([[0, 7], [1, 7]], 30),
        };
    }

    static get TURTLE(): AnimMap {
        return {
            idle: A([[0, 4]], 5, { loop: false }),
            moveDown: A([[0, 0], [1, 0], [2, 0], [3, 0]], 5),
            moveRight: A([[0, 1], [1, 1], [2, 1], [3, 1]], 5),
            moveUp: A([[0, 2], [1, 2], [2, 2], [3, 2]], 5),
            moveLeft: A([[0, 3], [1, 3], [2, 3], [3, 3]], 5),
            special: A([[0, 6], [1, 6], [2, 6], [3, 6]], 5),
            sleep: A([[0, 4], [1, 4], [2, 4], [3, 4], [0, 5]], 5, { loop: false }),
        };
    }

    static get DINO(): AnimMap {
        return {
            idle: A([[0, 0]], 5, { loop: false }),
            moveDown: A([[0, 0], [1, 0], [2, 0], [3, 0]], 5),
            moveRight: A([[0, 1], [1, 1], [2, 1], [3, 1]], 5),
            moveUp: A([[0, 2], [1, 2], [2, 2], [3, 2]], 5),
            moveLeft: A([[0, 3], [1, 3], [2, 3], [3, 3]], 5),
            special: A([[0, 6], [1, 6], [2, 6], [3, 6], [0, 6], [0, 0]], 5, { loop: false }),
            sleep: A([[0, 4], [1, 4]], 30),
        };
    }

    static get DUCK(): AnimMap {
        return {
            idle: A([[0, 0]], 5, { loop: false }),
            moveDown: A([[0, 0], [1, 0], [2, 0], [3, 0]], 5),
            moveRight: A([[0, 1], [1, 1], [2, 1], [3, 1]], 5),
            moveUp: A([[0, 2], [1, 2], [2, 2], [3, 2]], 5),
            moveLeft: A([[0, 3], [1, 3], [2, 3], [3, 3]], 5),
            special: A([[0, 6], [1, 6], [2, 6], [3, 6], [2, 6], [3, 6], [2, 6], [1, 6], [0, 6]], 5, {
                loop: false,
            }),
            sleep: A([[0, 7], [1, 7]], 30),
        };
    }

    static get RACCOON(): AnimMap {
        return {
            idle: A([[0, 0]], 5, { loop: false }),
            moveDown: A([[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0]], 2),
            moveLeft: A([[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1]], 2),
            moveUp: A([[0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2]], 2),
            moveRight: A([[0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3]], 2),
            special: A([[8, 2], [9, 2], [10, 2], [11, 2], [12, 2], [13, 2], [14, 2], [15, 2]], 5, {
                loop: true,
            }),
        };
    }

    static get RABBIT(): AnimMap {
        return {
            idle: A([[0, 0]], 5, { loop: false }),
            moveDown: A([[0, 0], [1, 0], [2, 0], [3, 0]], 5),
            moveRight: A([[0, 1], [1, 1], [2, 1], [3, 1]], 5),
            moveUp: A([[0, 2], [1, 2], [2, 2], [3, 2]], 5),
            moveLeft: A([[0, 3], [1, 3], [2, 3], [3, 3]], 5),
            special: A([[0, 6], [1, 6], [2, 6], [3, 6], [2, 6], [1, 6], [0, 6], [0, 0]], 5, {
                loop: false,
            }),
            sleep: A([[0, 4], [1, 4]], 30, { loop: false }),
        };
    }

    static get CHICKEN(): AnimMap {
        return {
            idle: A([[0, 0]], 5, { loop: false }),
            moveDown: A([[0, 0], [1, 0], [2, 0], [3, 0]], 5),
            moveRight: A([[0, 1], [1, 1], [2, 1], [3, 1]], 5),
            moveUp: A([[0, 2], [1, 2], [2, 2], [3, 2]], 5),
            moveLeft: A([[0, 3], [1, 3], [2, 3], [3, 3]], 5),
            special: A([[0, 6], [1, 6], [2, 6], [1, 6], [2, 6], [1, 6], [0, 6], [0, 0]], 5, {
                loop: false,
            }),
            sleep: A([[0, 4], [1, 4]], 5, { loop: false }),
        };
    }

    static get COW(): AnimMap {
        return {
            idle: A([[0, 0]], 5, { loop: false }),
            moveDown: A([[0, 0], [1, 0], [2, 0], [3, 0]], 5),
            moveRight: A([[0, 1], [1, 1], [2, 1], [3, 1]], 5),
            moveLeft: A([[0, 1], [1, 1], [2, 1], [3, 1]], 5, { flip: true }),
            moveUp: A([[0, 2], [1, 2], [2, 2], [3, 2]], 5),
            special: A([[0, 4], [1, 4], [3, 4], [2, 4], [3, 4], [1, 4], [0, 4]], 5, {
                loop: false,
            }),
            sleep: A([[0, 3], [1, 3]], 30),
        };
    }

    static get PARROT(): AnimMap {
        return {
            idle: A([[0, 0]], 5, { loop: false }),
            moveUp: A([[8, 0], [9, 0], [10, 0]], 5),
            moveRight: A([[2, 0], [3, 0], [4, 0]], 5, { flip: true }),
            moveDown: A([[5, 0], [6, 0], [7, 0]], 5),
            moveLeft: A([[2, 0], [3, 0], [4, 0]], 5),
            special: A([[0, 0], [1, 0], [0, 0], [1, 0], [0, 0]], 5, { loop: false }),
        };
    }

    static get JUNIMO(): AnimMap {
        return {
            idle: A([[0, 0]], 5, { loop: false }),
            moveDown: A([[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0]], 2),
            moveRight: A([[0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2]], 2),
            moveLeft: A([[0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2]], 2, {
                flip: true,
            }),
            moveUp: A([[0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4]], 2),
            special: [
                A([[4, 3], [5, 3], [6, 3], [7, 3]], 5),
                A([[4, 5], [5, 5], [6, 5], [7, 5]], 5),
            ],
            sleep: A([[4, 1], [5, 1], [6, 1], [7, 1]], 30),
        };
    }
}

export class PetDefs {
    static get CAT(): SpriteDefinition {
        return { file: "sprites/pets/cat.png", frameSize: 16, scale: 1, animations: PetAnimations.CAT };
    }

    static get DOG(): SpriteDefinition {
        return { file: "sprites/pets/dog.png", frameSize: 16, scale: 1, animations: PetAnimations.DOG };
    }

    static get TURTLE(): SpriteDefinition {
        return { file: "sprites/pets/turtle.png", frameSize: 16, scale: 1, animations: PetAnimations.TURTLE };
    }

    static get DINO(): SpriteDefinition {
        return { file: "sprites/pets/dino.png", frameSize: 16, scale: 1, animations: PetAnimations.DINO };
    }

    static get DUCK(): SpriteDefinition {
        return { file: "sprites/pets/duck.png", frameSize: 16, scale: 1, animations: PetAnimations.DUCK };
    }

    static get RACCOON(): SpriteDefinition {
        return { file: "sprites/pets/raccoon.png", frameSize: 16, scale: 1, animations: PetAnimations.RACCOON };
    }

    static get RABBIT(): SpriteDefinition {
        return { file: "sprites/pets/rabbit.png", frameSize: 16, scale: 1, animations: PetAnimations.RABBIT };
    }

    static get CHICKEN(): SpriteDefinition {
        return { file: "sprites/pets/chicken.png", frameSize: 16, scale: 1, animations: PetAnimations.CHICKEN };
    }

    static get COW(): SpriteDefinition {
        return { file: "sprites/pets/cow.png", frameSize: 16, scale: 1, animations: PetAnimations.COW };
    }

    static get PARROT(): SpriteDefinition {
        return { file: "sprites/pets/parrot.png", frameSize: 16, scale: 1, animations: PetAnimations.PARROT };
    }

    static get JUNIMO(): SpriteDefinition {
        return { file: "sprites/pets/junimo.png", frameSize: 16, scale: 1, animations: PetAnimations.JUNIMO };
    }
}
