using System;
using P8SDKSpace;
using UnityEngine.Scripting;

namespace P8SDKSpace
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