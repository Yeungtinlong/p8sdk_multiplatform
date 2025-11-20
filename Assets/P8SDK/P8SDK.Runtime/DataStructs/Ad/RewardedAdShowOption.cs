using System;

namespace P8SDKSpace
{
    public struct RewardedAdShowOption
    {
        public string adPosition;
        public Action success;
        public Action close;
        public Action<GeneralCallbackData> fail;
    }
}