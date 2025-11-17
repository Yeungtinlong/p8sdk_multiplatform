using System.Collections.Generic;
using LitJson;
using P8SDKWeChat;
using Random = UnityEngine.Random;

namespace P8SDKWeChat
{
    public class P8Utils
    {
        public static string GetCallbackId<T>(Dictionary<string, T> dict)
        {
            int num = dict.Count;
            string text = ((float)num + Random.value).ToString();
            while (dict.ContainsKey(text))
            {
                num++;
                text = ((float)num + Random.value).ToString();
            }

            return text;
        }
        
        public static GeneralCallbackData GetFailData(JsonData callbackData)
        {
            // callbackData: { result: "0", data: { errorcode: 0, msg: "" } }
            // data不一定存在，errorcode和msg也不一定存在
            // string result = callbackData.GetValueOrDefault("result").ToString();
            JsonData data = callbackData.GetValueOrDefault("data");
            int errorcode = (data?.GetValueOrDefault("errorcode")).ToInt();
            string msg = data?.GetValueOrDefault("msg").ToString();
            return new GeneralCallbackData(errorcode, msg);
        }
    }
}