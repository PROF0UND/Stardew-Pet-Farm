//AI
class AI {

    //States
    static get IDLE() { return 'idle' }
    static get MOVE() { return 'move' }
    static get SPECIAL() { return 'special' }

    //AI info
    #character;
    #state = AI.IDLE;
    #timer = new Timer();
    #movePos = new Vec2();

    get character() { return this.#character; }
    get state() { return this.#state; }
    get timer() { return this.#timer; }

    //Config (idle)
    #idleDurationBase = 2 * Game.fps;       //Minimum duration of idle (in frames)
    #idleDurationVariation = 2 * Game.fps;  //Variation of duration for idle (in frames)

    get idleDuration() { return this.#idleDurationBase + Util.randomInclusive(this.#idleDurationVariation); }

    //Config (sleep)
    #canSleep = true;
    #isSleeping = false;
    #sleepDurationBase = 10 * Game.fps;     //Minimum duration of sleep (in frames)
    #sleepDurationVariation = 5 * Game.fps; //Variation of duration for sleep (in frames)

    get sleepDuration() { return this.#sleepDurationBase + Util.randomInclusive(this.#sleepDurationVariation); }

    //Config (special)
    #specialDuration = 2 * Game.fps;        //Duration of special (in frames)

    get specialDuration() { return this.#specialDuration; }

    //Constructor
    constructor(config) {
        //No config
        if (typeof config !== 'object') return;

        //Idle config
        if (typeof config.idleDurationBase == 'number') this.#idleDurationBase = config.idleDurationBase;
        if (typeof config.idleDurationVariation == 'number') this.#idleDurationVariation = config.idleDurationVariation;

        //Sleep config
        if (typeof config.canSleep == 'boolean') this.#canSleep = config.canSleep;
        if (typeof config.sleepDurationBase == 'number') this.#sleepDurationBase = config.sleepDurationBase;
        if (typeof config.sleepDurationVariation == 'number') this.#sleepDurationVariation = config.sleepDurationVariation;

        //Special config
        if (typeof config.specialDuration == 'number') this.#specialDuration = config.specialDuration;
    }

    assign(character) {
        //Assign character
        this.#character = character;
    }

    //Click
    click() {}

    //Movement
    _moveTowardsMovePos() {
        //Get distance to target
        const dist = this.character.pos.distance(this.#movePos);

        //Arrived at target
        if (dist < 1) {
            //Set to idle
            this.setState(AI.IDLE);
            return;
        }

        //Move towards target
        const delta = Math.min(this.character.speed, dist);
        const dir = this.#movePos.sub(this.character.pos).normalize();
        this.character.pos = this.character.pos.add(dir.mult(delta));
    }

    moveTowards(point) {
        //Set move position
        this.#movePos = point;

        //Set to move state
        this.setState(AI.MOVE);
    }

    moveTowardsRandom() {
        //Move towards random point
        this.moveTowards(this.character.randomPoint);
    }

    moveLeft() {
        this.character.animate('moveLeft');
        return this.character.moveTo(new Vec2(this.character.pos.x - 1, this.character.pos.y));
    }

    moveRight() {
        this.character.animate('moveRight');
        return this.character.moveTo(new Vec2(this.character.pos.x + 1, this.character.pos.y));
    }

    moveUp() {
        this.character.animate('moveUp');
        return this.character.moveTo(new Vec2(this.character.pos.x, this.character.pos.y - 1));
    }

    moveDown() {
        this.character.animate('moveDown');
        return this.character.moveTo(new Vec2(this.character.pos.x, this.character.pos.y + 1));
    }

    //State
    update() {
        //Run on update for current state
        const onUpdate = this[`onUpdate_${this.state}`];
        if (typeof onUpdate === 'function') onUpdate.call(this);
    }

    setState(newState) {
        //Not a valid state
        if (typeof newState !== 'string') return;

        //Run on end for old state
        const onEnd = this[`onEnd_${this.state}`];
        if (typeof onEnd === 'function') onEnd.call(this);

        //Set state
        this.#state = newState;

        //Run on start for new state
        const onStart = this[`onStart_${this.state}`];
        if (typeof onStart === 'function') onStart.call(this);
    }

    //State: IDLE
    onStart_idle() {
        //Animate idle
        this.character.animate('idle');

        //Start timer
        this.timer.count(this.idleDuration);

        //Reset sleeping
        this.#isSleeping = false;
    }

    onUpdate_idle() {
        //Timer finished
        if (this.timer.finished) {
            //Can sleep
            if (this.#canSleep && Util.randomExclusive(10) == 0) {
                //Start sleeping
                this.character.animate('sleep');
                this.timer.count(this.sleepDuration);
                this.#isSleeping = true;
            }
            //Move to random point
            else {
                this.moveTowardsRandom();
            }
        }
    }

    onEnd_idle() {
        //Stop sleeping
        if (this.#isSleeping) {
            this.character.animate('idle');
        }
    }

    //State: MOVE
    onUpdate_move() {
        //Move towards target
        this._moveTowardsMovePos();
    }

    //State: SPECIAL
    onStart_special() {
        //Start timer
        this.timer.count(this.specialDuration);
    }

    onUpdate_special() {
        //Timer finished
        if (this.timer.finished) {
            //Set to idle
            this.setState(AI.IDLE);
        }
    }

}

//Characters
class Character extends GameObject {

    //Object
    get isCharacter() { return true; }

    //AI
    #ai;

    get ai() { return this.#ai; }


    //Constructor
    constructor(config, ai) {
        super(config);

        //Assign AI
        this.#ai = ai
        ai.assign(this)

        //Respawn character
        this.respawn();
    }

    //Update
    update() {
        //Update AI
        this.ai.update();

        //Update game object
        super.update();
    }

    //Click
    onclick() {
        //Notify AI a click happened
        this.ai.onclick();
    }

}

/*$$$$$$             /$$
| $$__  $$           | $$
| $$  \ $$ /$$$$$$  /$$$$$$   /$$$$$$$
| $$$$$$$//$$__  $$|_  $$_/  /$$_____/
| $$____/| $$$$$$$$  | $$   |  $$$$$$
| $$     | $$_____/  | $$ /$$\____  $$
| $$     |  $$$$$$$  |  $$$$//$$$$$$$/
|__/      \_______/   \___/ |______*/

//Animations
class PetAnimations {

    static get DEFAULT() {
        return {
            'idle': new Animation(
                [[0, 0]],
                5,
                { loop: false }
            ),
            'moveDown': new Animation(
                [[0, 0], [1, 0], [2, 0], [3, 0]],
                5
            ),
            'moveRight': new Animation(
                [[0, 1], [1, 1], [2, 1], [3, 1]],
                5
            ),
            'moveLeft': new Animation(
                [[0, 1], [1, 1], [2, 1], [3, 1]],
                5,
                { flip: true }
            ),
            'moveUp': new Animation(
                [[0, 2], [1, 2], [2, 2], [3, 2]],
                5
            ),
            'sleep': new Animation(
                [[0, 3], [1, 3]],
                30,
                { loop: false }
            ),
        };
    }

    static get CAT() {
        return {
            'idle': new Animation(
                [[0, 0]],
                5,
                { loop: false }
            ),
            'moveDown': new Animation(
                [[0, 0], [1, 0], [2, 0], [3, 0]],
                5
            ),
            'moveRight': new Animation(
                [[0, 1], [1, 1], [2, 1], [3, 1]],
                5
            ),
            'moveLeft': new Animation(
                [[0, 1], [1, 1], [2, 1], [3, 1]],
                5,
                { flip: true }
            ),
            'moveUp': new Animation(
                [[0, 2], [1, 2], [2, 2], [3, 2]],
                5
            ),
            'sleep': new Animation(
                [[0, 3], [1, 3]],
                30,
                { loop: false }
            ),
        };
    }

    static get DOG() {
        return {
            'idle': new Animation(
                [[0, 0]],
                5,
                { loop: false }
            ),
            'moveDown': new Animation(
                [[0, 0], [1, 0], [2, 0], [3, 0]],
                5
            ),
            'moveRight': new Animation(
                [[0, 1], [1, 1], [2, 1], [3, 1]],
                5
            ),
            'moveLeft': new Animation(
                [[0, 1], [1, 1], [2, 1], [3, 1]],
                5,
                { flip: true }
            ),
            'moveUp': new Animation(
                [[0, 2], [1, 2], [2, 2], [3, 2]],
                5
            ),
            'sleep': new Animation(
                [[0, 3], [1, 3]],
                30,
                { loop: false }
            ),
        };
    }

    static get TURTLE() {
        return {
            'idle': new Animation(
                [[0, 0]],
                5,
                { loop: false }
            ),
            'moveDown': new Animation(
                [[0, 0], [1, 0], [2, 0], [3, 0]],
                5
            ),
            'moveRight': new Animation(
                [[0, 1], [1, 1], [2, 1], [3, 1]],
                5
            ),
            'moveLeft': new Animation(
                [[0, 1], [1, 1], [2, 1], [3, 1]],
                5,
                { flip: true }
            ),
            'moveUp': new Animation(
                [[0, 2], [1, 2], [2, 2], [3, 2]],
                5
            ),
            'sleep': new Animation(
                [[0, 3], [1, 3]],
                30,
                { loop: false }
            ),
        };
    }

    static get DINO() {
        return {
            'idle': new Animation(
                [[0, 0]],
                5,
                { loop: false }
            ),
            'moveDown': new Animation(
                [[0, 0], [1, 0], [2, 0], [3, 0]],
                5
            ),
            'moveRight': new Animation(
                [[0, 1], [1, 1], [2, 1], [3, 1]],
                5
            ),
            'moveLeft': new Animation(
                [[0, 1], [1, 1], [2, 1], [3, 1]],
                5,
                { flip: true }
            ),
            'moveUp': new Animation(
                [[0, 2], [1, 2], [2, 2], [3, 2]],
                5
            ),
            'sleep': new Animation(
                [[0, 3], [1, 3]],
                30,
                { loop: false }
            ),
        };
    }

    static get DUCK() {
        return {
            'idle': new Animation(
                [[0, 0]],
                5,
                { loop: false }
            ),
            'moveDown': new Animation(
                [[0, 0], [1, 0], [2, 0], [3, 0]],
                5
            ),
            'moveRight': new Animation(
                [[0, 1], [1, 1], [2, 1], [3, 1]],
                5
            ),
            'moveLeft': new Animation(
                [[0, 1], [1, 1], [2, 1], [3, 1]],
                5,
                { flip: true }
            ),
            'moveUp': new Animation(
                [[0, 2], [1, 2], [2, 2], [3, 2]],
                5
            ),
            'sleep': new Animation(
                [[0, 3], [1, 3]],
                30,
                { loop: false }
            ),
        };
    }

    static get RACCOON() {
        return {
            'idle': new Animation(
                [[0, 0]],
                5,
                { loop: false }
            ),
            'moveDown': new Animation(
                [[0, 0], [1, 0], [2, 0], [3, 0]],
                5
            ),
            'moveRight': new Animation(
                [[0, 1], [1, 1], [2, 1], [3, 1]],
                5
            ),
            'moveLeft': new Animation(
                [[0, 1], [1, 1], [2, 1], [3, 1]],
                5,
                { flip: true }
            ),
            'moveUp': new Animation(
                [[0, 2], [1, 2], [2, 2], [3, 2]],
                5
            ),
            'sleep': new Animation(
                [[0, 3], [1, 3]],
                30,
                { loop: false }
            ),
        };
    }

    static get RABBIT() {
        return {
            'idle': new Animation(
                [[0, 0]],
                5,
                { loop: false }
            ),
            'moveDown': new Animation(
                [[0, 0], [1, 0], [2, 0], [3, 0]],
                5
            ),
            'moveRight': new Animation(
                [[0, 1], [1, 1], [2, 1], [3, 1]],
                5
            ),
            'moveLeft': new Animation(
                [[0, 1], [1, 1], [2, 1], [3, 1]],
                5,
                { flip: true }
            ),
            'moveUp': new Animation(
                [[0, 2], [1, 2], [2, 2], [3, 2]],
                5
            ),
            'sleep': new Animation(
                [[0, 3], [1, 3], [2, 3], [3, 3], [2, 3], [1, 3], [0, 3], [0, 0]],
                5,
                { loop: false }
            ),
        };
    }

    static get CHICKEN() {
        return {
            'idle': new Animation(
                [[0, 0]],
                5,
                { loop: false }
            ),
            'moveDown': new Animation(
                [[0, 0], [1, 0], [2, 0], [3, 0]],
                5
            ),
            'moveRight': new Animation(
                [[0, 1], [1, 1], [2, 1], [3, 1]],
                5
            ),
            'moveLeft': new Animation(
                [[0, 1], [1, 1], [2, 1], [3, 1]],
                5,
                { flip: true }
            ),
            'moveUp': new Animation(
                [[0, 2], [1, 2], [2, 2], [3, 2]],
                5
            ),
            'sleep': new Animation(
                [[0, 3], [1, 3], [2, 3], [1, 3], [2, 3], [1, 3], [0, 3], [0, 0]],
                5,
                { loop: false }
            ),
        };
    }

    static get COW() {
        return {
            'idle': new Animation(
                [[0, 0]],
                5,
                { loop: false }
            ),
            'moveDown': new Animation(
                [[0, 0], [1, 0], [2, 0], [3, 0]],
                5
            ),
            'moveRight': new Animation(
                [[0, 1], [1, 1], [2, 1], [3, 1]],
                5
            ),
            'moveLeft': new Animation(
                [[0, 1], [1, 1], [2, 1], [3, 1]],
                5,
                { flip: true }
            ),
            'moveUp': new Animation(
                [[0, 2], [1, 2], [2, 2], [3, 2]],
                5
            ),
            'sleep': new Animation(
                [[0, 3], [1, 3]],
                30,
                { loop: false }
            ),
        };
    }

    static get PARROT() {
        return {
            'idle': new Animation(
                [[0, 0]],
                5,
                { loop: false }
            ),
            'moveDown': new Animation(
                [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0]],
                2
            ),
            'moveRight': new Animation(
                [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1]],
                2
            ),
            'moveLeft': new Animation(
                [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1]],
                2,
                { flip: true }
            ),
            'moveUp': new Animation(
                [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2]],
                2
            ),
            'sleep': new Animation(
                [[0, 3], [1, 3]],
                30,
                { loop: false }
            ),
        };
    }

    static get JUNIMO() {
        return {
            'idle': new Animation(
                [[0, 0]],
                5,
                { loop: false }
            ),
            'moveDown': new Animation(
                [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0]],
                2
            ),
            'moveRight': new Animation(
                [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2]],
                2
            ),
            'moveLeft': new Animation(
                [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2]],
                2,
                { flip: true }
            ),
            'moveUp': new Animation(
                [[0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3]],
                2
            ),
            'sleep': new Animation(
                [[0, 4], [1, 4]],
                30,
                { loop: false }
            ),
        };
    }

}

//AI
class PetMoods {
    static get NORMAL() { return new Vec2(0, 0); }
    static get HAPPY() { return new Vec2(1, 0); }
    static get SAD() { return new Vec2(2, 0); }
    static get ANGRY() { return new Vec2(3, 0); }
    static get EXCITED() { return new Vec2(4, 0); }
    static get TIRED() { return new Vec2(5, 0); }
    static get SICK() { return new Vec2(6, 0); }
    static get CONFUSED() { return new Vec2(7, 0); }
    static get ALIEN() { return new Vec2(1, 2); }
    static get DEVIL() { return new Vec2(2, 2); }
    static get SILLY() { return new Vec2(13, 1); }
    static get MUSIC() { return new Vec2(6, 3); }
}

class PetAI extends AI {

    //Config (special)
    #specialDuration = 2 * Game.fps;        //Duration of special (in frames)

    get specialDuration() { return this.#specialDuration; }

    //Mood
    #mood = PetMoods.NORMAL;
    #moodElevation = 0;

    get mood() { return this.#mood; }
    get moodElevation() { return this.#moodElevation; }

    //Constructor
    constructor(config) {
        super(config);

        //Mood config
        if (typeof config.moodElevation == 'number') this.#moodElevation = config.moodElevation;
    }

    //Click
    onclick() {
        //Set mood
        this.#mood = PetMoods.HAPPY;

        //Set to special state
        this.setState(AI.SPECIAL);
    }

    //State: IDLE
    onStart_idle() {
        //Call parent
        super.onStart_idle();

        //Set mood
        this.#mood = PetMoods.NORMAL;
    }

    //State: SPECIAL
    onStart_special() {
        //Call parent
        super.onStart_special();

        //Set mood
        this.#mood = PetMoods.HAPPY;
    }

    onEnd_special() {
        //Set mood
        this.#mood = PetMoods.NORMAL;
    }

}

//Characters
class PetCharacter extends Character {

    //Pet info
    #specie = '';
    #color = 'Color';

    get specie() { return this.#specie; }
    get color() { return this.#color; }


    //Constructor
    constructor(name, specie, color, config = {}, config_ai = {}) {
        //Add name & image to config
        config.name = name;
        config.image = `sprites/pets/${specie.toLowerCase()}.png`;

        //Create character
        super(config, new PetAI(config_ai));

        //Save info
        this.#specie = specie;
        this.#color = color;

        //Move towards random point
        this.ai.moveTowardsRandom();

        //Add to pets list
        Game.pets.push(this);
    }

    remove() {
        super.remove();

        //Remove from pets list
        Game.pets.removeItem(this);
    }

    //Clicks
    mouseUp(pos) {
        //Notify AI emeny was clicked
        this.ai.onclick();

        //Consume event
        return true;
    }

    //Rendering
    draw(ctx, options) {
        //Draw pet
        super.draw(ctx, options);

        //Draw mood bubble
        if (this.ai.mood != PetMoods.NORMAL) {
            //Mood bubble position
            const bubblePos = this.pos.sub(new Vec2(0, this.size.y / 2 + 8));

            //Draw mood bubble
            ctx.drawImage(
                Game.moodImage,
                this.ai.mood.x * 16, this.ai.mood.y * 16, 16, 16,
                bubblePos.x - 8, bubblePos.y - 8, 16, 16
            );
        }
    }

    //Movement
    moveTowardsBall(ballPos) {
        //Get distance to ball
        const dist = this.pos.distance(ballPos);

        //Too far
        if (dist > 100) return;

        //Move towards ball
        this.ai.moveTowards(ballPos);
    }

}

//Cat
class Cat extends PetCharacter {

    constructor(name, color) {
        //Object config
        const config = {
            size: new Vec2(32),
            animations: PetAnimations.CAT
        };

        //AI config
        const config_ai = {};

        //Color sprite sheet offset
        switch (color.toLowerCase()) {
            default:
            case 'black':
                config.spriteSheetOffset = new Vec2();
                config_ai.moodElevation = 4;
                break;
            case 'gray':
                config.spriteSheetOffset = new Vec2(128, 0);
                config_ai.moodElevation = 4;
                break;
            case 'orange':
                config.spriteSheetOffset = new Vec2(256, 0);
                config_ai.moodElevation = 6;
                break;
            case 'white':
                config.spriteSheetOffset = new Vec2(384, 0);
                config_ai.moodElevation = 4;
                break;
            case 'yellow':
                config.spriteSheetOffset = new Vec2(512, 0);
                config_ai.moodElevation = 4;
                break;
            case 'purple':
                config.spriteSheetOffset = new Vec2(640, 0);
                config_ai.moodElevation = 1;
                break;
        }

        //Create pet
        super(name, 'cat', color, config, config_ai);
    }

}

//Dog
class Dog extends PetCharacter {

    constructor(name, color) {
        //Object config
        const config = {
            size: new Vec2(32),
            animations: PetAnimations.DOG
        };

        //AI config
        const config_ai = {};

        //Color sprite sheet offset
        switch (color.toLowerCase()) {
            default:
            case 'blonde':
                config.spriteSheetOffset = new Vec2();
                config_ai.moodElevation = 4;
                break;
            case 'gray':
                config.spriteSheetOffset = new Vec2(128, 0);
                config_ai.moodElevation = 4;
                break;
            case 'brown':
                config.spriteSheetOffset = new Vec2(256, 0);
                config_ai.moodElevation = 6;
                break;
            case 'dark brown':
                config.spriteSheetOffset = new Vec2(384, 0);
                config_ai.moodElevation = 4;
                break;
            case 'light brown':
                config.spriteSheetOffset = new Vec2(512, 0);
                config_ai.moodElevation = 4;
                break;
            case 'purple':
                config.spriteSheetOffset = new Vec2(640, 0);
                config_ai.moodElevation = 1;
                break;
        }

        //Create pet
        super(name, 'dog', color, config, config_ai);
    }

}

//Turtle
class Turtle extends PetCharacter {

    constructor(name, color) {
        //Object config
        const config = {
            size: new Vec2(32),
            animations: PetAnimations.TURTLE
        };

        //AI config
        const config_ai = {
            moodElevation: -2
        };

        //Color sprite sheet offset
        switch (color.toLowerCase()) {
            default:
            case 'green':
                config.spriteSheetOffset = new Vec2();
                break;
            case 'purple':
                config.spriteSheetOffset = new Vec2(128, 0);
                break;
        }

        //Create pet
        super(name, 'turtle', color, config, config_ai);
    }

}

//Dino
class Dino extends PetCharacter {

    constructor(name, color) {
        //Object config
        const config = {
            size: new Vec2(32),
            animations: PetAnimations.DINO
        };

        //AI config
        const config_ai = {
            moodElevation: 9
        };

        //Color sprite sheet offset
        switch (color.toLowerCase()) {
            default:
            case 'default':
                config.spriteSheetOffset = new Vec2();
                break;
        }

        //Create pet
        super(name, 'dino', color, config, config_ai);
    }

}

//Duck
class Duck extends PetCharacter {

    constructor(name, color) {
        //Object config
        const config = {
            size: new Vec2(32),
            animations: PetAnimations.DUCK
        };

        //AI config
        const config_ai = {
            moodElevation: 7
        };

        //Color sprite sheet offset
        switch (color.toLowerCase()) {
            default:
            case 'default':
                config.spriteSheetOffset = new Vec2();
                break;
        }

        //Create pet
        super(name, 'duck', color, config, config_ai);
    }

}

//Raccoon
class Raccoon extends PetCharacter {

    constructor(name, color) {
        //Object config
        const config = {
            size: new Vec2(32),
            animations: PetAnimations.RACCOON
        };

        //AI config
        const config_ai = {
            moodElevation: 5
        };

        //Color sprite sheet offset
        switch (color.toLowerCase()) {
            default:
            case 'default':
                config.spriteSheetOffset = new Vec2();
                break;
        }

        //Create pet
        super(name, 'raccoon', color, config, config_ai);
    }

}

//Goat, sheep, ostrich, pig
class Goat extends PetCharacter {

    constructor(name, color) {
        //Object config
        const config = {
            size: new Vec2(32),
            animations: PetAnimations.DEFAULT
        };

        //AI config
        const config_ai = {};

        //Color sprite sheet offset
        switch (color.toLowerCase()) {
            default:
            case 'adult':
                config.spriteSheetOffset = new Vec2();
                config_ai.moodElevation = 3;
                break;
            case 'baby':
                config.spriteSheetOffset = new Vec2(128, 0);
                break;
        }

        //Create pet
        super(name, 'goat', color, config, config_ai);
    }

}

class Sheep extends PetCharacter {

    constructor(name, color) {
        //Object config
        const config = {
            size: new Vec2(32),
            animations: PetAnimations.DEFAULT
        };

        //AI config
        const config_ai = {};

        //Color sprite sheet offset
        switch (color.toLowerCase()) {
            default:
            case 'adult':
                config.spriteSheetOffset = new Vec2();
                config_ai.moodElevation = 3;
                break;
            case 'baby':
                config.spriteSheetOffset = new Vec2(128, 0);
                break;
        }

        //Create pet
        super(name, 'sheep', color, config, config_ai);
    }

}

class Ostrich extends PetCharacter {

    constructor(name, color) {
        //Object config
        const config = {
            size: new Vec2(32),
            animations: PetAnimations.DEFAULT
        };

        //AI config
        const config_ai = {};

        //Color sprite sheet offset
        switch (color.toLowerCase()) {
            default:
            case 'adult':
                config.spriteSheetOffset = new Vec2();
                config_ai.moodElevation = 3;
                break;
            case 'baby':
                config.spriteSheetOffset = new Vec2(128, 0);
                break;
        }

        //Create pet
        super(name, 'ostrich', color, config, config_ai);
    }

}

class Pig extends PetCharacter {

    constructor(name, color) {
        //Object config
        const config = {
            size: new Vec2(32),
            animations: PetAnimations.DEFAULT
        };

        //AI config
        const config_ai = {};

        //Color sprite sheet offset
        switch (color.toLowerCase()) {
            default:
            case 'adult':
                config.spriteSheetOffset = new Vec2();
                config_ai.moodElevation = 3;
                break;
            case 'baby':
                config.spriteSheetOffset = new Vec2(128, 0);
                break;
        }

        //Create pet
        super(name, 'pig', color, config, config_ai);
    }

}

//Rabbit
class Rabbit extends PetCharacter {

    constructor(name, color) {
        //Object config
        const config = {
            size: new Vec2(32),
            animations: PetAnimations.RABBIT
        };

        //AI config
        const config_ai = {};

        //Color sprite sheet offset
        switch (color.toLowerCase()) {
            default:
            case 'adult':
                config.spriteSheetOffset = new Vec2();
                config_ai.moodElevation = 3;
                break;
            case 'baby':
                config.spriteSheetOffset = new Vec2(128, 0);
                break;
        }

        //Create pet
        super(name, 'rabbit', color, config, config_ai);
    }

}

//Chicken
class Chicken extends PetCharacter {

    constructor(name, color) {
        //Object config
        const config = {
            size: new Vec2(16),
            animations: PetAnimations.CHICKEN
        };

        //AI config
        const config_ai = {};

        //Color sprite sheet offset
        switch (color.toLowerCase()) {
            default:
            case 'white adult':
                config.spriteSheetOffset = new Vec2();
                config_ai.moodElevation = 10;
                break;
            case 'white baby':
                config.spriteSheetOffset = new Vec2(64, 0);
                config_ai.moodElevation = 2;
                break;
            case 'blue adult':
                config.spriteSheetOffset = new Vec2(128, 0);
                config_ai.moodElevation = 10;
                break;
            case 'blue baby':
                config.spriteSheetOffset = new Vec2(192, 0);
                config_ai.moodElevation = 4;
                break;
            case 'brown adult':
                config.spriteSheetOffset = new Vec2(256, 0);
                config_ai.moodElevation = 10;
                break;
            case 'brown baby':
                config.spriteSheetOffset = new Vec2(320, 0);
                config_ai.moodElevation = 3;
                break;
            case 'black adult':
                config.spriteSheetOffset = new Vec2(384, 0);
                config_ai.moodElevation = 10;
                break;
            case 'black baby':
                config.spriteSheetOffset = new Vec2(448, 0);
                config_ai.moodElevation = 3;
                break;
        }

        //Create pet
        super(name, 'chicken', color, config, config_ai);
    }

}

//Cow
class Cow extends PetCharacter {

    constructor(name, color) {
        //Object config
        const config = {
            size: new Vec2(32),
            animations: PetAnimations.COW
        };

        //AI config
        const config_ai = {};

        //Color sprite sheet offset
        switch (color.toLowerCase()) {
            default:
            case 'white adult':
                config.spriteSheetOffset = new Vec2();
                config_ai.moodElevation = 10;
                break;
            case 'white baby':
                config.spriteSheetOffset = new Vec2(128, 0);
                config_ai.moodElevation = 2;
                break;
            case 'brown adult':
                config.spriteSheetOffset = new Vec2(256, 0);
                config_ai.moodElevation = 10;
                break;
            case 'brown baby':
                config.spriteSheetOffset = new Vec2(384, 0);
                config_ai.moodElevation = 4;
                break;
        }

        //Create pet
        super(name, 'cow', color, config, config_ai);
    }

}

//Parrot
class Parrot extends PetCharacter {

    constructor(name, color) {
        //Object config
        const config = {
            size: new Vec2(24),
            animations: PetAnimations.PARROT
        };

        //AI config
        const config_ai = {
            canSleep: false
        };

        //Color sprite sheet offset
        switch (color.toLowerCase()) {
            default:
            case 'green adult':
                config.spriteSheetOffset = new Vec2();
                config_ai.moodElevation = 7;
                break;
            case 'green baby':
                config.spriteSheetOffset = new Vec2(0, 24);
                config_ai.moodElevation = 5;
                break;
            case 'blue adult':
                config.spriteSheetOffset = new Vec2(0, 48);
                config_ai.moodElevation = 6;
                break;
            case 'blue baby':
                config.spriteSheetOffset = new Vec2(0, 72);
                config_ai.moodElevation = 3;
                break;
            case 'golden joja':
                config.spriteSheetOffset = new Vec2(0, 96);
                config_ai.moodElevation = 10;
                break;
        }

        //Create pet
        super(name, 'parrot', color, config, config_ai);
    }

}

//Junimo
class Junimo extends PetCharacter {

    constructor(name, color) {
        //Object config
        const config = {
            size: new Vec2(16),
            animations: PetAnimations.JUNIMO
        };

        //AI config
        const config_ai = {
            moodElevation: 9
        };

        //Color sprite sheet offset
        switch (color.toLowerCase()) {
            default:
            case 'white':
                config.spriteSheetOffset = new Vec2(0, 0);
                break;
            case 'black':
                config.spriteSheetOffset = new Vec2(128, 0);
                break;
            case 'gray':
                config.spriteSheetOffset = new Vec2(256, 0);
                break;
            case 'pink':
                config.spriteSheetOffset = new Vec2(384, 0);
                break;
            case 'red':
                config.spriteSheetOffset = new Vec2(0, 96);
                break;
            case 'orange':
                config.spriteSheetOffset = new Vec2(128, 96);
                break;
            case 'yellow':
                config.spriteSheetOffset = new Vec2(256, 96);
                break;
            case 'green':
                config.spriteSheetOffset = new Vec2(384, 96);
                break;
            case 'cyan':
                config.spriteSheetOffset = new Vec2(0, 192);
                break;
            case 'purple':
                config.spriteSheetOffset = new Vec2(128, 192);
                break;
            case 'brown':
                config.spriteSheetOffset = new Vec2(256, 192);
                break;
        }

        //Create pet
        super(name, 'junimo', color, config, config_ai);
    }

}

/*$$$$$$$                                   /$$
| $$_____/                                  |__/
| $$       /$$$$$$$   /$$$$$$  /$$$$$$/$$$$  /$$  /$$$$$$   /$$$$$$$
| $$$$$   | $$__  $$ /$$__  $$| $$_  $$_  $$| $$ /$$__  $$ /$$_____/
| $$__/   | $$  \ $$| $$  \ $$| $$ \ $$ \ $$| $$| $$$$$$$$|  $$$$$$
| $$      | $$  | $$| $$  | $$| $$ | $$ | $$| $$| $$_____/ \____  $$
| $$      |  $$$$$$/|  $$$$$$/| $$ | $$ | $$| $$|  $$$$$$$ /$$$$$$$/
/*...*/
