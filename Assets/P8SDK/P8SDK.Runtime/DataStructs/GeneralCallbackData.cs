using P8SDKSpace.LitJson;

namespace P8SDKSpace
{
    /// <summary>
    /// 这是一个不可靠的错误结构，接口返回的错误结构没有统一标准
    /// </summary>
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