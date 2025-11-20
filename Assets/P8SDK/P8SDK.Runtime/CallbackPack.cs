using P8SDKSpace.LitJson;

namespace P8SDKSpace
{
    /// <summary>
    /// 用于处理从Native的回调的函数
    /// <param name="args">调用者需要在被回调时使用的参数</param>
    /// <param name="callbackData">Native传回的参数</param>
    /// <param name="callbackType">Callback类型，常见有"success", "fail", "close", "complete"等</param>
    /// </summary>
    public delegate void CallbackHandler(object args, JsonData callbackData, string callbackType = null);
    
    public class CallbackPack
    {
        public CallbackHandler callbackHandler;
        public object args;

        public CallbackPack(CallbackHandler callbackHandler, object args)
        {
            this.callbackHandler = callbackHandler;
            this.args = args;
        }
    }
}