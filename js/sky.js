var game = new Phaser.Game(640, 400, Phaser.AUTO, 'game');

    //  Our core Bullet class
    //  This is a simple Sprite object that we set a few properties on
    //  It is fired by all of the Weapon classes

    var Bullet = function(game, key) {

      Phaser.Sprite.call(this, game, 0, 0, key);

      this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;

      this.anchor.set(-2);

      this.checkWorldBounds = true;
      this.outOfBoundsKill = true;
      this.exists = false;

      this.tracking = false;
      this.scaleSpeed = 0;

    };

    Bullet.prototype = Object.create(Phaser.Sprite.prototype);
    Bullet.prototype.constructor = Bullet;

    Bullet.prototype.fire = function(x, y, angle, speed, gx, gy) {

      gx = gx || 0;
      gy = gy || 0;

      this.reset(x, y);
      this.scale.set(1);

      this.game.physics.arcade.velocityFromAngle(angle, speed, this.body.velocity);

      this.angle = angle;

      this.body.gravity.set(gx, gy);

    };

    Bullet.prototype.update = function() {

      if (this.tracking) {
        this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);
      }

      if (this.scaleSpeed > 0) {
        this.scale.x += this.scaleSpeed;
        this.scale.y += this.scaleSpeed;
      }

    };

    var Weapon = {};


    ////////////////////////////////////////////////////
    //  A single bullet is fired in front of the ship //
    ////////////////////////////////////////////////////

    Weapon.SingleBullet = function(game) {

      Phaser.Group.call(this, game, game.world, 'Single Bullet', false, true, Phaser.Physics.ARCADE);

      this.nextFire = 0;
      this.bulletSpeed = 600;
      this.fireRate = 100;

      for (var i = 0; i < 64; i++) {
        this.add(new Bullet(game, 'bullet'), true);
      }

      return this;

    };

    Weapon.SingleBullet.prototype = Object.create(Phaser.Group.prototype);
    Weapon.SingleBullet.prototype.constructor = Weapon.SingleBullet;

    Weapon.SingleBullet.prototype.fire = function(source) {

      if (this.game.time.time < this.nextFire) {
        return;
      }

      var x = source.x + 10;
      var y = source.y + 10;

      this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0);

      this.nextFire = this.game.time.time + this.fireRate;

    };


    // //////////////////////////////////////////////////////
    // //  3-way Fire (directly above, below and in front) //
    // //////////////////////////////////////////////////////

    Weapon.ThreeWay = function(game) {

      Phaser.Group.call(this, game, game.world, 'Three Way', false, true, Phaser.Physics.ARCADE);

      this.nextFire = 0;
      this.bulletSpeed = 600;
      this.fireRate = 100;

      for (var i = 0; i < 96; i++) {
        this.add(new Bullet(game, 'bullet'), true);
      }

      return this;

    };

    Weapon.ThreeWay.prototype = Object.create(Phaser.Group.prototype);
    Weapon.ThreeWay.prototype.constructor = Weapon.ThreeWay;

    Weapon.ThreeWay.prototype.fire = function(source) {

      if (this.game.time.time < this.nextFire) {
        return;
      }

      var x = source.x + 10;
      var y = source.y + 10;

      this.getFirstExists(false).fire(x, y, 270, this.bulletSpeed, 0, 0);
      this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0);
      this.getFirstExists(false).fire(x, y, 90, this.bulletSpeed, 0, 0);

      this.nextFire = this.game.time.time + this.fireRate;

    };

    // /////////////////////////////////////////////
    // //  8-way fire, from all sides of the ship //
    // /////////////////////////////////////////////

    Weapon.EightWay = function(game) {

      Phaser.Group.call(this, game, game.world, 'Eight Way', false, true, Phaser.Physics.ARCADE);

      this.nextFire = 0;
      this.bulletSpeed = 600;
      this.fireRate = 100;

      for (var i = 0; i < 96; i++) {
        this.add(new Bullet(game, 'bullet'), true);
      }

      return this;

    };

    Weapon.EightWay.prototype = Object.create(Phaser.Group.prototype);
    Weapon.EightWay.prototype.constructor = Weapon.EightWay;

    Weapon.EightWay.prototype.fire = function(source) {

      if (this.game.time.time < this.nextFire) {
        return;
      }

      var x = source.x + 16;
      var y = source.y + 10;

      this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0);
      this.getFirstExists(false).fire(x, y, 45, this.bulletSpeed, 0, 0);
      this.getFirstExists(false).fire(x, y, 90, this.bulletSpeed, 0, 0);
      this.getFirstExists(false).fire(x, y, 135, this.bulletSpeed, 0, 0);
      this.getFirstExists(false).fire(x, y, 180, this.bulletSpeed, 0, 0);
      this.getFirstExists(false).fire(x, y, 225, this.bulletSpeed, 0, 0);
      this.getFirstExists(false).fire(x, y, 270, this.bulletSpeed, 0, 0);
      this.getFirstExists(false).fire(x, y, 315, this.bulletSpeed, 0, 0);

      this.nextFire = this.game.time.time + this.fireRate;

    };

    //  The core game loop

    var PhaserGame = function() {

      this.background = null;
      this.foreground = null;

      this.player = null;
      this.enemy = null;
      this.cursors = null;
      this.speed = 300;

      this.weapons = [];
      this.currentWeapon = 1;
      this.weaponName = null;

    };

    PhaserGame.prototype = {

      init: function() {

        this.game.renderer.renderSession.roundPixels = true;

        this.physics.startSystem(Phaser.Physics.ARCADE);

      },

      preload: function() {

        this.load.image('background', 'assets/back.png');
        this.load.image('foreground', 'assets/fore.png');
        this.load.image('player', 'assets/ship.png');
        this.load.image('bullet', 'assets/bullet.png');
        this.load.image('enemy', 'assets/enemy.png');
      },

      create: function() {

        this.background = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');
        this.background.autoScroll(-40, 0);

        this.foreground = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'foreground');
        this.foreground.autoScroll(-60, 0);

        this.currentWeapon = 0;

        this.weapons.push(new Weapon.SingleBullet(this.game));
        // this.weapons.push(new Weapon.ThreeWay(this.game));
        // this.weapons.push(new Weapon.EightWay(this.game));

        this.player = this.add.sprite(64, 200, 'player');
        this.physics.arcade.enable(this.player);
        this.player.body.collideWorldBounds = true;

        this.enemy = this.add.sprite(400, 200, 'enemy')

        this.physics.arcade.enable(this.enemy)
        this.enemy.body.collideWorldBounds = false;

        this.cursors = this.input.keyboard.createCursorKeys();

        this.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
      },

      update: function() {

        this.player.body.velocity.set(0);
        this.enemy.body.velocity.set(0);


        if (this.cursors.left.isDown) {
          this.player.body.velocity.x = -this.speed;
        } else if (this.cursors.right.isDown) {
          this.player.body.velocity.x = this.speed;
        }

        if (this.cursors.up.isDown) {
          this.player.body.velocity.y = -this.speed;
        } else if (this.cursors.down.isDown) {
          this.player.body.velocity.y = this.speed;
        }

        if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
          this.weapons[this.currentWeapon].fire(this.player);
        }

        // game.physics.arcade.overlap(Bullet, enemy, collisionHandler, null, this);

      }

    };

    game.state.add('Game', PhaserGame, true);
