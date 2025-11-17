using System;

namespace P8SDKWeChat
{
    public struct GotoMiniProgramOption
    {
        public string appId;
        public string query;
        public string envVersion;
        public Action success;
        public Action<GeneralCallbackData> fail;
    }
}