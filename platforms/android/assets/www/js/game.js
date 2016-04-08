function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min +1)) + min;
}
var width = $(window).width();
var height = $(window).height();

var game = new Phaser.Game(width, height, Phaser.CANVAS, 'Eco Cat', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.spritesheet('cat', 'img/nyan-cat.png', 100, 70, 6);
    game.load.spritesheet('explosion', 'img/explosion.png', 200, 190, 5);
    game.load.image('star', 'img/star-small.png');
    game.load.image('bg', 'img/stars.png');
    game.load.image('flower', 'img/flower.png');
    game.load.image('shield', 'img/shield.png');

/*    $("#score").css({
        position: "absolute",
        top: (height - 60) + "px",
    });*/
}

var cat = null;
var heading = null;
var acceleration = null;
var max_stars;
var nb_rows = Math.round(width / 50) - 1;
var timer_enemy;
var interval_enemy;
var enemies = null;
var game_speed;
var life;
var timer_until_shield
var shield;
var cat_group = null;
var score;
var end_game;
var last_time_score;
var combo;

var duration_wo_shield;
var duration_shield;
var bar;
var next_acc_check;

function init_vars() {
    max_stars = 3;
    timer_enemy = 0;
    interval_enemy = 2;
    game_speed = 250;
    life = 10;
    timer_until_shield = 0;
    shield = false;
    score = 0;
    end_game = false;
    last_time_score = 0;
    combo = 0;
    duration_wo_shield = 10;
    duration_shield = 5;
    bar = 100;
    next_acc_check = 0;
}

init_vars();

function create_env() {
    cat = game.add.sprite(width / 2 + 50, 999800, 'cat');
    cat_group = game.add.group();
    cat_group.add(cat);
    game.physics.arcade.enable(cat);
    enemies = game.add.physicsGroup();
    game.camera.follow(cat, Phaser.Camera.FOLLOW_LOCKON);
    game.camera.y += 200;

    cat.name = 'cat';
    cat.pivot.x = 35;
    cat.pivot.y = 50;
    cat.anchor.setTo(0.5, 0.5);
    cat.angle -= 90;
    cat.animations.add('move');
    cat.animations.play('move', 10, true, true);
    cat.enableBody = true;
    cat.body.collideWorldBounds = true;
    cat.body.immovable = true;
    cat.body.setSize(55, 80, -5, 0);

    print_life(life);
    print_score(score);
}

$("#reset").on("click", reset);


function print_life(life) {
    var elmt = "";
    for (var i = 0; i < life; i++) {
        elmt += "<img src='img/heart.png'>"
    }
    $("#life").html(elmt);
}
function print_score(score) {
    $("#score").html(score);
}
function print_combo(combo) {
    $("#score").append("+" + combo);
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    bg = game.add.tileSprite(0, 0, width, 1000000, 'bg');
    game.world.setBounds(0, 0, width, 1000000);
    game.stage.backgroundColor = '#2d2d2d';
    game.input.onDown.add(activate_shield, this);
    game.time.events.add(Phaser.Timer.SECOND * 60, increase_game_speed, this);
    game.time.events.add(Phaser.Timer.SECOND * 20, add_enemies, this);

    create_env();
}

function increase_game_speed () {
    game_speed += 50;
    game.time.events.add(Phaser.Timer.SECOND * 60, increase_game_speed, this);
}

function add_enemies () {
    max_stars += 1;
    interval_enemy -= 0.1;
    game.time.events.add(Phaser.Timer.SECOND * 20, add_enemies, this);
}

function update() {
    if (end_game) {
        cat.destroy();
        return;
    }
    var cur_time = this.game.time.totalElapsedSeconds();
    // object1, object2, collideCallback, processCallback, callbackContext
    game.physics.arcade.collide(cat, enemies, collisionHandler, null, this);
    if (cur_time >= timer_enemy) {
        var nb = getRandomIntInclusive(1, max_stars);
        var row = getRandomIntInclusive(0, nb_rows);
        var pos_x = row * 50;
        // var g = game.add.group();
        for (var i = 0; i < nb; i++) {
            // enemies.create(pos_x, cat.y - height - (i * 100), 'star');
            var star = game.add.sprite(pos_x, cat.y - height - (i * 150), 'star');
            game.time.events.add(Phaser.Timer.SECOND * (height / game_speed) * 4, destroy, star);
            // game.physics.enable(star, Phaser.Physics.ARCADE);
            // star.body.immovable = true;
            // g.add(star);
            enemies.add(star);
            star.pivot.x = 35;
            star.pivot.y = 50;
            star.anchor.setTo(0.5, 0.5);
            star.body.angularVelocity = getRandomIntInclusive(-200, 200);
        }
        timer_enemy = cur_time + interval_enemy;
        // enemies.add(g);
    }
    // navigator.compass.getCurrentHeading(compassSuccess, compassError);
    if (cur_time >= next_acc_check + 0.15) {
        next_acc_check = cur_time;
        navigator.accelerometer.getCurrentAcceleration(accelerometerSuccess, accelerometerError);
    }
    moveCat();
    if (cur_time >= last_time_score + 2) {
        score += combo;
        print_score(score);
        combo = 0;
    }
}

function destroy (obj) {
    this.destroy();
}

function collisionHandler (obj1, obj2) {

    var emitter = game.add.emitter(0, 0, 100);

    emitter.makeParticles('flower');
    emitter.gravity = 200;
    particleBurst(emitter, obj2);
    console.log("BOOM");
    obj2.destroy();
    if (!shield) {
        life--;
        print_life(life);
        if (life == 0) {
            exp = game.add.sprite(cat.body.x + 25, cat.body.y + 35, 'explosion');
            exp.animations.add('explode');
            exp.animations.play('explode', 10, false, true);
            end_game = true;
            game.physics.arcade.enable(exp);
            // cat_group.setAll('body.velocity.y', 0);
            // cat_group.setAll('body.velocity.x', 0);
            exp.anchor.setTo(0.5, 0.5);
            cat_group.add(exp);
            cat.visible = false;
            enemies.destroy();
            $("#screen").show();
            $("#menu").hide();
            var scores = JSON.parse(localStorage.getItem("scores"));
            if (scores === null) {
                scores = [];
            }
            scores.push(score);
            scores.sort(compareNumbersDesc);
            localStorage.setItem("scores",JSON.stringify(scores));
            $("#screen ol").html("");
            for (var i = 0; i < scores.length && i < 4; i++) {
                $("#screen ol").append("<li>" + scores[i] + "</li>");
            }
            // cat.destroy();
        }
    } else {
        score++;
        var cur_time = this.game.time.totalElapsedSeconds();
        if (cur_time < last_time_score + 2) {
            combo += Math.round(0.5 * (combo + 1));
        }
        print_score(score);
        if (combo > 0) {
            print_combo(combo);
        }
        last_time_score = cur_time;
    }
}

function compareNumbersDesc(a, b) {
    return b - a;
}

function render() {

    // game.debug.body(cat);
    // game.debug.body(enemies);
    // game.debug.text('Elapsed seconds: ' + this.game.time.totalElapsedSeconds(), 32, 32);

}

function particleBurst(emitter, obj) {

    emitter.x = obj.body.x + 25;
    emitter.y = obj.body.y + 25;

    emitter.start(true, 4000, null, 10);

    //  And 2 seconds later we'll destroy the emitter
    game.time.events.add(2000, destroyEmitter, emitter);

}

function destroyEmitter() {

    this.destroy();

}

function activate_shield () {
    if (this.game.time.totalElapsedSeconds() > timer_until_shield) {
        var s = game.add.sprite(cat.body.x + 25, cat.body.y + 35, 'shield');
        s.anchor.setTo(0.5, 0.5);
        game.physics.arcade.enable(s);
        cat_group.add(s);
        game.time.events.add(duration_shield * 1000, destroyShield, s);
        game.time.events.repeat(Phaser.Timer.SECOND / (10 / duration_shield), 10, reduceBar, this);
        shield = true;
    }
}

function reduceBar() {
    bar -= 10;
    $("#shield .progress-bar").css("width", bar + "%");
}

function increaseBar() {
    bar += 10;
    $("#shield .progress-bar").css("width", bar + "%");
}

function destroyShield () {
    this.destroy();
    shield = false;
    timer_until_shield = game.time.totalElapsedSeconds() + duration_wo_shield;
    game.time.events.repeat(Phaser.Timer.SECOND / (10 / duration_wo_shield), 10, increaseBar, this);
}

function moveCat() {
    if (acceleration) {
        cat_group.setAll('body.velocity.y', (acceleration.z - 5) * -20 - game_speed);
        cat_group.setAll('body.velocity.x', acceleration.x * -20);
    }
}

function compassSuccess (data) {
    heading = data.trueHeading;
    // $(".debug #true").html("heading: " + heading);
}

function compassError (data) {
    // $(".debug #true").html("heading: " + data);
}

function accelerometerSuccess (data) {
    acceleration = data;
    // $(".debug #x").html("x = " + data.x);
    // $(".debug #y").html("y = " + data.y);
    // $(".debug #z").html("z = " + data.z);
}

function accelerometerError (data) {
    // $(".debug #x").html("x = " + data);
    // $(".debug #y").html("y = " + data);
    // $(".debug #z").html("z = " + data);
}

function reset() {
    cat.destroy();
    cat_group.destroy();
    
    init_vars();
    create_env();

    $("#screen").hide();
    $("#menu").show();
}