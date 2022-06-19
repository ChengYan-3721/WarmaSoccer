import {_decorator, Component, RigidBody2D, Collider2D, Contact2DType, Vec2, Label} from 'cc';
import {main} from "db://assets/Scripts/main";

const {ccclass, property} = _decorator;

@ccclass('Ball')
export class Ball extends Component {

    speed: Vec2;

    start() {
        this.speed = new Vec2(0, 0);
        // 获取任意类型的碰撞器实例，可以使用基类
        const collider = this.node.getComponent(Collider2D);
        // 注册单个碰撞体的回调函数
        collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D) {
        if (otherCollider.tag === 10) {
            this.schedule(this.outside, 1);
            return;
        }
        if (otherCollider.tag === 11) {
            this.unschedule(this.outside);
            main.instance.minusScore.setPosition(0, 600);
            return;
        }
        if (otherCollider.tag === 9 || otherCollider.tag === 18) {
            --main.instance.ballCount;
            if(otherCollider.tag === 18) this.node.getComponent(RigidBody2D).linearVelocity = this.speed.set(0, 100);
            main.instance.playAudioClip(7);
            // 暂停接收输入事件
            selfCollider.enabled = false;
            main.instance.node.pauseSystemEvents(true);
            this.scheduleOnce(() => {
                if(main.instance.ballCount < 0) {
                    main.instance.gameOver();
                    main.instance.node.resumeSystemEvents(true);
                    selfCollider.enabled = true;
                    return;
                }
                this.node.getComponent(RigidBody2D).linearVelocity = this.speed.set(0, 0);
                this.node.setPosition(0, -53);
                // 恢复接收输入事件
                main.instance.node.resumeSystemEvents(true);
                selfCollider.enabled = true;
                main.instance.ballCountNode.getComponent(Label).string = main.instance.ballCount.toString();
            }, 2)
            return;
        }
        main.instance.playAudioClip(4);
    }

    // 出界持续扣分
    outside() {
        main.instance.playAudioClip(6);
        main.instance.scoreNode.getComponent(Label).string = (--main.instance.score).toString();
        main.instance.minusScore.getComponent(Label).string = (-1).toString();
        main.instance.minusScore.setPosition(main.instance.ball.position.x, main.instance.ball.position.y - 50);
        this.scheduleOnce(() => {
            main.instance.minusScore.setPosition(0, 600);
        }, 0.5);
    }

    update(deltaTime: number) {

    }
}

