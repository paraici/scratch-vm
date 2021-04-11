// MIT license
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

class SingleGamepad {
    constructor(index) {
        this.id = null
        this.index = index
        this.currentMSecs = null
    }
    
    matches(gamepad) {
        return gamepad && this.index != null && gamepad.id == this.id && 
            gamepad.buttons.length == this.currentButtons.length && gamepad.axes.length == this.currentAxes.length
    }
    
    getGamepad(i) {
        var gamepads = navigator.getGamepads()
        if (gamepads == null || gamepads.length <= i || ! gamepads[i]) 
            return null
        return gamepads[i]
    }
    
    update(currentMSecs) {
        if (this.currentMSecs == currentMSecs)
            return
        
        var gamepad = this.getGamepad(this.index)
        
        if (gamepad == null) {
            this.id = null
            this.currentButtons = []
            this.previousButtons = []
            this.currentAxes = []
            this.previousAxes = []
            return
        }
        
        this.currentMSecs = currentMSecs
        
        if (!this.matches(gamepad)) {
            this.id = gamepad.id
        
            this.previousButtons = []
            for (var i=0;i<gamepad.buttons.length;i++) {
                this.previousButtons.push(false)
            }
            
            this.previousAxes = []
            for (var i=0;i<gamepad.axes.length;i++) {
                this.previousAxes.push(0)
            }
        }
        else {
            this.previousButtons = this.currentButtons
            this.previousAxes = this.previousAxes
        }
        
        this.currentButtons = []
        for (var i=0;i<gamepad.buttons.length;i++) {
            this.currentButtons.push(gamepad.buttons[i].pressed)
        }
        
        this.currentAxes = []
        for (var i=0;i<gamepad.axes.length;i++) {
            this.currentAxes.push(gamepad.axes[i])
        }
        console.log(this.currentButtons)
    }
    
    pressedReleased(currentMSecs,i,pr) {
        this.update(currentMSecs)
        
        if (i < this.currentButtons.length) {
            return this.currentButtons[i] != this.previousButtons[i] && this.currentButtons[i] == pr
        }
        
        return false
    }
    
    changedAxis(currentMSecs,i) {
        this.update(currentMSecs)
        
        if (i < this.currentAxes.length)
            return this.currentAxes[i] != this.previousAxes[i]
        
        return false
    }
    
    getButton(currentMSecs,i) {
        this.update(currentMSecs)
        console.log(""+currentMSecs+" "+i+this.currentButtons)
        if (i < this.currentButtons.length) {
            return this.currentButtons[i]
        }
        else {
            return false
        }
    }
    
    getAxis(currentMSecs,i) {
        this.update(currentMSecs)
        if (i < this.currentAxes.length)
            return this.currentAxes[i]
        else
            return false
    }
    
    rumble(s,w,t) {
        var gamepad = this.gamepads[i].getGamepad()
        if (gamepad != null && gamepad.vibrationActuator) {
            gamepad.vibrationActuator.playEffect("dual-rumble", {
                duration: 1000*t,
                strongMagnitude: Math.max(0,Math.min(s,1)),
                weakMagnitude: Math.max(0,Math.min(w,1))
            });
        }
    }
}

class Scratch3Gamepad {
    constructor(runtime) {
        this.id = null
        this.runtime = runtime
        this.gamepads = []
        for (var i=0;i<4;i++)
            this.gamepads.push(new SingleGamepad(i))
    }
    
    getInfo() {
        return {
            id: "gamepad",
            name: "gamepad",
            blocks: [{
                        opcode: "buttonPressedReleased",
                        blockType: BlockType.HAT,
                        text: "button [BU] [PR] of pad [NR]",
                        arguments: {
                            BU: {
                                type: ArgumentType.NUMBER,
                                defaultValue: "1",
                                menu:"buttonMenu"
                            },
                            PR: {
                                type: ArgumentType.NUMBER,
                                defaultValue: "1",
                                menu: "pressReleaseMenu"
                            },
                            NR: {
                                type: ArgumentType.NUMBER,
                                defaultValue: "1",
                                menu: "padMenu"
                            },
                        },
                    },
                    {
                        opcode: "buttonDown",
                        blockType: BlockType.BOOLEAN,
                        text: "button [BU] of pad [NR] is down",
                        arguments: {
                            BU: {
                                type: ArgumentType.NUMBER,
                                defaultValue: "1",
                                menu: "buttonMenu"
                            },
                            NR: {
                                type: ArgumentType.NUMBER,
                                defaultValue: "1",
                                menu: "padMenu"
                            },
                        },                    
                    },
  /*                  {
                        "opcode": "axisMoved",
                        "blockType": "hat",
                        "text": "axis [b] of pad [i] moved",
                        "arguments": {
                            "b": {
                                "type": "number",
                                "defaultValue": "1",
                                "menu":"axisMenu"
                            },
                            "i": {
                                "type": "number",
                                "defaultValue": "1",
                                "menu": "padMenu"
                            },
                        },
                    },
                    */
                    {
                        opcode: "axisValue",
                        blockType: BlockType.REPORTER,
                        text: "axis [BU] of pad [NR] value",
                        arguments: {
                            BU: {
                                type: ArgumentType.NUMBER,
                                defaultValue: "1",
                                menu:"axisMenu"
                            },
                            NR: {
                                type: ArgumentType.NUMBER,
                                defaultValue: "1",
                                menu: "padMenu"
                            },
                        },                    
                    },
                 /*   {
                        "opcode": "rumble",
                        "blockType": "command",
                        "text": "rumble strong [s] and weak [w] for [t] sec. on pad [i]",
                        "arguments": {
                            "s": {
                                "type": "number",
                                "defaultValue": "0.25"
                            },
                            "w": {
                                "type": "number",
                                "defaultValue": "0.5"
                            },
                            "t": {
                                "type": "number",
                                "defaultValue": "0.25"
                            },
                            "i": {
                                "type": "number",
                                "defaultValue": "1",
                                "menu": "padMenu"
                            },
                        },                    
                    },*/
            ],
            menus: {
                pressReleaseMenu: [{text:"press",value:'1'}, {text:"release",value:'0'}],
                padMenu: {
                            acceptReporters: true, 
                            items: [{text:"1",value:'1'}, {text:"2",value:'2'}, {text:"3",value:'3'}, {text:"4",value:'4'}],
                },
                buttonMenu: [{text:"A",value:'1'}, {text:"B",value:'2'}, {text:"X",value:'3'}, {text:"Y",value:'4'}, {text:"L1",value:'5'}, 
                {text:"L2",value:'6'}, {text:"FOC1",value:'7'}, {text:"FOC2",value:'8'}, {text:"FILA",value:'9'}, {text:"MENU",value:'10'},
                {text:"SUS",value:'13'}, {text:"JOS",value:'14'}, {text:"STANGA",value:'15'}, {text:"DREAPTA",value:'16'} ],
                axisMenu: [{text:"h1",value:'1'}, {text:"v1-",value:'2'}, {text:"h2",value:'3'}, {text:"v2-",value:'4'}]
             }            
        };
    }
    
    buttonPressedReleased(args) {
        let num = Cast.toNumber(args.NR);
        let but = Cast.toNumber(args.BU);
        let pr=Cast.toNumber(args.PR);
        return this.gamepads[num-1].pressedReleased(this.runtime.currentMSecs,but-1,pr)
    }

    axisMoved(args) {
        let num = Cast.toNumber(args.NR);
        let but = Cast.toNumber(args.BU);
        return this.gamepads[num-1].changedAxis(this.runtime.currentMSecs,but-1)
    }
    
    axisValue(args) {
        let num = Cast.toNumber(args.NR);
        let but = Cast.toNumber(args.BU);
        return this.gamepads[num-1].getAxis(this.runtime.currentMSecs,but-1)
    }
    
    buttonDown(args) {
        let num = Cast.toNumber(args.NR);
        let but = Cast.toNumber(args.BU);
        return this.gamepads[num-1].getButton(this.runtime.currentMSecs,but-1)
    }
    
    rumble({s,w,t,i}) {
        this.gamepads[i-1].rumble(s,w,t)
    }
}

/*
(function() {
    var extensionInstance = new ScratchGamepad(window.vm.extensionManager.runtime)
    var serviceName = window.vm.extensionManager._registerInternalExtension(extensionInstance)
    window.vm.extensionManager._loadedExtensions.set(extensionInstance.getInfo().id, serviceName)
})()
*/

module.exports=Scratch3Gamepad;