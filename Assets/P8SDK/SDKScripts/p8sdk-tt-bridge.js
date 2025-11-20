(function () {
    let P8Utils = {};

    P8Utils.SendCallback = function (callTarget, callbackId, data, callbackType) {
        globalThis.GameGlobal.globalUnityInstance.SendMessage("P8SDKManager", "HandleMsgFromNative", JSON.stringify({
            callTarget: callTarget,
            callbackId: callbackId,
            callbackType: callbackType,
            data: data,
        }));
    };

    P8Utils.UnityCallJsAsync = function (msg) {
        let callObj = JSON.parse(msg);
        let callTarget = callObj.callTarget;
        let sdkFunctions = globalThis.GameGlobal.SdkFunctions;

        // console.log("[P8 BRIDGE] >>> " + callTarget);

        if (!sdkFunctions.hasOwnProperty(callTarget) || typeof (sdkFunctions[callTarget]) !== "function") {
            console.error("UnityCallJs fail, " + callTarget + " is not exists or is not a function.");
            return;
        }

        globalThis.GameGlobal.SdkFunctions[callTarget](callObj);
    };

    if (globalThis.GameGlobal === undefined)
        globalThis.GameGlobal = {};
    globalThis.GameGlobal.P8Utils = P8Utils;
})();

(function () {
    /*
    * callObj: {
    *   callbackId: "",     // string
    *   callArgs: {},       // array
    * }
    */

    let sdkFunctions = {
        P8Log: function (callObj) {
            console.log("[UNITY P8LOG] >>>> " + callObj.callArgs[0]);
        },

        Login: function (callObj) {
            P8SDK.login().then(res => {
                globalThis.GameGlobal.P8Utils.SendCallback(callObj.callTarget, callObj.callbackId, res, "success");
            }).catch(err => {
                globalThis.GameGlobal.P8Utils.SendCallback(callObj.callTarget, callObj.callbackId, err, "fail");
            });
        },

        Pay: function (callObj) {
            let arg0 = callObj.callArgs[0];
            P8SDK.pay(arg0).then((res) => {
                globalThis.GameGlobal.P8Utils.SendCallback(callObj.callTarget, callObj.callbackId, res, "success");
            }).catch(err => {
                globalThis.GameGlobal.P8Utils.SendCallback(callObj.callTarget, callObj.callbackId, err, "fail");
            });
        },

        AdInit: function (callObj) {
            let arg0 = callObj.callArgs[0];
            let arg1 = callObj.callArgs[1];
            let arg2 = callObj.callArgs[2];
            let arg3 = callObj.callArgs[3];
            console.log("arg0: " + JSON.stringify(arg0));
            console.log("arg1: " + JSON.stringify(arg1));
            console.log("arg2: " + JSON.stringify(arg2));
            console.log("arg3: " + JSON.stringify(arg3));
            P8SDK.ttADinit(arg0, arg1, arg2, arg3);
        },

        RewardedAdShow: function (callObj) {
            P8SDK.videoADShow(
                () => {
                    globalThis.GameGlobal.P8Utils.SendCallback(callObj.callTarget, callObj.callbackId, null, "success");
                },
                () => {
                    globalThis.GameGlobal.P8Utils.SendCallback(callObj.callTarget, callObj.callbackId, null, "close");
                },
                (err) => {
                    globalThis.GameGlobal.P8Utils.SendCallback(callObj.callTarget, callObj.callbackId, err, "fail");
                },
                callObj.callArgs[0].adPosition
            );
        },

        InterstitialAdShow: function (callObj) {
            P8SDK.sceneADShow(
                () => {
                    globalThis.GameGlobal.P8Utils.SendCallback(callObj.callTarget, callObj.callbackId, null, "close");
                },
                () => {
                    globalThis.GameGlobal.P8Utils.SendCallback(callObj.callTarget, callObj.callbackId, null, "fail");
                },
                callObj.callArgs[0].adPosition
            );
        },

        BannerAdShow: function (callObj) {
            P8SDK.bannerAdShow();
        },

        BannerAdHide: function (callObj) {
            P8SDK.bannerAdHide();
        },

        CustomAdShow: function (callObj) {
            P8SDK.customADShow();
        },

        CustomAdHide: function (callObj) {
            P8SDK.customADHide();
        },

        CustomAdOnClose: function (callObj) {
            P8SDK.customADOnclose(() => {
                globalThis.GameGlobal.P8Utils.SendCallback(callObj.callTarget, callObj.callbackId, null, "close");
            });
        },

        OnActiveFunc: function (callObj) {
            P8LogSDK.onActiveFunc();
        },

        PushLoginData: function (callObj) {
            P8LogSDK.pushLoginData(callObj.callArgs[0]);
        },

        UpgradeRecord: function (callObj) {
            P8LogSDK.upGradeRecord(callObj.callArgs[0]);
        },

        SignLog: function (callObj) {
            P8LogSDK.signLog(callObj.callArgs[0]);
        },

        RewardedAdLog: function (callObj) {
            P8LogSDK.wxVideoLog(callObj.callArgs[0]);
        },

        TutorialFinish: function (callObj) {
            console.log("不支持TutorialFinish");
            // P8LogSDK.tutorialFinish(callObj.callArgs[0]);
        },

        LevelUpgrade: function (callObj) {
            P8LogSDK.levelUpGrade(callObj.callArgs[0]);
        },

        NavigateToScene: function (callObj) {
            P8SDK.navigateToScene(() => {
                globalThis.GameGlobal.P8Utils.SendCallback(callObj.callTarget, callObj.callbackId, null, "success");
            }, () => {
                globalThis.GameGlobal.P8Utils.SendCallback(callObj.callTarget, callObj.callbackId, null, "fail");
            });
        },

        ShowRevisitGuide: function (callObj) {
            P8SDK.showRevisitGuide(() => {
                globalThis.GameGlobal.P8Utils.SendCallback(callObj.callTarget, callObj.callbackId, null, "success");
            }, () => {
                globalThis.GameGlobal.P8Utils.SendCallback(callObj.callTarget, callObj.callbackId, null, "fail");
            });
        },

        AddShortcut : function (callObj) {
            P8SDK.addShortcut();
        }
    };
    if (globalThis.GameGlobal === undefined)
        globalThis.GameGlobal = {};
    globalThis.GameGlobal.SdkFunctions = sdkFunctions;
})();
