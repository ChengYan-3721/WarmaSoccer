import {_decorator, Component, Node, Prefab, instantiate, Collider2D, RigidBody2D, Vec2} from 'cc';
import {main, isPlaying, warmaShow} from "db://assets/Scripts/main";

const {ccclass, property} = _decorator;

@ccclass('BiologyManager')
export class BiologyManager extends Component {
    @property([Prefab])
    biologyArray: Array<Prefab>;
    @property(Prefab)
    warmaPre: Prefab = null;

    speed: Vec2;

    start() {
        this.speed = new Vec2();
        this.schedule(this.landing, 2);
        this.schedule(this.warmaAppear, 60);
    }

    update(deltaTime: number) {
        if(!isPlaying) this.unscheduleAllCallbacks();
    }

    landing(){
        if(main.instance.node.children.length < 16 && isPlaying){
            let i: number = Math.floor(Math.random() * 9);
            let x: number = Math.floor(Math.random() * 880) - 440;
            let y: number = Math.floor(Math.random() * 380) - 240;
            const biology = instantiate(this.biologyArray[i]);
            biology.setParent(this.node.parent);
            biology.setPosition(x, 450);
            biology.getComponent(Collider2D).enabled = false;
            biology.getComponent(RigidBody2D).linearVelocity = this.speed.set(0, -(450 - y) / 16);
        }
    }

    warmaAppear(){
        if(warmaShow) return;
        main.instance.comeIn();
        let x: number = Math.floor(Math.random() * 880) - 440;
        const warma = instantiate(this.warmaPre);
        warma.setParent(this.node.parent);
        warma.setPosition(x, 450);
        warma.getComponent(Collider2D).enabled = false;
        warma.getComponent(RigidBody2D).linearVelocity = this.speed.set(0, -25);
    }
}

