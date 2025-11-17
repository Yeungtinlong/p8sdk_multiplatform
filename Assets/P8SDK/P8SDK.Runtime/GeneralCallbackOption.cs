using System;
using P8SDKWeChat;
using UnityEngine.Scripting;

namespace P8SDKWeChat
{
    [Preserve]
    public class GeneralSuccessCallbackResult
    {
        public string result;
    }

    [Preserve]
    public class GeneralCallbackResult
    {
        [Preserve]
        public class Data
        {
            public string errorcode;
            public string msg;
        }
        
        public Data data = new Data();
        public string result;
    }
    
    public struct GeneralCallbackOption
    {
        public Action success;
        public Action<GeneralCallbackData> fail;
    }
}