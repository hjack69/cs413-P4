/**
 * Created by jack on 5/30/16.
 */

const HUD_WIDTH = 600;
const HUD_HEIGHT = 600;
const WIDTH = 400;
const HEIGHT = 400;
const BGCOLOR = 0x373737;
const FPS = 60;
const MAX_MAP = 30;
const TILE_SIZE = 32;
const SCALE = 2;

const RIGHT_BTNS = [39, 68];
const LEFT_BTNS = [37, 65];
const UP_BTNS = [38, 87];
const DOWN_BTNS = [40, 83];
const MUTE_BTN = 77;

var rightPress = false;
var leftPress = false;
var upPress = false;
var downPress = false;
var firePress = false;

var coins = 0;
var kiaRects = 0;
var hearts = 3;
var ammo = 0;

function randint(min, max) { return Math.floor(Math.random() * (max-min)) + min; }

PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

var gameport = document.getElementById("gameport");
var renderer = new PIXI.autoDetectRenderer(HUD_WIDTH, HUD_HEIGHT, {backgroundColor: BGCOLOR});
gameport.appendChild(renderer.view);

var stage = new PIXI.Container();

var loadingScreen = new PIXI.Container();
var loadingText = new PIXI.Text('LOADING...', {fill:0xffffff, align: "center"});
loadingText.anchor.set(0.5, 0.5);
loadingText.position.set(WIDTH/2, HEIGHT/2);
loadingScreen.addChild(loadingText);
stage.addChild(loadingScreen);

var welcomeScreen = new PIXI.Container();
welcomeScreen.visible = false;
welcomeScreen.width = WIDTH;
welcomeScreen.height = HEIGHT;
welcomeScreen.position.set(HUD_WIDTH/2-WIDTH/2, HUD_HEIGHT/2-HEIGHT/2);
stage.addChild(welcomeScreen);
var welcomeText = new PIXI.Text("Triangly's Revenge", {fill: 0xffffff, align: 'center', font: 'bold 60px Helvetica'});
welcomeScreen.addChild(welcomeText);
welcomeText.anchor.set(0.5, 0.5);
welcomeText.position.set(WIDTH/2, 50);
var playButton = new PIXI.Text("PLAY", {fill: 0xffffff, align: "center", font: 'bold 30px Helvetica'});
welcomeScreen.addChild(playButton);
playButton.anchor.set(0.5, 0.5);
playButton.position.set(WIDTH/2, HEIGHT/2+100);
playButton.interactive = true;
playButton.mouseover = function() {playButton.setStyle({font: 'bold 40px Helvetica', align: 'center', fill: 0xffffff})};
playButton.mouseout = function() {playButton.setStyle({font:'bold 30px Helvetica', align: 'center', fill: 0xffffff})};
var howToPlayButton = new PIXI.Text("HOW TO PLAY", {fill: 0xffffff, align: "center", font: 'bold 30px Helvetica'});
welcomeScreen.addChild(howToPlayButton);
howToPlayButton.anchor.set(0.5, 0.5);
howToPlayButton.position.set(WIDTH/2, HEIGHT/2+150);
howToPlayButton.interactive = true;
howToPlayButton.mouseover = function() {howToPlayButton.setStyle({font: 'bold 40px Helvetica', align: 'center', fill: 0xffffff})};
howToPlayButton.mouseout = function() {howToPlayButton.setStyle({font:'bold 30px Helvetica', align: 'center', fill: 0xffffff})};

var mapContainer = new PIXI.Container();
var gameScreen = new PIXI.Container();
gameScreen.addChild(mapContainer);
gameScreen.width = WIDTH;
gameScreen.height = HEIGHT;
gameScreen.scale.set(SCALE, SCALE);
var HUDScreen = new PIXI.Container();
HUDScreen.addChild(gameScreen);
HUDScreen.width = HUD_WIDTH;
HUDScreen.height = HUD_HEIGHT;
gameScreen.position.set(HUD_WIDTH/2-WIDTH/2, HUD_HEIGHT/2-WIDTH/2);
var hudBG = new PIXI.Sprite.fromImage('HUDBG.png');
HUDScreen.addChild(hudBG);
stage.addChild(HUDScreen);
HUDScreen.position.set(0, 0);
HUDScreen.transparent = false;
HUDScreen.backgroundColor = BGCOLOR;

function hideAll() {
    loadingScreen.visible = false;
    welcomeScreen.visible = false;
    HUDScreen.visible = false;
}

var screen = StateMachine.create({
    initial: {state: 'loadingScreen', event: 'init'},
    error: function() {},
    events: [
        {name: 'game', from: 'welcomeScreen', to: 'gameScreen'},
        {name: 'game', from: 'loseScreen', to: 'gameScreen'},
        {name: 'game', from: 'instructionsScreen', to: 'gameScreen'},

        {name: 'welcome', from: 'loadingScreen', to: 'welcomeScreen'},
        {name: 'welcome', from: 'instructionsScreen', to: 'welcomeScreen'},
        {name: 'welcome', from: 'loseScreen', to: 'welcomeScreen'},

        {name: 'pause', from: 'gameScreen', to: 'pauseScreen'},

        {name: 'lose', from: 'gameScreen', to: 'loseScreen'},

        {name: 'instructions', from: 'welcomeScreen', to: 'instructionsScreen'},
        {name: 'instructions', from: 'pauseScreen', to: 'instructionsScreen'}
    ],
    callbacks: {
        onloadingScreen: function() {loadingScreen.visible = true;},
        ongameScreen: function() {HUDScreen.visible = true; gameScreen.visible = true;},
        onwelcomeScreen: function() {
            welcomeScreen.alpha = 0;
            welcomeScreen.visible = true;
            createjs.Tween.get(welcomeScreen).to({alpha: 1}, 2500);
        },
        onpauseScreen: function () {},
        onloseScreen: function() {},
        oninstructionsScreen: function() {},
        onbeforeevent: hideAll
    }
});

playButton.on('mousedown', function() {screen.game();});
howToPlayButton.on('mousedown', function() {screen.instructions();});

var tiles = ['floor', 'wall1', 'wall2'];
var map;
var map_width;
var map_height;

function emptyRow() {
    var out = [];
    for (var i = 0; i < map_width*2+1; i++) {
        out.push(1);
    }
    return out;
}

function generateMap() {
    map_width = randint(10, MAX_MAP);
    map_height = randint(10, MAX_MAP);
    map = [];
    for (var i = 0; i < map_height; i++) {
        var run = [];
        map.push(emptyRow());
        map.push(emptyRow());
        for (var j = 0; j < map_width; j++) {
            run.push([i, j]);
            map[i*2+1][j*2+1] = 0;
            if ((i == 0 || randint(0, 2)) && j < map_width-1) {
                map[i*2+1][j*2+2] = 0;
            }
            else if (i > 0) {
                var pick = run[randint(0, run.length)];
                map[pick[0]*2][pick[1]*2+1] = 0;
                run = [];
            }
        }
    }
    map.push(emptyRow());
    var numSpaces = randint(2, 5);
    for (var r=0; r < numSpaces; r++) {
        var spaceWidth = randint(3, 10);
        var spaceHeight = randint(3, 10);
        var position = [randint(1, map.length-1), randint(1, map[0].length-1)];
        for (i = 0; i < spaceHeight && position[1]+i < map.length-1; i++) {
            for (j = 0; j < spaceWidth && position[0]+j < map[0].length-1; j++) {
                map[position[1]+i][position[0]+j] = 0;
            }
        }
    }
    for (i = 0; i < map.length-1; i++) {
        for (j = 0; j < map[0].length; j++) {
            if (map[i][j] == 1 && map[i+1][j] == 0) {
                map[i][j] = 2;
            }
        }
    }
    mapContainer.removeChildren(0, mapContainer.children.length);
    mapContainer.width = TILE_SIZE*map_width;
    mapContainer.height = TILE_SIZE*map_height;
    for (i=0; i < map.length; i++)  {
        for (j=0; j < map[0].length; j++) {
            var cur_tile = new PIXI.Sprite.fromFrame(tiles[map[i][j]]);
            mapContainer.addChild(cur_tile);
            cur_tile.position.set(j*TILE_SIZE, i*TILE_SIZE);
        }
    }
}

function Hero(master) {
    this.master = master;
    this.container = new PIXI.Container();
    this.container.width = 32;
    this.container.height = 32;
    this.master.addChild(this.container);
    this.standing = new PIXI.extras.MovieClip.fromFrames([
        'tria still 1', 'tria still 2', 'tria still 3', 'tria still 4', 'tria still 3', 'tria still 2'
    ]);
    this.standing.anchor.set(0.5, 0.5);
    this.standing.position.set(16, 16);
    this.standing.visible = false;
    this.standing.animationSpeed = 0.1;
    this.container.addChild(this.standing);
    this.movingRight = new PIXI.extras.MovieClip.fromFrames([
        "tria right 1", "tria right 2"
    ]);
    this.movingRight.anchor.set(0.5, 0.5);
    this.movingRight.position.set(16, 16);
    this.movingRight.visible = false;
    this.movingRight.animationSpeed = 0.1;
    this.container.addChild(this.movingRight);
    this.movingLeft = new PIXI.extras.MovieClip.fromFrames([
        "tria left 1", "tria left 2"
    ]);
    this.movingLeft.anchor.set(0.5, 0.5);
    this.movingLeft.position.set(16, 16);
    this.movingLeft.visible = false;
    this.movingLeft.animationSpeed = 0.1;
    this.container.addChild(this.movingLeft);
    this.movingDown = new PIXI.extras.MovieClip.fromFrames([
        "tria down 1", 'tria down 2'
    ]);
    this.movingDown.anchor.set(0.5, 0.5);
    this.movingDown.position.set(16, 16);
    this.movingDown.visible = false;
    this.movingDown.animationSpeed = 0.1;
    this.container.addChild(this.movingDown);
    this.movingUp = new PIXI.extras.MovieClip.fromFrames([
        "tria up 1", 'tria up 2'
    ]);
    this.movingUp.anchor.set(0.5, 0.5);
    this.movingUp.position.set(16, 16);
    this.movingUp.visible = false;
    this.movingUp.animationSpeed = 0.1;
    this.container.addChild(this.movingUp);
    this.animations = [this.standing, this.movingRight, this.movingLeft, this.movingDown, this.movingUp];

    var self = this;
    this.canMove = true;

    this.move = function(direction) {
        if (this.canMove) {
            var newDest = new PIXI.Point(this.container.x, this.container.y);
            for (var i = 0; i < this.animations.length; i++) {
                this.animations[i].visible = false;
                this.animations[i].stop();
            }
            if (direction == "standing") {
                this.standing.visible = true;
                this.standing.play();
            }
            else if (direction == "right") {
                this.movingRight.visible = true;
                this.movingRight.play();
                newDest.x += 32;
            }
            else if (direction == "left") {
                this.movingLeft.visible = true;
                this.movingLeft.play();
                newDest.x -= 32;
            }
            else if (direction == "up") {
                this.movingUp.visible = true;
                this.movingUp.play();
                newDest.y -= 32;
            }
            else if (direction == "down") {
                this.movingDown.visible = true;
                this.movingDown.play();
                newDest.y += 32;
            }
            if (map[Math.floor(newDest.y/32)][Math.floor(newDest.x/32)] == 0) {
                this.canMove = false;
                var self = this;
                createjs.Tween.get(this.container).to({x: newDest.x, y: newDest.y}, 200).call(function () {
                    self.canMove = true;
                    self.x = self.container.x+8;
                    self.y = self.container.y+8;
                });
            }
        }
    };

    this.spawn = function() {
        var newX = randint(1, map_width) * TILE_SIZE;
        var newY = randint(1, map_height) * TILE_SIZE;
        while (map[newY/TILE_SIZE][newX/TILE_SIZE] > 0) {
            newX = randint(1, map_width) * TILE_SIZE;
            newY = randint(1, map_height) * TILE_SIZE;
        }
        console.log(""+newX+", "+newY);
        this.canMove = false;
        var self = this;
        createjs.Tween.get(this.container).to({x: newX, y: newY}, 500).call(function () {
            self.canMove = true;
            self.x = self.container.x+8;
            self.y = self.container.y+8;
        })
    };
    this.spawn();
}

PIXI.loader
    .add('tiles.json')
    .load(ready);

var hero;

function ready() {
    generateMap();
    var triangly = new PIXI.extras.MovieClip.fromFrames([
        'tria still 1', 'tria still 2', 'tria still 3', 'tria still 4', 'tria still 3', 'tria still 2'
    ]);
    welcomeScreen.addChild(triangly);
    triangly.scale.set(2, 2);
    triangly.animationSpeed = .2;
    triangly.play();
    triangly.anchor.set(0.5, 0.5);
    triangly.position.set(WIDTH/2, HEIGHT/2);
    var rectangly = new PIXI.extras.MovieClip.fromFrames([
        'rect still 1', 'rect still 2', 'rect still 3', 'rect still 4', 'rect still 3', 'rect still 2'
    ]);
    welcomeScreen.addChild(rectangly);
    rectangly.scale.set(2, 2);
    rectangly.animationSpeed = .2;
    rectangly.play();
    rectangly.anchor.set(0.5, 0.5);
    rectangly.position.set(WIDTH/2+100, HEIGHT/2);
    var circly = new PIXI.extras.MovieClip.fromFrames([
        'circ still 1', 'circ still 2', 'circ still 3', 'circ still 4', 'circ still 3', 'circ still 2'
    ]);
    welcomeScreen.addChild(circly);
    circly.scale.set(2, 2);
    circly.animationSpeed = 0.2;
    circly.play();
    circly.anchor.set(0.5, 0.5);
    circly.position.set(WIDTH/2-100, HEIGHT/2);

    hero = new Hero(mapContainer);
    //hero.container.position.set(32, 32);

    screen.welcome();
}
function keydown(e) {
    e.preventDefault();
    if (RIGHT_BTNS.indexOf(e.keyCode) > -1) rightPress = true;
    else if (LEFT_BTNS.indexOf(e.keyCode) > -1) leftPress = true;
    else if (UP_BTNS.indexOf(e.keyCode) > -1) upPress = true;
    else if (DOWN_BTNS.indexOf(e.keyCode) > -1) downPress = true;
    //else if (e.keyCode == MUTE_BTN) {
    //    muted = !muted;
    //    if (muted) {
    //        bgAudio.stop();
    //    }
    //    else {
    //        bgAudio.play();
    //    }
    //}
}

function keyup(e) {
    e.preventDefault();
    if (RIGHT_BTNS.indexOf(e.keyCode) > -1) rightPress = false;
    else if (LEFT_BTNS.indexOf(e.keyCode) > -1) leftPress = false;
    else if (UP_BTNS.indexOf(e.keyCode) > -1) upPress = false;
    else if (DOWN_BTNS.indexOf(e.keyCode) > -1) downPress = false;
}

window.addEventListener("keydown", keydown);
window.addEventListener("keyup", keyup);

function adjustCamera() {
    mapContainer.x = -hero.container.x+WIDTH/(2*SCALE)-TILE_SIZE/2;
    mapContainer.y = -hero.container.y+HEIGHT/(2*SCALE)-TILE_SIZE/2;
    mapContainer.x = Math.min(Math.max(mapContainer.x, -mapContainer.width + WIDTH/2), 0);
    mapContainer.y = Math.min(Math.max(mapContainer.y, -mapContainer.height + HEIGHT/2), 0);
}

function animate() {
    setTimeout(function() {requestAnimationFrame(animate);}, 1000/FPS);
    if (screen.current == 'gameScreen') {
        adjustCamera();
        if (rightPress) hero.move('right');
        if (leftPress) hero.move('left');
        if (downPress) hero.move('down');
        if (upPress) hero.move('up');
        if (upPress == downPress && leftPress == rightPress) {
            hero.move('standing');
        }
    }
    renderer.render(stage);
}

animate();