namespace P8SDKSpace
{
    public struct RewardedAdInitOption
    {
        /// <summary>
        /// 激励视频id
        /// </summary>
        public string adUnitId;

        /// <summary>
        /// 激励视频名称，在微信后台申请的广告位的名称。
        /// </summary>
        public string adSlot;
    }

    public struct InterstitialAdInitOption
    {
        /// <summary>
        /// 插屏视频id
        /// </summary>
        public string adUnitId;

        /// <summary>
        /// 插屏视频名称，在微信后台申请的广告位的名称。
        /// </summary>
        public string adSlot;
    }

    public struct BannerAdInitOption
    {
        public string adUnitId;

        /// <summary>
        /// banner广告名称，在微信后台申请的广告位的名称。
        /// </summary>
        public string adSlot;

        public int? left;
        public int? top;
        public int? width;
        public int? height;
    }

    public struct CustomAdInitOption
    {
        public string adUnitId;

        /// <summary>
        /// 模版广告名称，在微信后台申请的广告位的名称。
        /// </summary>
        public string adSlot;

        public int? left;
        public int? top;
        public int? width;
        public int? height;
    }

    public struct AdInitOption
    {
        /// <summary>
        /// 激励广告参数
        /// </summary>
        public RewardedAdInitOption? rewardedAdInitOption;

        /// <summary>
        /// 插屏广告参数
        /// </summary>
        public InterstitialAdInitOption? interstitialAdInitOption;

        /// <summary>
        /// banner广告参数 
        /// </summary>
        public BannerAdInitOption? bannerAdInitOption;

        /// <summary>
        /// 模版广告参数
        /// </summary>
        public CustomAdInitOption? customAdInitOption;
    }
}