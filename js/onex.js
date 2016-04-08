var game = new Phaser.Game(1000, 600, Phaser.AUTO, 'game',
  { preload: preload, create: create, update: update }
);

var background;
var foretop1;
var foretop2;
var forebot1;
var forebot2;

var player;
var bullets;
var enemies;
var cursors;
var bulletTime = 0;
var bullet;

function preload() {

  game.load.crossOrigin = true;
  game.load.image('background', 'assets/back.png');
  game.load.image('foretop', 'assets/foretop2.png');
  game.load.image('forebot1', 'assets/forebot1.png');
  game.load.image('forebot2', 'assets/forebot2.png');
  game.load.spritesheet('player', 'assets/ship2.png', 69, 36, 2);
  game.load.image('bullet', 'assets/bullet.png');
  game.load.spritesheet('enemies', 'assets/enemy1.png', 37, 36, 2);
}

function create() {

  background = game.add.tileSprite(0, 0, game.width, game.height, 'background');
  background.autoScroll(-20, 0);

  foretop = game.add.tileSprite(0, 0, game.width, game.height, 'foretop');
  foretop.autoScroll(-40, 0);

  forebot1 = game.add.tileSprite(0, 0, game.width, game.height, 'forebot1');
  forebot1.autoScroll(-40, 0);

  forebot2 = game.add.tileSprite(0, 0, game.width, game.height, 'forebot2');
  forebot2.autoScroll(-60, 0);

  player = game.add.sprite(60, 300, 'player');
  player.enableBody = true;
  game.physics.arcade.enable(player, Phaser.Physics.ARCADE);
  player.body.collideWorldBounds = true;
  player.animations.add('animate', [0, 1]);
  player.animations.play('animate', 10, true);

  bullets = game.add.group();
  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.ARCADE;
  for (var i = 0; i < 20; i++) {
      var b = bullets.create(0, 0, 'bullet');
      b.name = 'bullet' + i;
      b.exists = false;
      b.visible = false;
      b.checkWorldBounds = true;
      b.events.onOutOfBounds.add(killBullet, this);
  }

  enemies = game.add.group();
  enemies.enableBody = true;
  enemies.physicsBodyType = Phaser.Physics.ARCADE;
  game.add.tween(enemies).to({ x: -(game.width + game.height) }, 6000, Phaser.Easing.Linear.Out, true);
  for (var i = 0; i < 10; i++) {
      var x = game.width + Math.random() * game.height;
      var y = Math.random() * game.height;
      var enemy = enemies.create(x, y > 300 ? y - 20 : y + 20, 'enemies', game.rnd.integerInRange(0, 10));
      enemy.name = 'enemy' + i;
      enemy.animations.add('animate', [0, 1]);
      enemy.animations.play('animate', 10, true);
  }


  cursors = game.input.keyboard.createCursorKeys();

  game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
}

function update() {

  game.physics.arcade.overlap(bullets, enemies, collisionHandler, null, this);
  game.physics.arcade.overlap(player, enemies, collisionHandler2, null, this);

  player.body.velocity.set(0);

  if (cursors.left.isDown) {
    player.body.velocity.x = -250;
  } else if (cursors.right.isDown) {
    player.body.velocity.x = 250;
  }

  if (cursors.up.isDown) {
    player.body.velocity.y = -250;
  } else if (cursors.down.isDown) {
    player.body.velocity.y = 250;
  }

  if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
    fireBullet();
  }

}

function fireBullet() {
    if (game.time.now > bulletTime) {
        bullet = bullets.getFirstExists(false);
        if (bullet){
            bullet.reset(player.x + 50, player.y + 20);
            bullet.body.velocity.x = 300;
            bulletTime = game.time.now + 150;
        }
    }
}

function killBullet(bullet) {
    bullet.kill();
}

function collisionHandler(bullet, enemy) {
    bullet.kill();
    enemy.kill();
}

// var playerHealth = 100;

function collisionHandler2(player, enemy) {
    enemy.kill();
    // playerHealth -= 20;
    // renderHealth();
}

// function renderHealth() {
//   $('healthMeter').style('width', playerHealth * 3);
// }
