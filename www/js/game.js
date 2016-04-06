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

}

var cat;
var ennemies;
var heading = null;
var acceleration = null;
var map = null;
var max_stars = 3;
var nb_rows = Math.round(width / 50) - 1;
var timer_enemy = 0;
var interval_enemy = 2;
var enemies = null;
var game_speed = 250;
var life = 10;
var timer_until_shield = 0;
var shield = false;
var cat_group;
var score = 0;
var end_game = false;

function print_life(life) {
    $("#life").html("life: " + life);
}
function print_score(score) {
    $("#score").html("score: " + score);
}
print_life(life);
print_score(score);

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    bg = game.add.tileSprite(0, 0, width, 1000000, 'bg');
    game.world.setBounds(0, 0, width, 1000000);
    game.stage.backgroundColor = '#2d2d2d';

    cat = game.add.sprite(width / 2 + 50, 999800, 'cat');
    cat_group = game.add.group();
    cat_group.add(cat);

    game.physics.arcade.enable(cat);
    enemies = game.add.physicsGroup();
    game.camera.follow(cat, Phaser.Camera.FOLLOW_LOCKON);
    game.camera.y += 200;
    style = 'STYLE_LOCKON';

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

    game.input.onDown.add(activate_shield, this);
    game.time.events.add(Phaser.Timer.SECOND * 60, increase_game_speed, this);
    game.time.events.add(Phaser.Timer.SECOND * 20, add_enemies, this);
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
    // object1, object2, collideCallback, processCallback, callbackContext
    game.physics.arcade.collide(cat, enemies, collisionHandler, null, this);
    if (this.game.time.totalElapsedSeconds() >= timer_enemy) {
        var nb = getRandomIntInclusive(1, max_stars);
        var row = getRandomIntInclusive(0, nb_rows);
        var pos_x = row * 50;
        // var g = game.add.group();
        for (var i = 0; i < nb; i++) {
            // enemies.create(pos_x, cat.y - height - (i * 100), 'star');
            var star = game.add.sprite(pos_x, cat.y - height - (i * 100), 'star');
            game.time.events.add(Phaser.Timer.SECOND * (height / game_speed) * 4, destroy, star);
            // game.physics.enable(star, Phaser.Physics.ARCADE);
            // star.body.immovable = true;
            // g.add(star);
            enemies.add(star);
        }
        timer_enemy = this.game.time.totalElapsedSeconds() + interval_enemy;
        // enemies.add(g);
    }
    navigator.compass.getCurrentHeading(compassSuccess, compassError);
    navigator.accelerometer.getCurrentAcceleration(accelerometerSuccess, accelerometerError);
    moveCat();
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
            exp = game.add.sprite(cat.x + 25, cat.y + 35, 'explosion');
            exp.animations.add('explode');
            exp.animations.play('explode', 10, false, true);
            end_game = true;
            game.physics.arcade.enable(exp);
            // cat_group.setAll('body.velocity.y', 0);
            // cat_group.setAll('body.velocity.x', 0);
            exp.anchor.setTo(0.5, 0.5);
            cat_group.add(exp);
            cat.visible = false;
            // cat.destroy();
        }
    } else {
        score++;
        print_score(score);
    }
}

function render() {

    // game.debug.body(cat);
    // game.debug.body(enemies);
    // game.debug.text('Elapsed seconds: ' + this.game.time.totalElapsedSeconds(), 32, 32);

}

function particleBurst(emitter, obj) {

    emitter.x = obj.x + 25;
    emitter.y = obj.y + 25;

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
        timer_until_shield = this.game.time.totalElapsedSeconds() + 10;
        game.time.events.add(5000, destroyShield, s);
        shield = true;
    }
}

function destroyShield () {
    this.destroy();
    shield = false;
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
    $(".debug #true").html("heading: " + data);
}

function accelerometerSuccess (data) {
    acceleration = data;
    // $(".debug #x").html("x = " + data.x);
    // $(".debug #y").html("y = " + data.y);
    // $(".debug #z").html("z = " + data.z);
}

function accelerometerError (data) {
    $(".debug #x").html("x = " + data);
    $(".debug #y").html("y = " + data);
    $(".debug #z").html("z = " + data);
}