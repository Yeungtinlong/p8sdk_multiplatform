using System.Runtime.InteropServices;
namespace P8SDKWeChat
{
    internal static class WebGlInterface
    {
#if (UNITY_WEBPLAYER || UNITY_WEBGL)
        [DllImport("__Internal", EntryPoint = "UnityCallJsAsync")]
        internal static extern void UnityCallJsAsync(string msg);
        
        [DllImport("__Internal", EntryPoint = "UnityCallJsSync")]
        internal static extern string UnityCallJsSync(string msg);
        
        [DllImport("__Internal", EntryPoint = "P8Log")]
        internal static extern void P8Log(string msg);
#endif
    }
}