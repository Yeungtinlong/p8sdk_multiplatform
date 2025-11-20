using System;

namespace P8SDKSpace
{
    public struct InterstitialAdShowOption
    {
        /// <summary>
        /// 广告展示位置选填
        /// </summary>
        public string adPosition;
        
        /// <summary>
        /// 视频没看完的回调
        /// </summary>
        public Action close;
        
        /// <summary>
        /// 视频播放异常回调
        /// </summary>
        public Action<GeneralCallbackData> fail;
    }
}