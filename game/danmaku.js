'use strict';

class Title extends Actor {
	constructor(x, y) {
		const hitArea = new Rectangle(0,0,0,0);
		super(x,y,hitArea);
	}

	render(target) {
		const context = target.getContext('2d');
		context.font = '25px sans-serif';
		context.fillStyle = 'white';
		context.fillText('弾幕STG', this.x, this.y);
	}
}

class Bullet extends SpriteActor {
	constructor(x,y) {
		const sprite = new Sprite(assets.get('sprite'), new Rectangle(0,16,16,16));
		const hitArea = new Rectangle(4,0,8,16);
		super(x,y,sprite, hitArea,['playerBullet']);

		this.speed = 6;
	}

	update(gameInfo, input) {
		this.y -= this.speed;
		if(this.isOutOfBounds(gameInfo.screenRectangle)) {
			this.destroy();
		}
	}
}

class Fighter extends SpriteActor {
	constructor(x,y) {
		const sprite = new Sprite(assets.get('sprite'), new Rectangle(0,0,16,16));
		const hitArea = new Rectangle(8,8,2,2);
		super(x,y,sprite,hitArea);

		this._interval = 5;
		this._timeCount = 0;
		this.speed = 2;
		this._velocityX = 0;
		this._velocityY = 0;
	}

	update(gameInfo, input) {
		// キーを押されたら移動する
		this._velocityX = 0;
		this._velocityY = 0;

		if(input.getKey('ArrowUp')) {this.y -= this.speed;}
		if(input.getKey('ArrowDown')) { this.y += this.speed;}
		if(input.getKey('ArrowRight')){this.x += this.speed;}
		if(input.getKey('ArrowLeft')){this.x -= this.speed;}

		const boundWidth = gameInfo.screenRectangle.width - this.width;
		const boudnHeight = gameInfo.screenRectangle.boudnHeight - this.height;
		const bound = new Rectangle(this.width, this.height, boundWidth, boudnHeight);
		
		this.x += this._velocityX;
        this.y += this._velocityY;

		// 画面買いに行ってしまったら押し戻す
		if(this.isOutOfBounds(bound)) {
            this.x -= this._velocityX;
            this.y -= this._velocityY;
        }

		// スペースキーで弾を打つ
        this._timeCount++;
        const isFireReady = this._timeCount > this._interval;
        if(isFireReady && input.getKey(' ')) {
            const bullet = new Bullet(this.x, this.y);
            this.spawnActor(bullet);
            this._timeCount = 0;
        }
	}
}

class DanmakuStgMainScene extends Scene {
	constructor(renderingTarget) {
		super('メイン', 'black', renderingTarget);
		const fighter = new Fighter(150, 300);
		this.add(fighter);
	}
}

class DanmakuStgTitleScene extends Scene {
	constructor(renderingTarget) {
		super('タイトル', 'black', renderingTarget);
		const title = new Title(100, 200);
		this.add(title);
	}

	update(gameInfo, input) {
		super.update(gameInfo, input);
		if(input.getKeyDown(' ')) {
			const mainScene = new DanmakuStgMainScene(this.renderingTarget);
			this.changeScene(mainScene);
		}
	}
}

class DanmakuStgGame extends Game {
	constructor() {
		super('弾幕STG', 300, 400, 60);
		const titleScene = new DanmakuStgTitleScene(this.screenCanvas);
		this.changeScene(titleScene);
	}
}

assets.addImage('sprite', 'asset/sprite.png');
assets.loadAll().then((a) => {
	const game = new DanmakuStgGame();
	document.body.appendChild(game.screenCanvas);
	game.start();
})