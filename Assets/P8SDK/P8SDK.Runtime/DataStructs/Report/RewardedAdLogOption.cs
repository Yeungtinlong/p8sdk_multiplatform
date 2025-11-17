using System;

namespace P8SDKWeChat
{
    public struct RewardedAdLogOption
    {
        /// <summary>
        /// 游戏服id
        /// </summary>
        public string sid;

        /// <summary>
        /// 角色id
        /// </summary>
        public string roleid;

        /// <summary>
        /// 角色名
        /// </summary>
        public string rolename;

        /// <summary>
        /// 角色等级
        /// </summary>
        public string level;

        /// <summary>
        /// 广告位创建的名称 在微信后台申请的广告位的名称
        /// </summary>
        public string ad_slot;

        /// <summary>
        /// 广告位id
        /// </summary>
        public string ad_unit_ad;

        /// <summary>
        /// 'BannerAd' 横幅 'RewardedVideoAd' 激励视频 'InterstitialAd' 插屏广告 'CustomAd' 模板广告
        /// </summary>
        public string type;

        /// <summary>
        /// 点击传入 0 观看成功传入 1 banner广告点击就算成功
        /// </summary>
        public string status;

        /// <summary>
        /// 广告展示位置 选填
        /// </summary>
        public string ad_position;
        
        /// <summary>
        /// 成功回调
        /// </summary>
        public Action success;
        
        /// <summary>
        /// 失败回调
        /// </summary>
        public Action<GeneralCallbackData> fail;
    }
}