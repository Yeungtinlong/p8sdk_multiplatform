using P8SDKSpace.LitJson;

namespace P8SDKSpace
{
    public class P8Utils
    {
        public static GeneralCallbackData GetFailData(JsonData callbackData)
        {
            // callbackData: { result: "0", data: { errorcode: 0, msg: "" } }
            // data不一定存在，errorcode和msg也不一定存在
            // string result = callbackData.GetValueOrDefault("result").ToString();
            JsonData data = callbackData?.GetValueOrDefault("data");
            int errorcode = (data?.GetValueOrDefault("errorcode")).ToInt();
            string msg = data?.GetValueOrDefault("msg").ToString();
            return new GeneralCallbackData(errorcode, msg);
        }
    }
}