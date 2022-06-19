import {
    _decorator,
    Director,
    Component,
    Node,
    Vec2,
    RigidBody2D,
    math,
    view,
    Label,
    SpriteFrame,
    Sprite,
    AudioClip,
    AudioSource
} from 'cc';

const {ccclass, property} = _decorator;

// 返回设备独立像素
export const size: math.Size = view.getVisibleSizeInPixel();

// 游戏状态
export let isPlaying: boolean = false;

// warma 是否出现
export let warmaShow: boolean = false;

@ccclass('main')
export class main extends Component {
    // 节点
    @property(Node)
    readyNode: Node = null;
    @property(Node)
    bjNode: Node = null;
    @property(Node)
    ball: Node = null;
    @property(Node)
    UI: Node = null;
    @property(Node)
    overNode: Node = null;
    // 分数
    @property(Node)
    scoreNode: Node = null;
    @property(Node)
    overScoreNode: Node = null;
    @property(Node)
    addScore: Node = null;
    @property(Node)
    minusScore: Node = null;
    @property(Node)
    ballCountNode: Node = null;
    // 按钮
    @property(Node)
    pauseButton: Node = null;
    @property(Node)
    muteButton: Node = null;
    // 精灵图片
    @property(SpriteFrame)
    pausePic: SpriteFrame = null;
    @property(SpriteFrame)
    playPic: SpriteFrame = null;
    @property(SpriteFrame)
    mutePic: SpriteFrame = null;
    @property(SpriteFrame)
    soundPic: SpriteFrame = null;
    // 音效
    @property([AudioClip])
    audioClip: AudioClip[];
    // 播放声音的组件
    sound: AudioSource;

    // 声音开关
    isMute: boolean = false;

    // 移动向量
    moveBy: Vec2;

    score: number = 0;
    ballCount: number = 2;

    // 创建公共静态对象
    public static instance: main = null;

    start() {
        // 静态对象赋值为当前对象
        main.instance = this;
        this.moveBy = new Vec2();
        // 计算设备像素和项目像素的比值（这里项目设置的是横屏，适配屏幕高，所以计算y轴的比值）
        let ratioY: number = 720 / size.y;
        let ratioX: number = size.x * ratioY / 2;
        // 移动
        this.node.on(Node.EventType.TOUCH_START, (e) => {
            if (Director.instance.isPaused()) return;
            let x = (e.getLocationX() * ratioY - ratioX) - this.ball.position.x;
            let y = (e.getLocationY() * ratioY - 360) - this.ball.position.y;
            this.ball.getComponent(RigidBody2D).linearVelocity = this.moveBy.set(x / 8, y / 8);
            this.ball.getComponent(RigidBody2D).angularVelocity = math.absMax(-x, -y) / 25;
            if (math.absMax(x, y) > 300 || math.absMax(x, y) < -300) this.playAudioClip(3);
        }, this);
        // 获取 AudioSource 组件
        this.sound = this.node.getComponent(AudioSource);
        this.playBGM(0);
    }

    update(deltaTime: number) {
    }

    pressStart() {
        this.readyNode.active = false;
        this.bjNode.active = true;
        this.ball.active = true;
        this.UI.active = true;
        // 部分设备需要用户产生交互后才播放音频，如果不延迟调用会造成和上一个未播放的BGM重叠播放
        this.scheduleOnce(() => {
            this.playBGM(1);
        }, 0.5);
        isPlaying = true;
    }

    pressPause() {
        if (Director.instance.isPaused()) {
            Director.instance.resume();
            this.pauseButton.getComponent(Sprite).spriteFrame = this.pausePic;
            if (!this.isMute && !this.sound.playing) this.sound.play();
        } else {
            this.pauseButton.getComponent(Sprite).spriteFrame = this.playPic;
            if (!this.isMute) this.sound.pause();
            Director.instance.pause();
        }
    }

    pressMute() {
        if (this.isMute) {
            this.sound.play();
            this.isMute = false;
            this.muteButton.getComponent(Sprite).spriteFrame = this.soundPic;
        } else {
            this.sound.pause();
            this.isMute = true;
            this.muteButton.getComponent(Sprite).spriteFrame = this.mutePic;
        }
    }

    playBGM(n: number) {
        this.sound.stop();
        this.sound.clip = this.audioClip[n];
        this.sound.volume = 0.5;
        this.sound.loop = n !== 2;
        if (!this.isMute) this.sound.play();
    }

    playAudioClip(n: number) {
        if (!this.isMute) this.sound.playOneShot(this.audioClip[n], 1);
    }

    gameOver(){
        isPlaying = false;
        warmaShow = false;
        this.bjNode.active = false;
        this.ball.active = false;
        this.UI.active = false;
        this.overNode.active = true;
        this.addScore.setPosition(0, 600);
        this.minusScore.setPosition(0, 600);
        this.overScoreNode.getComponent(Label).string = '你的分数：' + this.score.toString();
        this.playBGM(2);
    }

    pressReady(){
        this.overNode.active = false;
        this.readyNode.active = true;
        this.ballCount = 2;
        this.score = 0;
        this.ball.getComponent(RigidBody2D).linearVelocity = this.moveBy.set(0, 0);
        this.ball.getComponent(RigidBody2D).angularVelocity = 0;
        this.ball.setPosition(0, -53);
        this.ballCountNode.getComponent(Label).string = this.ballCount.toString();
        this.scoreNode.getComponent(Label).string = this.score.toString();
        this.playBGM(0);
    }

    pressRestart(){
        this.gameOver();
        this.pressReady();
        this.scheduleOnce(this.pressStart, 0);
    }

    comeIn(){
        warmaShow = !warmaShow;
    }
}

