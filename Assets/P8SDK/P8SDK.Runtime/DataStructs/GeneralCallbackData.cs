using LitJson;

namespace P8SDKWeChat
{
    public struct GeneralCallbackData
    {
        public int errorcode;
        public string msg;

        public GeneralCallbackData(int errorcode, string msg)
        {
            this.errorcode = errorcode;
            this.msg = msg;
        }

        public override string ToString()
        {
            return JsonMapper.ToJson(this);
        }
    }
}