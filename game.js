/**
 * Created by jack on 5/30/16.
 */

const WIDTH = 400;
const HEIGHT = 400;
const BGCOLOR = 0;
const MAX_MAP = 30;

function randint(min, max) { return Math.floor(Math.random() * (max-min)) + min; }

PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

var gameport = document.getElementById("gameport");
var renderer = new PIXI.autoDetectRenderer(WIDTH, HEIGHT, {backgroundColor: BGCOLOR});
gameport.appendChild(renderer.view);

var stage = new PIXI.Container();

var tiles;
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
    map_width = randint(10, 30);
    map_height = randint(10, 30);
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
}

generateMap();