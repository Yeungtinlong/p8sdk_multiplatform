namespace P8SDKSpace
{
    /// <summary>
    /// P8SDK 暴露的接口
    /// </summary>
    public static class P8SDK
    {
        /// <summary>
        /// 登录
        /// 必接，在启动游戏后调用。
        /// </summary>
        /// <param name="option"></param>
        public static void Login(LoginOption option)
        {
            P8SDKManager.Instance.Login(option);
        }

        public static void Pay(PayOption option)
        {
            P8SDKManager.Instance.Pay(option);
        }

        /// <summary>
        /// SDK激活
        /// </summary>
        public static void OnActiveFunc()
        {
            P8SDKManager.Instance.OnActiveFunc();
        }

        /// <summary>
        /// 登录行为上报，必接
        /// </summary>
        public static void PushLoginData(PushLoginDataOption option)
        {
            P8SDKManager.Instance.PushLoginData(option);
        }

        /// <summary>
        /// 角色升级上报，必接
        /// 每次玩家升级或者过关的时候调用一下
        /// </summary>
        public static void UpgradeRecord(UpgradeRecordOption option)
        {
            P8SDKManager.Instance.UpgradeRecord(option);
        }

        /// <summary>
        /// 新创角色上报，按需接入
        /// 传入对应的请求参数
        /// 只有初次注册的时候会统计
        /// </summary>
        public static void SignLog(SignLogOption option)
        {
            P8SDKManager.Instance.SignLog(option);
        }

        /// <summary>
        /// 完成新手引导上报 媒体上报必接
        /// </summary>
        /// <param name="option"></param>
        public static void TutorialFinish(TutorialFinishOption option)
        {
            P8SDKManager.Instance.TutorialFinish(option);
        }

        /// <summary>
        /// 关卡进出上报
        /// </summary>
        /// <param name="option"></param>
        public static void LevelUpgrade(LevelUpgradeOption option)
        {
            P8SDKManager.Instance.LevelUpgrade(option);
        }

        /// <summary>
        /// 广告点击上报 按需接入
        /// 如果接入SDK流量主广告功能已内置此上报，会自动上报广告点击数据，不需要重复接入上报
        /// 如不接入我们sdk流量主广告功能，请接入此方法手动上报数据
        /// </summary>
        /// <param name="option"></param>
        public static void RewardedAdLog(RewardedAdLogOption option)
        {
            P8SDKManager.Instance.RewardedAdLog(option);
        }

        /// <summary>
        /// 初始化广告
        /// 参数没有传空值
        /// </summary>
        /// <param name="option"></param>
        public static void AdInit(AdInitOption option)
        {
            P8SDKManager.Instance.AdInit(option);
        }

        /// <summary>
        /// 播放激励广告视频
        /// </summary>
        public static void RewardedAdShow(RewardedAdShowOption option)
        {
            P8SDKManager.Instance.RewardedAdShow(option);
        }

        /// <summary>
        /// 播放插屏广告视频
        /// </summary>
        /// <param name="option"></param>
        public static void InterstitialAdShow(InterstitialAdShowOption option)
        {
            P8SDKManager.Instance.InterstitialAdShow(option);
        }

        /// <summary>
        /// 显示Banner广告
        /// </summary>
        public static void BannerAdShow(BannerAdShowOption option)
        {
            P8SDKManager.Instance.BannerAdShow(option);
        }

        /// <summary>
        /// 隐藏Banner
        /// </summary>
        public static void BannerAdHide()
        {
            P8SDKManager.Instance.BannerAdHide();
        }

        /// <summary>
        /// 显示模版广告
        /// </summary>
        public static void CustomAdShow(CustomAdShowOption option)
        {
            P8SDKManager.Instance.CustomAdShow(option);
        }

        /// <summary>
        /// 隐藏模版广告
        /// </summary>
        public static void CustomAdHide()
        {
            P8SDKManager.Instance.CustomAdHide();
        }

        /// <summary>
        /// 注册模版广告关闭事件
        /// </summary>
        public static void CustomAdOnClose(GeneralCompleteCallbackOption option)
        {
            P8SDKManager.Instance.CustomAdOnClose(option);
        }

        /// <summary>
        /// C#输出日志到Js控制台
        /// </summary>
        /// <param name="message"></param>
        public static void Log(string message)
        {
            P8SDKManager.Instance.LogToJs($"C# >>>> {message} <<<<");
        }
    }
}