// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,
    editor: {
        menu:"CustomComponent/AudioControl",
    },
    properties: {
        backGroupSound: {
            default: null,
            type: cc.AudioClip
        },

        loop: true,
        
        soundVolume: {
            default: 1,
            range: [0,1,0.1],
            slide: true,
            notify: function() {
                this.setVolume();
            }
        },

        audioClipPool: {
            default: [],
            type: cc.AudioClip
        },
        
        _isPlaying: false,
        _audioId: null,
        _EffectId: null,
    },

    //Âm thanh nền
    playBackGroundSound () {
        cc.audioEngine.stopAll();
        this._audioId = cc.audioEngine.play(this.backGroupSound, this.loop, this.soundVolume);
    },

    //hiệu ứng âm thanh khi chơi game
    playEffectSound (command, loop) {
        if (loop === null && loop === undefined) {
            var loop = this.loop;
        }
        if (command !== null || command !== undefined) {
            switch (command) {
                case "begin":
                    this._EffectId = cc.audioEngine.playEffect(this.audioClipPool[0], loop);
                    break;
                case "pass":
                    this._EffectId = cc.audioEngine.playEffect(this.audioClipPool[1], loop);
                    break;
                case "hit":
                    this._EffectId = cc.audioEngine.playEffect(this.audioClipPool[2], loop);
                    break;
                case "lose":
                    this._EffectId = cc.audioEngine.playEffect(this.audioClipPool[3], loop);
                    break;
                case "second":
                    this._EffectId = cc.audioEngine.playEffect(this.audioClipPool[4], loop);
                    break;
                case "click":
                    this._EffectId = cc.audioEngine.playEffect(this.audioClipPool[5], loop);
                    break;
                case "clickWrong":
                    this._EffectId = cc.audioEngine.playEffect(this.audioClipPool[6], loop);
                    break;
                case "start":
                    this._EffectId = cc.audioEngine.playEffect(this.audioClipPool[7], loop);
                    break;
                case "quaman":
                    this._EffectId = cc.audioEngine.playEffect(this.audioClipPool[8], loop);
                    break;
                case "thang":
                    this._EffectId = cc.audioEngine.playEffect(this.audioClipPool[9], loop);
                    break;
                case "thua":
                    this._EffectId = cc.audioEngine.playEffect(this.audioClipPool[10], loop);
                    break;
                default:
                    console.error("Command is invalid");
            }
        }
    },

    pauseMusic () {
        cc.audioEngine.pauseAll();      //dừng tất cả âm thanh
    },

    resumeMusic () {
        cc.audioEngine.resumeAll();     //tạm dừng tất cả âm thanh
    },

    setVolume() {
        cc.audioEngine.setVolume(this.soundVolume);     //thiết lập âm lượng
    },

    stopAll () {
        cc.audioEngine.stopAll();       //dừng lại tất cả
        this._audioId = null;
    },
});
