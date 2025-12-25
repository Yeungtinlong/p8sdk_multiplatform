using P8SDKSpace.LitJson;
using UnityEngine;

namespace P8SDKSpace
{
    public class P8SDKManager : MonoBehaviour
    {
        private static P8SDKManager _instance;

        internal static P8SDKManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = new GameObject("P8SDKManager").AddComponent<P8SDKManager>();
                    DontDestroyOnLoad(_instance.gameObject);
                }

                return _instance;
            }
        }

        static P8SDKManager()
        {
            // 字符串 -> 整数
            JsonMapper.RegisterImporter<string, int>(int.Parse);
            JsonMapper.RegisterImporter<string, long>(long.Parse);

            // 整数 -> 字符串
            JsonMapper.RegisterImporter<int, string>(intValue => intValue.ToString());
            JsonMapper.RegisterImporter<long, string>(intValue => intValue.ToString());
        }

        internal void HandleMsgFromNative(string msg)
        {
            WebGlUtils.HandleMsgFromNative(msg);
        }

        internal void LogToJs(string msg)
        {
#if UNITY_EDITOR
            Debug.Log(msg);
#else
            WebGlUtils.CallNative("P8Log", new JsonData[] { msg });
#endif
        }

        internal void Login(LoginOption option)
        {
            WebGlUtils.CallNative("Login", null, Callback, option);
            return;

            void Callback(object args, JsonData callbackData, string callbackType)
            {
                LoginOption o = (LoginOption)args;
                switch (callbackType)
                {
                    case "success":
                    {
                        int resultCode = callbackData["result"].ToInt();
                        switch (resultCode)
                        {
                            case 0:
                            {
                                JsonData data = callbackData["data"];
                                var loginResult = new LoginResult()
                                {
                                    session_key = data["session_key"]?.ToString(),
                                    uid = data["uid"]?.ToString(),
                                    openid = data["openid"]?.ToString(),
                                    appid = data["appid"]?.ToString(),
                                };
                                o.success?.Invoke(loginResult);
                                break;
                            }
                            case 1:
                            {
                                o.fail?.Invoke(P8Utils.GetFailData(callbackData));
                                break;
                            }
                            case -1:
                            {
                                o.fail?.Invoke(P8Utils.GetFailData(callbackData));
                                break;
                            }
                            case 999:
                            {
                                o.fail?.Invoke(P8Utils.GetFailData(callbackData));
                                break;
                            }
                        }

                        break;
                    }
                    case "fail":
                    {
                        o.fail?.Invoke(P8Utils.GetFailData(callbackData));
                        break;
                    }
                }
            }
        }

        internal void Pay(PayOption option)
        {
            JsonData arg0 = new JsonData();
            arg0["roleid"] = option.roleid;
            arg0["rolename"] = option.rolename;
            arg0["cp_order_id"] = option.cp_order_id;
            arg0["serverid"] = option.serverid;
            arg0["productid"] = option.productid;
            arg0["product_name"] = option.product_name;
            arg0["ext"] = option.ext;
            arg0["mdsVersion"] = option.mdsVersion;
            arg0["env"] = option.env;
            arg0["money"] = option.money;
            arg0["level"] = option.level;
            arg0["test"] = option.test;
            arg0["extraInfo"] = option.extraInfo;

            WebGlUtils.CallNative("Pay", new JsonData[] { arg0 }, Callback, option);
            return;

            void Callback(object args, JsonData callbackData, string callbackType)
            {
                PayOption o = (PayOption)args;
                int result = callbackData["result"].ToInt();
                switch (callbackType)
                {
                    case "success":
                    {
                        o.callback?.Invoke(new PayResult() { result = (PayResultType)result });
                        break;
                    }
                    case "fail":
                    {
                        o.callback?.Invoke(new PayResult() { result = (PayResultType)result });
                        break;
                    }
                }
            }
        }

        internal void OnActiveFunc()
        {
            WebGlUtils.CallNative("OnActiveFunc");
        }

        internal void PushLoginData(PushLoginDataOption option)
        {
            JsonData arg0 = new JsonData();
            arg0["sid"] = option.sid;
            arg0["roleid"] = option.roleid;
            arg0["rolename"] = option.rolename;
            arg0["level"] = option.level;
            arg0["vip"] = option.vip;
            arg0["username"] = option.username;
            arg0["onlinetime"] = option.onlinetime;

            WebGlUtils.CallNative("PushLoginData", new JsonData[] { arg0 });
        }

        internal void UpgradeRecord(UpgradeRecordOption option)
        {
            JsonData arg0 = new JsonData();
            arg0["level"] = option.level;
            arg0["sid"] = option.sid;
            arg0["roleid"] = option.roleid;
            arg0["rolename"] = option.rolename;
            arg0["vip"] = option.vip;
            arg0["onlinetime"] = option.onlinetime;
            arg0["oaid"] = option.oaid;

            WebGlUtils.CallNative("UpgradeRecord", new JsonData[] { arg0 });
        }

        internal void SignLog(SignLogOption option)
        {
            JsonData arg0 = new JsonData();
            arg0["sid"] = option.sid;
            arg0["roleid"] = option.roleid;
            arg0["rolename"] = option.rolename;
            arg0["level"] = option.level;

            WebGlUtils.CallNative("SignLog", new JsonData[] { arg0 });
        }

        internal void TutorialFinish(TutorialFinishOption option)
        {
            JsonData arg0 = new JsonData();
            arg0["sid"] = option.sid;
            arg0["uid"] = option.uid;

            WebGlUtils.CallNative("TutorialFinish", arg0);
        }

        internal void LevelUpgrade(LevelUpgradeOption option)
        {
            JsonData arg0 = new JsonData();
            arg0["level"] = option.level;
            arg0["level_status"] = option.level_status;

            WebGlUtils.CallNative("LevelUpgrade", arg0);
        }

        internal void RewardedAdLog(RewardedAdLogOption option)
        {
            JsonData arg0 = new JsonData();
            arg0["sid"] = option.sid;
            arg0["roleid"] = option.roleid;
            arg0["rolename"] = option.rolename;
            arg0["level"] = option.level;
            arg0["ad_slot"] = option.ad_slot;
            arg0["ad_unit_ad"] = option.ad_unit_ad;
            arg0["type"] = option.type;
            arg0["status"] = option.status;
            arg0["ad_position"] = option.ad_position;

            WebGlUtils.CallNative("RewardedAdLog", new JsonData[] { arg0 });
        }

        internal void AdInit(AdInitOption option)
        {
            JsonData rewardedVideoAdOption = null;
            if (option.rewardedAdInitOption != null)
            {
                rewardedVideoAdOption = new JsonData();
                rewardedVideoAdOption["adUnitId"] = option.rewardedAdInitOption.Value.adUnitId;
                rewardedVideoAdOption["adSlot"] = option.rewardedAdInitOption.Value.adSlot;
            }

            JsonData interstitialAdOption = null;
            if (option.interstitialAdInitOption != null)
            {
                interstitialAdOption = new JsonData();
                interstitialAdOption["adUnitId"] = option.interstitialAdInitOption.Value.adUnitId;
                interstitialAdOption["adSlot"] = option.interstitialAdInitOption.Value.adSlot;
            }

            JsonData bannerAdOption = null;
            if (option.bannerAdInitOption != null)
            {
                bannerAdOption = new JsonData();
                bannerAdOption["adUnitId"] = option.bannerAdInitOption.Value.adUnitId;
                bannerAdOption["adSlot"] = option.bannerAdInitOption.Value.adSlot;
                if (option.bannerAdInitOption.Value.height != null)
                    bannerAdOption["height"] = option.bannerAdInitOption.Value.height;
                if (option.bannerAdInitOption.Value.width != null)
                    bannerAdOption["width"] = option.bannerAdInitOption.Value.width;
                if (option.bannerAdInitOption.Value.left != null)
                    bannerAdOption["left"] = option.bannerAdInitOption.Value.left;
                if (option.bannerAdInitOption.Value.top != null)
                    bannerAdOption["top"] = option.bannerAdInitOption.Value.top;
            }

            JsonData customAdOption = null;
            if (option.customAdInitOption != null)
            {
                customAdOption = new JsonData();
                customAdOption["adUnitId"] = option.customAdInitOption.Value.adUnitId;
                customAdOption["adSlot"] = option.customAdInitOption.Value.adSlot;
                if (option.customAdInitOption.Value.height != null)
                    customAdOption["height"] = option.customAdInitOption.Value.height;
                if (option.customAdInitOption.Value.width != null)
                    customAdOption["width"] = option.customAdInitOption.Value.width;
                if (option.customAdInitOption.Value.left != null)
                    customAdOption["left"] = option.customAdInitOption.Value.left;
                if (option.customAdInitOption.Value.top != null)
                    customAdOption["top"] = option.customAdInitOption.Value.top;
            }

            WebGlUtils.CallNative("AdInit",
                rewardedVideoAdOption, interstitialAdOption, bannerAdOption, customAdOption
            );
        }

        internal void RewardedAdShow(RewardedAdShowOption option)
        {
            JsonData arg0 = new JsonData();
            arg0["adPosition"] = option.adPosition;
            WebGlUtils.CallNative("RewardedAdShow", new JsonData[] { arg0 }, Callback, option);
            return;

            void Callback(object args, JsonData callbackData, string callbackType)
            {
                RewardedAdShowOption o = (RewardedAdShowOption)args;
                switch (callbackType)
                {
                    case "success":
                    {
                        o.success?.Invoke();
                        break;
                    }
                    case "fail":
                    {
                        o.fail?.Invoke(P8Utils.GetFailData(callbackData));
                        break;
                    }
                    case "close":
                    {
                        o.close?.Invoke();
                        break;
                    }
                }
            }
        }

        internal void InterstitialAdShow(InterstitialAdShowOption option)
        {
            JsonData arg0 = new JsonData();
            arg0["adPosition"] = option.adPosition;
            WebGlUtils.CallNative("InterstitialAdShow", new JsonData[] { arg0 }, Callback, option);
            return;

            void Callback(object args, JsonData callbackData, string callbackType)
            {
                InterstitialAdShowOption o = (InterstitialAdShowOption)args;
                switch (callbackType)
                {
                    case "close":
                    {
                        o.close?.Invoke();
                        break;
                    }

                    case "fail":
                    {
                        o.fail?.Invoke(P8Utils.GetFailData(callbackData));
                        break;
                    }
                }
            }
        }

        internal void BannerAdShow(BannerAdShowOption option)
        {
            JsonData arg0 = new JsonData();
            arg0["adPosition"] = option.adPosition;
            WebGlUtils.CallNative("BannerAdShow", arg0);
        }

        internal void BannerAdHide()
        {
            WebGlUtils.CallNative("BannerAdHide");
        }

        internal void CustomAdShow(CustomAdShowOption option)
        {
            JsonData arg0 = new JsonData();
            arg0["adPosition"] = option.adPosition;
            WebGlUtils.CallNative("CustomAdShow", arg0);
        }

        internal void CustomAdHide()
        {
            WebGlUtils.CallNative("CustomAdHide");
        }

        internal void CustomAdOnClose(GeneralCompleteCallbackOption option)
        {
            WebGlUtils.CallNative("CustomAdOnClose", null, Callback, option);
            return;

            void Callback(object args, JsonData callbackData, string callbackType)
            {
                GeneralCompleteCallbackOption o = (GeneralCompleteCallbackOption)args;
                switch (callbackType)
                {
                    case "complete":
                    {
                        o.complete?.Invoke();
                        break;
                    }
                }
            }
        }
        
        internal void GetAdExtraData(GetAdExtraDataOption option)
        {
            WebGlUtils.CallNative("GetAdExtraData", null, Callback, option);
            void Callback(object args, JsonData callbackData, string callbackType)
            {
                GetAdExtraDataOption o = (GetAdExtraDataOption)args;
                o.complete?.Invoke(callbackData);
            }
        }
    }
}