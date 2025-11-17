using System;

namespace P8SDKWeChat
{
    public struct RewardedAdShowOption
    {
        public string adPosition;
        public Action success;
        public Action close;
        public Action<GeneralCallbackData> fail;
    }
}