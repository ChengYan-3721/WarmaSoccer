import {
    _decorator,
    Component,
    Sprite,
    SpriteFrame,
    Collider2D,
    PolygonCollider2D,
    Contact2DType,
    RigidBody2D,
    UITransform,
    Vec2,
    Animation,
    CCString,
    CCInteger,
    Label
} from 'cc';
import {main, isPlaying, warmaShow} from 'db://assets/Scripts/main';

const {ccclass, property} = _decorator;

@ccclass('Biology')
export class Biology extends Component {
    @property(SpriteFrame)
    normalPic: SpriteFrame = null;
    @property(SpriteFrame)
    fallPic: SpriteFrame = null;
    // 右移动画名称
    @property(CCString)
    right_anim: string;
    // 左移动画名称
    @property(CCString)
    left_anim: string;
    // 进门得分
    @property(CCInteger)
    myScore: number;

    // 移动方向
    direction: boolean = false;
    nowDirection: boolean = false;
    // 是否出界
    isOut: boolean = false;

    isActivity: boolean = false;

    speed: Vec2;
    collider: PolygonCollider2D;

    start() {
        this.speed = new Vec2(0, 0);
        this.collider = this.node.getComponent(PolygonCollider2D);
        // 获取任意类型的碰撞器实例，可以使用基类
        const collider = this.node.getComponent(Collider2D);
        // 注册单个碰撞体的回调函数
        collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        main.instance.UI.setSiblingIndex(666);
        this.scheduleOnce(()=>{
            this.node.getComponent(Collider2D).enabled = true;
            this.isActivity = true;
        }, 1);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D) {
        if (this.isOut) return;
        if (otherCollider.tag === 10 && this.isActivity) {
            this.node.getComponent(Animation).stop();
            this.node.getComponent(Sprite).spriteFrame = this.fallPic;
            main.instance.playAudioClip(6);
            if(this.direction) this.node.getComponent(UITransform).width = -1 * this.node.getComponent(UITransform).width;
            this.isOut = true;
            main.instance.score -= this.myScore / 2;
            main.instance.scoreNode.getComponent(Label).string = main.instance.score.toString();
            main.instance.minusScore.getComponent(Label).string = (-this.myScore / 2).toString();
            main.instance.minusScore.setPosition(main.instance.ball.position.x + 59, main.instance.ball.position.y - 50);
            if(selfCollider.tag === 18) main.instance.comeIn();
            this.scheduleOnce(() => {
                this.node.destroy();
                main.instance.minusScore.setPosition(0, 600);
            }, 1)
        }
        if (otherCollider.tag === 9) {
            this.isOut = true;
            main.instance.playAudioClip(5);
            main.instance.score += this.myScore;
            main.instance.scoreNode.getComponent(Label).string = main.instance.score.toString();
            main.instance.addScore.getComponent(Label).string = '+' + this.myScore.toString();
            main.instance.addScore.setPosition(main.instance.ball.position.x + 59, main.instance.ball.position.y + 50);
            if(selfCollider.tag === 18) main.instance.comeIn();
            this.scheduleOnce(() => {
                this.node.destroy();
                main.instance.addScore.setPosition(0, 650);
            }, 0.5)
        }
        if (selfCollider.tag === 18 && otherCollider.tag === 8) {
            this.scheduleOnce(() => {
                this.node.getComponent(RigidBody2D).linearVelocity = this.speed;
            }, 0)
        }

    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D) {
    }

    update(deltaTime: number) {
        if(!isPlaying){
            this.node.destroy();
        }
        if (!this.isOut) {
            this.direction = this.node.position.x > main.instance.ball.position.x;
            if (this.nowDirection === this.direction) {
                return;
            } else {
                if (this.nowDirection) {
                    this.node.getComponent(Animation).play(this.right_anim);
                    this.colliderOverturn();
                } else {
                    this.node.getComponent(Animation).play(this.left_anim);
                    this.colliderOverturn();
                }
                this.nowDirection = !this.nowDirection;
            }
        }
    }

    // 碰撞刚体顶点坐标 x 轴反向
    colliderOverturn() {
        for (let point of this.collider.points) {
            point.set(point.x * -1, point.y);
        }
        this.collider.apply();
    }
}

