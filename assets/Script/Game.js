var Difficult = cc.Enum({
    Simple: 1000,           //đơn giản
    Ordinary: 2500,         //bình thường
    Difficult: 5000         //khó
});

cc.Class({
    extends: cc.Component,

    properties: {
        hammer: {
            default: null,
            type: cc.Prefab         //búa
        },

        countDown: {                //đếm ngược
            default: null,
            type: cc.Prefab         
        },

        gameOver: {                 //kết thúc game
            default: null,
            type: cc.Prefab
        },

        mouseNodes: {               //chuột 
            default: null,
            type: cc.Node
        },

        animalAtlas: {              //list động vật
            default: null,
            type: cc.SpriteAtlas
        },

        animalDeathAtlas: {         //list hình dạng khi bị búa gõ   
            default: null,
            type: cc.SpriteAtlas
        },

        timeRollerBar: {            //thanh hiển thị thời gian
            default: null,
            type: cc.Sprite
        },

        icon: {                     //icon 
            default: null,
            type: cc.SpriteAtlas
        },

        gameRule: {                 //bảng luật chơi
            default: null,
            type: cc.SpriteFrame
        },

        gameScore: {                //label điểm
            default: null,
            type: cc.Label
        },

        timeRollerStep: {           //bước nhảy của time
            default: 1,
            range: [0, 2, 0.1],
            slide: true
        },

        gameScoreEffect: {              //điểm
            default: null,
            type: cc.Prefab
        },
        
        gameDifficultScore:{            //độ khó
            default: Difficult.Difficult,
            type: Difficult,
            tooltip: "Simple:2000\n Ordinary:4000\n Difficult:6000",
        },

        gameGitHubUrl:"",

        _mouseNode: null,           //khai báo node chuột
        _mouseIndexArr: [],         //mảng ghi lại số lỗ của của mỗi con chuột ngẫu nhiên
        _times: 0,                  //thời gian
        _isRunning: true,           //điều kiện chạy game
        _score: 0                   //khởi tạo điểm bằng 0
    },

    start () {                      //khởi tạo game
        this.initGameData();
        this.initEventListener();
    },

    initGameData () {                           //điểm khi đập vào mèo
        this._mouseDataTable = [
            {
                mouseName: "harmful_mouse_0",
                scoreUpdateFunc: function () {
                    this._score += 100;
                }
            },
            {
                mouseName: "harmful_mouse_1",
                scoreUpdateFunc: function () {
                    this._score += 500;
                }
            },
            {
                mouseName: "kind_mouse_0",
                scoreUpdateFunc: function () {
                    if (this._score === 0) {
                        this._score += 200;
                    }
                    else {
                        this._score = Math.floor(this._score * 1.2);
                    }
                }
            },
            {
                mouseName: "kind_mouse_1",
                scoreUpdateFunc: function () {
                    this._score -= 100;
                }
            },
            {
                mouseName: "rabbit_0",
                scoreUpdateFunc: function () {
                    this._score = Math.floor(this._score / 2);
                }
            }
        ];
    },

    //hàm bắt sự kiện khi di chuyển chuột
    initEventListener () {        
        this.node.on(cc.Node.EventType.MOUSE_MOVE, (event)=>{       //MOUSE_MOVE: khi chuột di chuyển trên màn hình cho dù có đc nhấn hay không
            this.onBeCreateHammerEvent(event.getLocation());        //MOUSE_DOWN: khi nhấn chuột
        },this);

        this.node.on(cc.Node.EventType.TOUCH_MOVE, (event)=>{       //TOUCH_MOVE: Khi di chuyển ngón tay trên màn hình
            this.onBeCreateHammerEvent(event.getLocation());
        },this);

        this.node.on(cc.Node.EventType.TOUCH_START, (event)=>{      //TOUCH_START: Khi ngón tay chạm vào màn hình
            this.onBeCreateHammerEvent(event.getLocation());
            this.onHammerClicked();
            if (this.gameRuleNode) {
                var gameRuleFadeOut = cc.fadeOut(1);
                this.gameRuleNode.runAction(gameRuleFadeOut);
            }
        },this);

        this.node.on(cc.Node.EventType.TOUCH_END, (event)=>{        //TOUCH_END: khi ngón tay dời khỏi màn hình
            this.onHammerClicked();
        },this);
        
        for (let i = 0; i < this.mouseNodes.childrenCount; i++) {
            this.mouseNodes.children[i].getChildByName("Sp Mouse").getComponent(cc.Animation).on(cc.Animation.EventType.FINISHED, this.onAnimationFinishEvent, this);
        }
    },

    unEventListener () {
        this.node.targetOff(this);
        for (let i = 0; i < this.mouseNodes.childrenCount; i++) {
            this.mouseNodes.children[i].getChildByName("Sp Mouse").getComponent(cc.Animation).targetOff(this);
        }
    },

    //bắt đầu game
    startGame () {
        this.initMouseOutEvent();
    },
    
    //Math.ceil: trả về số nguyên lớn hơn hoặc bằng nhập vào
    //xuất hiện chuột ngẫu nhiên
    initMouseOutEvent () {
        if (this._mouseIndexArr.length === 0) {
            let mouseAmount = Math.ceil(Math.random() * (this.mouseNodes.childrenCount - 1));   //let là kiểu biến chỉ được truy cập trong hàm mà ko thể truy tập từ đâu khác
            
            if (mouseAmount === 0) {
                mouseAmount = 1;
            }
            
            for (let i = 0; i < 5; i++) {  //đang lấy ngẫu nhiên từ 5 con chuột
                let randomNodeIndex = Math.ceil(Math.random() * (this.mouseNodes.childrenCount - 1));  //lấy random từ 0-4 còn chuột
                let randomSpriteFrameIndex = Math.ceil(Math.random() * (this.animalAtlas.getSpriteFrames().length - 1))
                
                if (this._mouseIndexArr.indexOf(randomNodeIndex) === -1) {
                    var mouseNode = this.mouseNodes.children[randomNodeIndex].getChildByName("Sp Mouse");
                    this.updateMouseNodeInfo(mouseNode, randomSpriteFrameIndex);
                    mouseNode.getComponent(cc.BoxCollider).enabled = true;
                    this._mouseIndexArr.push(randomNodeIndex);
                    mouseNode.getComponent(cc.Sprite).spriteFrame = this.animalAtlas.getSpriteFrames()[randomSpriteFrameIndex];
                    mouseNode.getComponent(cc.Animation).play();
                }
            }
        }
    },
    
    //bắt đầu con lăn thời gian
    startTimeRoller () {
        var times = 3;
        this.timeRollerBar.fillStart = 0;
        this.schedule(()=> {
            if (times !== 0) {
                if (!this.countDownNode) {
                    this.countDownNode = cc.instantiate(this.countDown);
                    this.node.addChild(this.countDownNode);
                }
                this.countDownNode.getChildByName("Sp Num").opacity = 255;
                this.countDownNode.getChildByName("Nodes Start").opacity = 0;
                let spriteFrameName = "num_" + times;
                this.countDownNode.getChildByName("Sp Num").getComponent(cc.Sprite).spriteFrame = this.icon.getSpriteFrame(spriteFrameName);
                this.node.getComponent("SoundManager").playEffectSound("second", false);
            }
            else {
                this.countDownNode.getChildByName("Sp Num").opacity = 0;
                this.countDownNode.getChildByName("Nodes Start").opacity = 255;
                this.node.getComponent("SoundManager").playEffectSound("begin", false);
                this.countDownNode.runAction(cc.fadeOut(1));
                this.schedule(this.countDownScheduleCallBack, this.timeRollerStep);
                this.startGame();
            }
            times--;
        }, 1, 3);
    },

    countDownScheduleCallBack () {
        this.timeRollerBar.fillStart += 0.01;
        if (this.timeRollerBar.fillStart === this.timeRollerBar.fillRange) {
            this.unschedule(this.countDownScheduleCallBack);
            this.unEventListener();
            if (this._score > this.gameDifficultScore) {
                this.passGame();
            }
            else {
                if (!this.gameOverNode) {
                    this.gameOverNode = cc.instantiate(this.gameOver);
                    this.node.addChild(this.gameOverNode);
                }
                this.gameOverNode.opacity = 255;
                this.gameOverNode.runAction(cc.fadeOut(1.5));
                this.loseGame();
            }
            this.onFinishGameEvent();
        }
    },

    updateMouseNodeInfo(mouseNode, tag) {
        mouseNode.getComponent("MouseManager")._isLive = true;
        mouseNode._scoreUpdateFunc = this._mouseDataTable[tag].scoreUpdateFunc.bind(this);
        mouseNode.getComponent("MouseManager")._tag = tag;
    },

    onAnimationFinishEvent () {
        this._mouseIndexArr.pop();          //hoàn thành 1 lượt thì xóa hết mảng 
        this.initMouseOutEvent();           //và gọi lại lượt chuột tiếp theo
    },

    //sự kiện tạo ra chiếc búa
    onBeCreateHammerEvent (position) {
        if (!cc.isValid(this.hammerNode)) {
            this.hammerNode = cc.instantiate(this.hammer);                          //khởi tạo
            this.hammerNode.zIndex = cc.macro.MAX_ZINDEX;
            this.hammerNode.getComponent("ColliderManager")._isCollider = false;    //collider: va chạm
            this.node.addChild(this.hammerNode);                                    //thêm node 
        }
        this.hammerNode.position = this.node.convertToNodeSpaceAR(position);        
    },

    //Sự kiện khi búa được nhấn
    onHammerClicked () {
        this.hammerNode.angle = this.hammerNode.angle === 0 ? 30 : 0;           //góc đập chuột
        this.node.getComponent("SoundManager").playEffectSound("hit");          //lấy cái âm thanh từ SoundMannager
        //nếu chuột tồn tại
        if (this._mouseNode && this._mouseNode.getComponent("ColliderManager")._isCollider && this._mouseNode.getComponent("MouseManager")._isLive && cc.find("Canvas/Sp Game Bg")) {
            this.node.getComponent("SoundManager").playEffectSound("hit");      //nếu chạm thì sẽ kêu 
            this.node.getComponent("SoundManager").playEffectSound("score");    //tiếng cộng điểm
            this._mouseNode._scoreUpdateFunc();
            this.showScoreEffectByTag(this._mouseNode, this._mouseNode.parent.getChildByName("Nodes Score Effect"));
            this._score = this._score < 0 ? 0 : this._score; 
            this.gameScore.string = this._score;
            this._mouseNode.getComponent("MouseManager")._isLive = false;
            let oldSpriteFrameName = this._mouseNode.getComponent(cc.Sprite).spriteFrame.name;
            let newSpriteFrameName = oldSpriteFrameName + "_death";
            this._mouseNode.getComponent(cc.Sprite).spriteFrame = this.animalDeathAtlas.getSpriteFrame(newSpriteFrameName);
            this._mouseNode.getChildByName("Anima Start").getComponent(cc.Animation).play();
        }
    },

    showScoreEffectByTag (node, scoreEffectNode) {
        for (let i = 0; i < scoreEffectNode.childrenCount; i++) {
            scoreEffectNode.children[i].opacity = node.getComponent("MouseManager")._tag === i ? 255 : 0;
            scoreEffectNode.children[i].runAction(cc.fadeOut(1));
        }
    },

    //xử lý nhấn play
    onGamePlayButtonClicked() {
        this.node.getComponent("SoundManager").playBackGroundSound();
        cc.find("Canvas/Sp Hall Bg").active = false;            //active để xử lý hoạt động
        cc.find("Canvas/Sp Game Bg").active = true;
        this.startTimeRoller();
    },
    
    //xử lý xem luật chơi
    onGameRuleButtonClicked () {
        this.node.getComponent("SoundManager").playEffectSound("click", false);
        if (!this.gameRuleNode) {
            this.gameRuleNode = new cc.Node();
            this.gameRuleNode.addComponent(cc.Sprite).spriteFrame = this.gameRule;
            this.node.addChild(this.gameRuleNode);
        }
        this.gameRuleNode.opacity = 255;
    },

    //xử lý nhấn vào nút github
    onGameGitHubButtonClicked () {
        this.node.getComponent("SoundManager").playEffectSound("click", false);
        if (cc.sys.isBrowser) {
            cc.sys.openURL(this.gameGitHubUrl);
        }
    },
    //xử lý thoát
    onBackHallButtonClicked () {
        cc.director.loadScene("Game");
    },

    //tắt bật âm thanh
    onSwitchMusicVolume (event) {
        this.node.getComponent("SoundManager").playEffectSound("click");
        this.node.getComponent("SoundManager")._isPlaying = !this.node.getComponent("SoundManager")._isPlaying;
        if (this.node.getComponent("SoundManager")._isPlaying) {
            event.target.getComponent(cc.Sprite).spriteFrame = this.icon.getSpriteFrame("sound_close");
            this.node.getComponent("SoundManager").stopAll();
        }
        else {
            event.target.getComponent(cc.Sprite).spriteFrame = this.icon.getSpriteFrame("sound_open");
            this.node.getComponent("SoundManager").playBackGroundSound();
        }
    },
    
    //tiếng game bắt đầu chơi
    passGame() {
        this.node.getComponent("SoundManager").playEffectSound("pass", false);
    },

    //tiếng game khi kết thúc trò chơi
    loseGame () {
        this.node.getComponent("SoundManager").playEffectSound("lose", false);
    },

    //kết thúc game
    onFinishGameEvent () {
        for (let i = 0; i < this.mouseNodes.childrenCount; i++) {
            this.mouseNodes.children[i].getChildByName("Sp Mouse").getComponent(cc.Animation).stop();  //dùng tất cả chuột
        }
        setTimeout(()=>{
            cc.director.loadScene("Game");      //load màn hình kết thúc
        },2000);
    }
});
