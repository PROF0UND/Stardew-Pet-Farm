/*$   /$$   /$$     /$$ /$$
| $$  | $$  | $$    |__/| $$
| $$  | $$ /$$$$$$   /$$| $$
| $$  | $$|_  $$_/  | $$| $$
| $$  | $$  | $$    | $$| $$
| $$  | $$  | $$ /$$| $$| $$
|  $$$$$$/  |  $$$$/| $$| $$
 \______/    \___/  |__/|__*/

//Classes
class Vec2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(n) {
        if (typeof n === 'object')
            return new Vec2(this.x + n.x, this.y + n.y);
        else
            return new Vec2(this.x + n, this.y + n);
    }

    sub(n) {
        if (typeof n === 'object')
            return new Vec2(this.x - n.x, this.y - n.y);
        else
            return new Vec2(this.x - n, this.y - n);
    }

    mult(n) {
        if (typeof n === 'object')
            return new Vec2(this.x * n.x, this.y * n.y);
        else
            return new Vec2(this.x * n, this.y * n);
    }

    div(n) {
        if (typeof n === 'object')
            return new Vec2(this.x / n.x, this.y / n.y);
        else
            return new Vec2(this.x / n, this.y / n);
    }

    mod(n) {
        if (typeof n === 'object')
            return new Vec2(this.x % n.x, this.y % n.y);
        else
            return new Vec2(this.x % n, this.y % n);
    }

    dot(n) {
        return this.x * n.x + this.y * n.y;
    }

    cross(n) {
        return this.x * n.y - this.y * n.x;
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    distance(n) {
        return this.sub(n).length();
    }

    normalize() {
        const len = this.length();
        return len > 0 ? this.div(len) : new Vec2();
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }

    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vec2(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
    }

    floor() {
        return new Vec2(Math.floor(this.x), Math.floor(this.y));
    }

    ceil() {
        return new Vec2(Math.ceil(this.x), Math.ceil(this.y));
    }

    round() {
        return new Vec2(Math.round(this.x), Math.round(this.y));
    }

    abs() {
        return new Vec2(Math.abs(this.x), Math.abs(this.y));
    }

    min(n) {
        return new Vec2(Math.min(this.x, n.x), Math.min(this.y, n.y));
    }

    max(n) {
        return new Vec2(Math.max(this.x, n.x), Math.max(this.y, n.y));
    }

    clamp(min, max) {
        return this.max(min).min(max);
    }

    lerp(n, t) {
        return this.add(n.sub(this).mult(t));
    }

    equals(n) {
        return this.x === n.x && this.y === n.y;
    }

    toString() {
        return `(${this.x}, ${this.y})`;
    }
}

class Timer {

    //Info
    #active = false;
    #end = 0;

    get justFinished() { return this.#active && Game.frames == this.#end; }
    get finished() { return this.#active && Game.frames >= this.#end; }

    //Constructor
    constructor() { }

    //Functions
    count(frames) {
        this.#active = true;
        this.#end = Game.frames + frames;
    }

    reset() {
        this.#active = false;
    }

}

class Timeout {

    //Info
    #fun;
    #timeout;

    //Constructor
    constructor(fun, duration) {
        this.#fun = fun;
        if (typeof duration === 'number') this.wait(duration);
    }

    //Functions
    wait(duration) {
        this.stop();
        this.#timeout = setTimeout(this.#fun, duration);
    }

    stop() {
        clearTimeout(this.#timeout);
    }

}

class Util {

    static randomExclusive(max) {
        //Random number from 0 to max exclusive
        return Math.floor(Math.random() * (max));
    }

    static randomInclusive(max) {
        //Random number from 0 to max inclusive
        return Math.floor(Math.random() * (max + 1));
    }

    static clamp(number, min, max) {
        //Clamp number between min a max
        return Math.min(Math.max(number, min), max);
    }

    static moveTowards(current, target, delta) {
        //Get distance
        const diff = target - current;
        const distance = Math.abs(diff);

        //Move towards target
        return (distance < delta ? target : current + diff / distance * delta)
    }

    static titleCase(str) {
        const parts = str.toLowerCase().split(' ');
        for (var i = 0; i < parts.length; i++) parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].substring(1);
        return parts.join(' ');
    }

}

//Array extensions
Array.prototype.removeAt = function(index) {
    const elem = this[index];
    this.splice(index, 1);
    return elem;
}

Array.prototype.removeItem = function(elem) {
    const index = this.indexOf(elem);
    this.splice(index, 1);
    return index;
}

Array.prototype.isEmpty = function() {
    return this.length == 0;
}

/*$$$$$                                     /$$
 /$$__  $$                                   | $$
| $$  \ $$  /$$$$$$$ /$$$$$$  /$$$$$$/$$$$  /$$$$$$    /$$$$$$
| $$$$$$$$ /$$_____/|_  $$_/ | $$_  $$_  $$|_  $$_/   /$$__  $$
| $$__  $$| $$        | $$   | $$ \ $$ \ $$  | $$    | $$$$$$$$
| $$  | $$| $$        | $$ /$$| $$ | $$ | $$  | $$ /$$| $$_____/
| $$  | $$|  $$$$$$$  |  $$$$/| $$ | $$ | $$  |  $$$$/|  $$$$$$$
|__/  |__/ \_______/   \___/  |__/ |__/ |__/   \___/   \_______*/

//Actions
class Action {
    static get NONE() { return 'none'; }
    static get DECOR() { return 'decor'; }
}

//Cursor
class Cursor {

    //Info
    static #pos = new Vec2();
    static #down = false;
    static #pressed = false;
    static #released = false;

    static get pos() { return this.#pos; }
    static get down() { return this.#down; }
    static get pressed() { return this.#pressed; }
    static get released() { return this.#released; }

    //Functions
    static update() {
        //Update pressed/released
        this.#pressed = false;
        this.#released = false;
    }

    static setPos(pos) {
        this.#pos = pos;
    }

    static setDown(down) {
        //Pressed
        if (down && !this.#down) {
            this.#pressed = true;
        }
        //Released
        else if (!down && this.#down) {
            this.#released = true;
        }

        //Set down
        this.#down = down;
    }

}

/*$$$$$              /$$     /$$
 /$$__  $$            | $$    |__/
| $$  \ $$  /$$$$$$$ /$$$$$$   /$$  /$$$$$$  /$$$$$$$   /$$$$$$$
| $$$$$$$$ /$$_____/|_  $$_/  | $$ /$$__  $$| $$__  $$ /$$_____/
| $$__  $$| $$        | $$    | $$| $$  \ $$| $$  \ $$|  $$$$$$
| $$  | $$| $$        | $$ /$$| $$| $$  | $$| $$  | $$ \____  $$
| $$  | $$|  $$$$$$$  |  $$$$/| $$|  $$$$$$/| $$  | $$ /$$$$$$$/
|__/  |__/ \_______/   \___/  |__/ \______/ |__/  |__/|______*/

//Animations
class Animation {

    //Info
    #frames;
    #duration;
    #options;

    //State
    #frameIndex = 0;
    #timer = 0;
    #finished = false;

    get finished() { return this.#finished; }

    //Constructor
    constructor(frames, duration, options = {}) {
        this.#frames = frames;
        this.#duration = duration;
        this.#options = options;
    }

    //Functions
    update() {
        //Finished
        if (this.#finished) return;

        //Update timer
        this.#timer++;

        //Next frame
        if (this.#timer >= this.#duration) {
            //Reset timer
            this.#timer = 0;

            //Next frame
            this.#frameIndex++;

            //Loop
            if (this.#options.loop !== false && this.#frameIndex >= this.#frames.length) {
                this.#frameIndex = 0;
            }
            //Finished
            else if (this.#frameIndex >= this.#frames.length) {
                this.#finished = true;
                this.#frameIndex = this.#frames.length - 1;
            }
        }
    }

    getFrame() {
        //Get current frame
        const frame = this.#frames[this.#frameIndex];

        //Flip
        if (this.#options.flip) {
            return [frame[0], frame[1] * -1];
        }

        //Return frame
        return frame;
    }

    reset() {
        this.#frameIndex = 0;
        this.#timer = 0;
        this.#finished = false;
    }

}

//Game objects
class GameObject {

    //Object info
    #name = '';
    #image;
    #pos = new Vec2();
    #size = new Vec2(16);
    #active = true;
    #speed = 40 / Game.fps; //40 pixels per second

    //Animation
    #animations = {};
    #currentAnimation;
    #spriteSheetOffset = new Vec2();

    get name() { return this.#name; }
    get image() { return this.#image; }
    get pos() { return this.#pos; }
    get size() { return this.#size; }
    get active() { return this.#active; }
    get speed() { return this.#speed; }
    get spriteSheetOffset() { return this.#spriteSheetOffset; }

    set pos(pos) { this.#pos = pos; }
    set active(active) { this.#active = active; }

    //Constructor
    constructor(config = {}) {
        //Config
        if (typeof config.name === 'string') this.#name = config.name;
        if (typeof config.image === 'string') this.#image = config.image;
        if (config.pos instanceof Vec2) this.#pos = config.pos;
        if (config.size instanceof Vec2) this.#size = config.size;
        if (typeof config.speed === 'number') this.#speed = config.speed;
        if (config.spriteSheetOffset instanceof Vec2) this.#spriteSheetOffset = config.spriteSheetOffset;

        //Animations
        if (typeof config.animations === 'object') {
            this.#animations = config.animations;
        }

        //Add to objects list
        Game.objects.push(this);
    }

    //Update
    update() {
        //Update animation
        if (this.#currentAnimation) {
            this.#currentAnimation.update();
        }
    }

    //Draw
    draw(ctx, options = {}) {
        //Not active
        if (!this.#active) return;

        //No image
        if (!this.#image) return;

        //Get image
        const img = Game.images[this.#image];
        if (!img) return;

        //Animation frame
        let spriteOffset = new Vec2();
        if (this.#currentAnimation) {
            const frame = this.#currentAnimation.getFrame();
            spriteOffset = new Vec2(frame[0] * this.#size.x, frame[1] * this.#size.y);
        }

        //Draw
        ctx.drawImage(
            img,
            this.#spriteSheetOffset.x + spriteOffset.x,
            this.#spriteSheetOffset.y + spriteOffset.y,
            this.#size.x,
            this.#size.y,
            this.#pos.x - this.#size.x / 2,
            this.#pos.y - this.#size.y / 2,
            this.#size.x,
            this.#size.y
        );
    }

    //Animation
    animate(animation) {
        //Same animation
        if (this.#currentAnimation && this.#animations[animation] === this.#currentAnimation) return;

        //Set animation
        this.#currentAnimation = this.#animations[animation];
        if (this.#currentAnimation) {
            this.#currentAnimation.reset();
        }
    }

    //Movement
    moveTo(pos) {
        this.#pos = pos;
    }

    //Respawn
    respawn() {
        //Random position
        this.#pos = new Vec2(
            Util.randomInclusive(Game.windowSizeScaled.x - this.#size.x) + this.#size.x / 2,
            Util.randomInclusive(Game.windowSizeScaled.y - this.#size.y) + this.#size.y / 2
        );
    }

    //Random point
    get randomPoint() {
        return new Vec2(
            Util.randomInclusive(Game.windowSizeScaled.x - this.#size.x) + this.#size.x / 2,
            Util.randomInclusive(Game.windowSizeScaled.y - this.#size.y) + this.#size.y / 2
        );
    }

    //Remove
    remove() {
        //Remove from objects list
        Game.objects.removeItem(this);
    }

}

//Ball object
class Ball extends GameObject {

    //Constructor
    constructor() {
        super({
            name: 'Ball',
            image: 'sprites/ui/ball.png',
            size: new Vec2(16),
            speed: 80 / Game.fps
        });
    }

    //Update
    update() {
        //Call parent
        super.update();

        //Move towards cursor
        if (Cursor.down) {
            //Get direction to cursor
            const dir = Cursor.pos.sub(this.pos).normalize();

            //Move
            this.pos = this.pos.add(dir.mult(this.speed));
        }
    }

}

/*$$$$$$$                     /$$
| $$_____/                    |__/
| $$       /$$$$$$$   /$$$$$$  /$$ /$$$$$$$   /$$$$$$
| $$$$$   | $$__  $$ /$$__  $$| $$| $$__  $$ /$$__  $$
| $$__/   | $$  \ $$| $$  \ $$| $$| $$  \ $$| $$$$$$$$
| $$      | $$  | $$| $$  | $$| $$| $$  | $$| $$_____/
/*...*/

class Game {

    //Info
    static fps = 60;
    static frames = 0;
    static #animationFrame;

    //Objects
    static objects = [];
    static pets = [];
    static monsters = [];
    static #ball;

    static get ball() { return this.#ball; }

    //Images
    static images = {};
    static moodImage;

    //Canvas
    static #canvas;
    static #canvasBuffer = document.createElement('canvas');    //Double buffer rendering (to prevent flickers after resizing the screen)
    static #canvasAlphaTest = document.createElement('canvas'); //Used to check for clicks in transparent pixels
    static #context;
    static #contextBuffer;
    static #contextAlphaTest;

    static get canvas() { return this.#canvas; }
    static get canvasBuffer() { return this.#canvasBuffer; }
    static get canvasAlphaTest() { return this.#canvasAlphaTest; }
    static get context() { return this.#context; }
    static get contextBuffer() { return this.#contextBuffer; }
    static get contextAlphaTest() { return this.#contextAlphaTest; }

    //Window
    static #scale = 2;
    static #windowSize = new Vec2(window.innerWidth, window.innerHeight);
    static #windowSizeScaled = new Vec2(window.innerWidth / 2, window.innerHeight / 2);

    static get scale() { return this.#scale; }
    static get windowSize() { return this.#windowSize; }
    static get windowSizeScaled() { return this.#windowSizeScaled; }

    static setScale = (scale) => {
        //Invalid value
        if (typeof scale !== 'number') return;

        //Update scale
        this.#scale = scale;
        this.onResize();
    }

    static onResize = () => {
        //Update game window size
        this.#windowSize = new Vec2(window.innerWidth, window.innerHeight);
        this.#windowSizeScaled = this.windowSize.div(this.scale);

        //Update buffer canvas size
        this.canvasBuffer.width = this.windowSize.x;
        this.canvasBuffer.height = this.windowSize.y;
    }

    //Actions
    static #action = Action.NONE;

    static get action() { return this.#action; }

    static setAction = (action) => {
        this.#action = action;
    }

    static isAction = (action) => {
        return this.#action === action;
    }

    //Sorting
    static sortObjects = () => {
        //Sort by Y position
        this.objects.sort((a, b) => a.pos.y - b.pos.y);
    }

    //Drawing
    static draw = () => {
        //Clear canvas
        this.contextBuffer.clearRect(0, 0, this.canvasBuffer.width, this.canvasBuffer.height);

        //Sort objects
        this.sortObjects();

        //Check if in decor mode
        const inDecorMode = this.isAction(Action.DECOR);

        //Draw objects
        for (const obj of this.objects) {
            //Not active
            if (!obj.active) continue;

            //Draw
            obj.draw(this.contextBuffer);
        }

        //Draw to main canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.drawImage(this.canvasBuffer, 0, 0);
    }

    //Update
    static update = () => {
        //Update frames
        this.frames++;

        //Update cursor
        Cursor.update();

        //Update objects
        for (const obj of this.objects) {
            obj.update();
        }
    }

    //Game loop
    static gameLoop = () => {
        //Update
        this.update();

        //Draw
        this.draw();

        //Next frame
        this.#animationFrame = requestAnimationFrame(this.gameLoop);
    }

    //Start
    static start = (canvas) => {
        //Set canvas
        this.#canvas = canvas;

        //Init canvas contexts
        this.#context = this.canvas.getContext('2d');
        this.#contextBuffer = this.canvasBuffer.getContext('2d', { willReadFrequently: true });
        this.#contextAlphaTest = this.canvasAlphaTest.getContext('2d', { willReadFrequently: true });

        //Create ball
        this.#ball = new Ball();

        //Start game loop
        cancelAnimationFrame(this.#animationFrame);
        this.#animationFrame = requestAnimationFrame(this.gameLoop);
    }

}