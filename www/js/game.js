function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min +1)) + min;
}
var width = $(window).width();
var height = $(window).height();

var game = new Phaser.Game(width, height, Phaser.CANVAS, 'Eco Cat', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.spritesheet('cat', 'img/nyan-cat.png', 100, 70, 6);
    game.load.image('star', 'img/star-small.png');
    game.load.image('bg', 'img/stars.png');

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

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    bg = game.add.tileSprite(0, 0, width, 1000000, 'bg');
    game.world.setBounds(0, 0, width, 1000000);
    game.stage.backgroundColor = '#2d2d2d';

    cat = game.add.sprite(width / 2 + 50, 999800, 'cat');

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
    cat.physicsBodyType = Phaser.Physics.ARCADE;
    cat.body.collideWorldBounds = true;
    cat.body.immovable = true;
    cat.body.setSize(55, 80, -5, 0);

}

function update() {

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

    console.log("BOOM");

}

function render() {

    game.debug.body(cat);
    game.debug.body(enemies);
    game.debug.text('Elapsed seconds: ' + this.game.time.totalElapsedSeconds(), 32, 32);

}

function moveCat() {
    if (acceleration) {
        cat.body.velocity.y = (acceleration.z - 5) * -20;
        cat.body.velocity.x = acceleration.x * -20;
    }
    cat.body.velocity.y -= game_speed;
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