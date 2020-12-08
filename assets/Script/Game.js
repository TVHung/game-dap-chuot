var Level = cc.Enum({
    level1: 5,
    level2: 12,
    level3: 19
});

cc.Class({
    extends: cc.Component,          //kế thừa lại thư viện

    properties: {
        hammer: {
            default: null,
            type: cc.Prefab         //búa
        },

        countDown: {                //đếm ngược
            default: null,
            type: cc.Prefab         
        },

        gameOver: {                 //Prefab game over
            default: null,
            type: cc.Prefab
        },

        mouseNodes: {               //chuột 
            default: null,
            type: cc.Node
        },

        animalAtlas: {              //list con chuột
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

        scoreTable: {
            default: null,
            type: cc.spriteFrame
        },

        gameScore: {                //label điểm
            default: null,
            type: cc.Label
        },

        gameScoreTable: {                //label điểm
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
        
        Level:{            //độ khó
            default: Level.level3,
            type: Level,
            tooltip: "Level 1: 5\n Level 2: 15\n Level 3: 25",
        },

        text: {
            default: [],
            type: cc.Label
        },

        character: {
            default: null,
            type: cc.Node
        },

        _mouseNode: null,           //khai báo node chuột
        _mouseIndexArr: [],         //mảng ghi lại số lỗ của của mỗi con chuột ngẫu nhiên
        _times: 0,                  //thời gian
        _isRunning: true,           //điều kiện chạy game
        _score: 0,                   //khởi tạo điểm bằng 0
        arrLetter: "",
        _checkCovu1: true,
        _checkCovu2: true,
    },

    onLoad(){
        arr = new Array();
        arr[0] = new Array("a", "b", "e", "d", "k", "f", "g", "h"); 
        this.arrLetter += " " + arr[0][2] + " " + arr[0][3] + " " + arr[0][4];
    },

    start () {     
        // cc.director.getCollisionManager().enabledDebugDraw = true;
        cc.debug.setDisplayStats(false);   
        this.initGameData();
        this.onPlayGame();
        this.initEventListener();
    },

    initGameData () {                           //điểm khi đập vào mèo
        this._mouseDataTable = [
            {
                mouseName: "harmful_mouse_0",
                scoreUpdateFunc: function () {
                    this._score ++;
                    if(this.timeRollerBar.fillStart > 1/30){
                        this.timeRollerBar.fillStart -= 1/30;       //+3s
                    }
                    cc.log(this.timeRollerBar.fillStart);
                }
            },
            {
                mouseName: "harmful_mouse_1",
                scoreUpdateFunc: function () {
                    this._score ++;
                    if(this.timeRollerBar.fillStart  > 1/30){
                        this.timeRollerBar.fillStart -= 1/30;       //+3s
                    }
                }
            },
            {
                mouseName: "kind_mouse_0",
                scoreUpdateFunc: function () {
                    this.timeRollerBar.fillStart += 1/60;       //-2s
                }
            },
            {
                mouseName: "kind_mouse_1",
                scoreUpdateFunc: function () {
                    this.timeRollerBar.fillStart += 1/60;       //-2s
                }
            },
            {
                mouseName: "rabbit_0",
                scoreUpdateFunc: function () {
                    this.timeRollerBar.fillStart += 1/60;       //-2s
                }
            }
        ];
    },

    //hàm bắt sự kiện khi di chuyển chuột
    initEventListener () {        
        this.node.on(cc.Node.EventType.TOUCH_START, (event)=>{      //TOUCH_START: Khi ngón tay chạm vào màn hình
            this.onBeCreateHammerEvent(event.getLocation());
            this.onHammerClicked();
        },this);

        this.node.on(cc.Node.EventType.TOUCH_END, (event)=>{        //TOUCH_END: khi ngón tay dời khỏi màn hình
            this.onHammerClicked();                                 //khi thả chuột thì bật lại  
            setTimeout(()=>{
                this.onBeCreateHammerEvent(0, 2000);
            },200);                             
        },this);
        
        // cc.log(this.mouseNodes);  //10 mask hole
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
    //let là kiểu biến chỉ được truy cập trong hàm mà ko thể truy tập từ đâu khác
    //xuất hiện chuột ngẫu nhiên
    initMouseOutEvent () {
        if (this._mouseIndexArr.length === 0) {                 //mảng rỗng thì đẩy chuột vô
            if(this._score < Level.level1){
                mouseAmount = 1;
            }else if(this._score >= Level.level1 && this._score < Level.level2){
                if(this._score >= Level.level1 && this._checkCovu1 === true){
                    this._checkCovu1 = false;
                    cc.find("Canvas/Covu/mess").getComponent(cc.Label).string = 'Con làm tốt lắm!';
                    this.character.getComponent(cc.Animation).play('covuIn');
                    this.node.getComponent("SoundManager").playEffectSound("quaman", false);
                    setTimeout(() => {
                        this.character.getComponent(cc.Animation).play('covuOut');
                    }, 2000);
                }
                mouseAmount = Math.floor(Math.random() * 2) + 2;
            }else{
                if(this._score >= Level.level2 && this._checkCovu2 === true){
                    this._checkCovu2 = false;
                    cc.find("Canvas/Covu/mess").getComponent(cc.Label).string = 'Con làm tốt lắm!';
                    this.character.getComponent(cc.Animation).play('covuIn');
                    this.node.getComponent("SoundManager").playEffectSound("quaman", false);
                    setTimeout(() => {
                        this.character.getComponent(cc.Animation).play('covuOut');
                    }, 2000);
                }
                mouseAmount = Math.floor(Math.random() * 2) + 4;
            }
            cc.log("so chuot: " + mouseAmount);
            this.schedule(()=> {
                let randomNodeIndex = Math.ceil(Math.random() * (this.mouseNodes.childrenCount)) - 1;  //lấy vị trí xuất hiện con chuột 0-8
                let randomSpriteFrameIndex = Math.floor(Math.random() * 5);
                let tag;

                if (this._mouseIndexArr.indexOf(randomNodeIndex) === -1) {                              //-1 tức là vị trí chưa có chuột
                    var mouseNode = this.mouseNodes.children[randomNodeIndex].getChildByName("Sp Mouse");
                    var randomText = this.randomTextFollowLevel();
                    this.text[randomNodeIndex].string = randomText;
                    this.text[randomNodeIndex].node.color = new cc.Color(255, 0, 0);            //change color
                    if(randomText === this.arrLetter.split(' ')[0] || randomText === this.arrLetter.split(' ')[1]){
                        tag = 0;
                    }else{
                        tag = 2;
                    }
                    this.updateMouseNodeInfo(mouseNode, tag);                                           //thực hiện chức năng làm mới dữ liệu nút chuột
                    mouseNode.getComponent(cc.BoxCollider).enabled = true;                              //bật tính năng bắt va chạm
                    this._mouseIndexArr.push(randomNodeIndex);                                          //đẩy chuột đến vị trí random nào đó
                    mouseNode.getComponent(cc.Sprite).spriteFrame = this.animalAtlas.getSpriteFrames()[randomSpriteFrameIndex]; //load hình ảnh chi mỗi mousenode
                    mouseNode.getComponent(cc.Animation).play();                                        //chạy animation
                }
            }, 0.25, mouseAmount - 1, 1); 
        }
    },

    randomTextFollowLevel(){
        let randomText = Math.floor(Math.random() * 10) + 1;            //1 -> 10
        let textPos;
        if(this._score < Level.level1){
            if(randomText <= 3){
                textPos = Math.floor(Math.random() * 2) + 3;
            }else{
                textPos = Math.floor(Math.random() * 2);
            }
        }else if(this._score >= Level.level1 && this._score < Level.level2){
            if(randomText <= 5){
                textPos = Math.floor(Math.random() * 2) + 3;
            }else{
                textPos = Math.floor(Math.random() * 2);
            }
        }else{
            if(randomText <= 7){
                textPos = Math.floor(Math.random() * 2) + 3;
            }else{
                textPos = Math.floor(Math.random() * 2);
            }
        }
        return this.arrLetter.split(' ')[textPos];          //random text
    },
    
    //bắt đầu con lăn thời gian
    startTimeRoller () {
        var times = 3; //đếm ngược hình ảnh 3,2,1
        this.timeRollerBar.fillStart = 0;
        this.schedule(()=> {    // cái này kiểu vòng lặp
            //Khi giá trị đếm không phải là 0, hình ảnh của nút đếm ngược sẽ bị thay đổi
            if (times !== 0) {
                if (!this.countDownNode) {
                    // Khởi tạo preform của nút đếm ngược
                    this.countDownNode = cc.instantiate(this.countDown);
                    // Thêm nút đếm ngược vào nút của thành phần hiện tại
                    this.node.addChild(this.countDownNode); 
                }
                // Hiển thị nút đếm ngược
                this.countDownNode.getChildByName("Sp Num").opacity = 255;
                // Ẩn nút cha bắt đầu trò chơi trong nút đếm ngược
                this.countDownNode.getChildByName("Nodes Start").opacity = 0;
                // Chuyển đổi hình ảnh thời gian theo giá trị đếm hiện tại
                let spriteFrameName = "num_" + times;
                this.countDownNode.getChildByName("Sp Num").getComponent(cc.Sprite).spriteFrame = this.icon.getSpriteFrame(spriteFrameName);
                //Play the countdown sound
                this.node.getComponent("SoundManager").playEffectSound("second", false);
            }
            // Khi số đếm bằng 0, tức là quá trình đếm ngược kết thúc, logic bắt đầu trò chơi được thực thi
            else {
                // Ẩn nút đếm ngược
                this.countDownNode.getChildByName("Sp Num").opacity = 0;
                // Hiển thị nút con bắt đầu trò chơi trong nút đếm ngược
                this.countDownNode.getChildByName("Nodes Start").opacity = 255;
                // Chơi trò chơi và bắt đầu hiệu ứng âm thanh.
                this.node.getComponent("SoundManager").playEffectSound("begin", false);
                // Nút đếm ngược thực hiện hành động che giấu
                this.countDownNode.runAction(cc.fadeOut(1));
                // Bắt đầu đếm ngược đến khi kết thúc trò chơi, this.timeRollerStep có thể kiểm soát tần số đếm ngược
                this.schedule(this.countDownScheduleCallBack, this.timeRollerStep);
                //Start the game.
                this.startGame();
            }
            times--;
        }, 1, 3);  //1: mỗi giây 1 lần, 3 là repeat
    },

    countDownScheduleCallBack () {
        this.timeRollerBar.fillStart += 1/600;
        if (this.timeRollerBar.fillStart === this.timeRollerBar.fillRange || this._score === Level.level3) {
            this.onBeCreateHammerEvent(2000, 2000);
            this.unschedule(this.countDownScheduleCallBack);  // huy tinh gio
            this.unEventListener();
            cc.log(this._score);
            // đánh giá xem điểm số có vượt quá điểm độ khó của trò chơi hiện được thiết lập hay không, vượt quá điểm số hay không, thực hiện hàm passGame,
            if (this._score >= Level.level3) {
                this.passGame();
            }else {
                if (!this.gameOverNode) {
                    this.gameOverNode = cc.instantiate(this.gameOver);
                    this.node.addChild(this.gameOverNode);
                }
                // Hiển thị giao diện lỗi trò chơi
                this.gameOverNode.opacity = 255;
                // giao diện lỗi trò chơi thực hiện một hành động mờ dần,
                this.gameOverNode.runAction(cc.fadeOut(1.5));
                this.loseGame();
            }
            // Thực thi chức năng hoàn thành trò chơi
            this.onFinishGameEvent();
        }
    },

    updateMouseNodeInfo(mouseNode, tag) {
        //tag để xác định vị trí con chuột sẽ bị đập vào (5 con thì 0->4)
        mouseNode.getComponent("MouseManager")._isLive = true;              //biểu thị con chuột đang bị choáng
        mouseNode._scoreUpdateFunc = this._mouseDataTable[tag].scoreUpdateFunc.bind(this);  //cộng điểm tùy vào con chuột
        mouseNode.getComponent("MouseManager")._tag = tag;                  //để xác định chuột đập công hay trừ điểm
    },

    onAnimationFinishEvent () {
        this._mouseIndexArr.pop();          //hoàn thành 1 lượt thì xóa hết mảng 
        this.initMouseOutEvent();           //và gọi lại lượt chuột tiếp theo
    },

    //sự kiện tạo ra chiếc búa
    onBeCreateHammerEvent (position) {
        if (!cc.isValid(this.hammerNode)) {                                         //cc.isValid: xác định xem giá trị đã chỉ định của đối tượng có hợp lệ hay không
            this.hammerNode = cc.instantiate(this.hammer);                          //khởi tạo
            this.hammerNode.zIndex = cc.macro.MAX_ZINDEX;
            this.hammerNode.getComponent("ColliderManager")._isCollider = false;    //tạo khả năng va chạm
            this.node.addChild(this.hammerNode);                                    //thêm node 
        }
        this.hammerNode.position = this.node.convertToNodeSpaceAR(position);        
    },

    //Sự kiện khi búa được nhấn
    onHammerClicked () {
        this.hammerNode.angle = this.hammerNode.angle === 0 ? -50 : 0;           //góc đập chuột
        this.node.getComponent("SoundManager").playEffectSound("hit");          //tiếng đậpc chuột
        //nếu đang va chạm với con chuột và con chuột còn sống và còn tồn tại trong sp bg
        if (this._mouseNode && this._mouseNode.getComponent("ColliderManager")._isCollider && this._mouseNode.getComponent("MouseManager")._isLive && cc.find("Canvas/Sp Game Bg")) {
            if(this._mouseNode.getComponent("MouseManager")._tag === 0){
                this.node.getComponent("SoundManager").playEffectSound("begin");    //âm thanh điểm
            }else{
                this.node.getComponent("SoundManager").playEffectSound("clickWrong");
            }
            this._mouseNode._scoreUpdateFunc();   
            this.showScoreEffectByTag(this._mouseNode, this._mouseNode.parent.getChildByName("Nodes Score Effect"));    //hiệu ứng cộng hoặc trừ điểm
            this._score = this._score < 0 ? 0 : this._score;    //trường hợp nhỏ hơn 0
            this.gameScore.string = this._score;                //cập nhật điểm 
            this._mouseNode.getComponent("MouseManager")._isLive = false;    //chuyển trạng thái cho chuột
            let oldSpriteFrameName = this._mouseNode.getComponent(cc.Sprite).spriteFrame.name;      //gắn cho oldSpiteFrameName = hình ảnh con chuột bị đập
            let newSpriteFrameName = oldSpriteFrameName + "_death";             //đổi tên để thành hình ảnh chuột chết
            this._mouseNode.getComponent(cc.Sprite).spriteFrame = this.animalDeathAtlas.getSpriteFrame(newSpriteFrameName); //biến hình ảnh chuột thành hình ảnh chuột bị đập
            this._mouseNode.getChildByName("Anima Start").getComponent(cc.Animation).play();    //chạy animation choáng
        }
    },

    showScoreEffectByTag (node, scoreEffectNode) {
        for (let i = 0; i < scoreEffectNode.childrenCount; i++) {
            scoreEffectNode.children[i].opacity = node.getComponent("MouseManager")._tag === i ? 255 : 0;   //hiển thị effect tùy vào con vật khác nhau
            scoreEffectNode.children[i].runAction(cc.fadeOut(1));    //ẩn dần với thời gian là 1s
        }   
    },

    onPlayGame() {
        this.character.getComponent(cc.Animation).play('covuIn');
        this.node.getComponent("SoundManager").playEffectSound("start", false);
        setTimeout(() => {
            this.character.getComponent(cc.Animation).play('covuOut');
        }, 3500);
        cc.find("Canvas/Covu/mess").getComponent(cc.Label).string = 'Bắt đầu chơi nào!';
        setTimeout(() => {
            this.node.getComponent("SoundManager").playBackGroundSound();   //play âm thanh
            this.startTimeRoller();  
        }, 4000);                                       //Bắt đầu tính giờ
    },

    onScoreTable() {
        cc.find("Canvas/ScoreTable").active = true; 
        this.gameScoreTable.string = " " + this.gameScoreTable.string + this._score; 
    },    

    onContinueButton() {
        cc.director.loadScene("Game");      //Load lại scene từ đầu  
    },

    
    //xử lý thoát
    onBackHallButtonClicked () {
        cc.director.loadScene("Game");      //Load lại scene từ đầu
    },

    //tắt bật âm thanh
    onSwitchMusicVolume (event) {
        this.node.getComponent("SoundManager").playEffectSound("click");                //khi click thì phát âm thanh
        this.node.getComponent("SoundManager")._isPlaying = !this.node.getComponent("SoundManager")._isPlaying;  //đảo giá trị isPlaying từ True thành false và ngược lại
        if (this.node.getComponent("SoundManager")._isPlaying) { //nếu _isPlaying = true
            event.target.getComponent(cc.Sprite).spriteFrame = this.icon.getSpriteFrame("sound_close"); //thay đổi hình ảnh thành tắt âm
            this.node.getComponent("SoundManager").stopAll();   //thì tắt hết âm thanh
        }
        else {          //nếu _isPlaying  = flase
            event.target.getComponent(cc.Sprite).spriteFrame = this.icon.getSpriteFrame("sound_open");  //thay đổi hình ảnh thành bật âm
            this.node.getComponent("SoundManager").playBackGroundSound();   //bật lại âm thanh
        }
    },
    
    //tiếng game thắng trò chơi
    passGame() {
        cc.find("Canvas/Covu/mess").getComponent(cc.Label).string = 'Chúc mừng con đã vượt \nqua thử thách!';
        this.node.getComponent("SoundManager").stopAll();   //thì tắt hết âm thanh
        this.character.getComponent(cc.Animation).play('covuIn');
        this.node.getComponent("SoundManager").playEffectSound("thang", false);
        this.node.getComponent("SoundManager").playEffectSound("pass", false);
    },

    //tiếng game thua trò chơi
    loseGame () {
        cc.find("Canvas/Covu/mess").getComponent(cc.Label).string = 'Con cần cố gắng hơn nữa!';
        this.node.getComponent("SoundManager").stopAll();   //thì tắt hết âm thanh
        this.character.getComponent(cc.Animation).play('covuIn');
        this.node.getComponent("SoundManager").playEffectSound("thua", false);
        this.node.getComponent("SoundManager").playEffectSound("lose", false);
    },

    //kết thúc game
    onFinishGameEvent () {
        setTimeout(()=>{
            cc.find("Canvas/Sp Game Bg").opacity = 150; 
            this.onScoreTable();
        }, 1000);
        for (let i = 0; i < this.mouseNodes.childrenCount; i++) {
            this.mouseNodes.children[i].getChildByName("Sp Mouse").getComponent(cc.Animation).stop();  //dùng tất cả chuột
        }
        // setTimeout(()=>{
        //     cc.director.loadScene("Game");      //load màn hình kết thúc
        // },2000);
    }
});
