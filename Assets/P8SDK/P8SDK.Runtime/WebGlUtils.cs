using System;
using System.Collections.Generic;
using P8SDKSpace.LitJson;

namespace P8SDKSpace
{
    internal static class WebGlUtils
    {
        private static readonly Dictionary<string, CallbackPack> _callbackDict = new Dictionary<string, CallbackPack>();

        private static string GetMsgId()
        {
            Guid guid = Guid.NewGuid();
            return guid.ToString();
        }

        private static string GetCallbackId()
        {
            Guid guid = Guid.NewGuid();
            return guid.ToString();
        }

        internal static void HandleMsgFromNative(string msg)
        {
            JsonData res = JsonMapper.ToObject(msg);
            P8SDK.Log($"[HandleMsgFromNative] >>>> {msg}");

            string callbackId = res["callbackId"].ToString();
            string callbackType = res["callbackType"]?.ToString();
            if (!_callbackDict.ContainsKey(callbackId))
            {
                P8SDK.Log($"[HandleMsgFromNative] >>>> Cannot find callbackId: {callbackId}.");
                return;
            }

            try
            {
                JsonData obj = res.GetValueOrDefault("data");
                _callbackDict[callbackId]?.callbackHandler?.Invoke(_callbackDict[callbackId].args, obj, callbackType);
            }
            catch (Exception e)
            {
                P8SDK.Log($"[HandleMsgFromNative Exception] >>>> {e.Message}");
            }
            finally
            {
                if (callbackType == "success" || callbackType == "fail" || callbackType == "complete" || callbackType == "close")
                    _callbackDict.Remove(callbackId);
            }
        }

        private static JsonData PacketCallMsg(string callTarget, JsonData[] callArgs = null, string callbackId = null)
        {
            JsonData jsonData = new JsonData();
            jsonData["callTarget"] = callTarget;
            if (callbackId != null)
            {
                jsonData["callbackId"] = callbackId;
            }

            if (callArgs != null && callArgs.Length > 0)
            {
                JsonData argsArray = new JsonData();
                foreach (JsonData arg in callArgs)
                {
                    argsArray.Add(arg);
                }

                jsonData["callArgs"] = argsArray;
            }

            return jsonData;
        }

        /// <summary>
        /// 异步Call通讯
        /// </summary>
        /// <param name="target">目标接口</param>
        /// <param name="callArgs">参数列表</param>
        /// <param name="callbackHandler"></param>
        /// <param name="args"></param>
        internal static void CallNative(string target, JsonData[] callArgs, CallbackHandler callbackHandler, object args)
        {
            string callbackId = GetCallbackId();
            JsonData jsonData = PacketCallMsg(target, callArgs, callbackId);
            _callbackDict.Add(callbackId, new CallbackPack(callbackHandler, args));
            WebGlInterface.UnityCallJsAsync(jsonData.ToJson());
        }

        internal static void CallNative(string target, params JsonData[] callArgs)
        {
            string callbackId = GetCallbackId();
            JsonData jsonData = PacketCallMsg(target, callArgs, callbackId);
            WebGlInterface.UnityCallJsAsync(jsonData.ToJson());
        }
    }
}