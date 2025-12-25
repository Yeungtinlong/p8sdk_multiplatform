using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using UnityEditor;
using UnityEngine;

namespace P8SDK.Editor
{
    public static class P8SDKEditorTools
    {
        private static List<string> GetFilesByRootPath(string rootPath, string pattern)
        {
            return Directory.GetFiles(rootPath, pattern, SearchOption.AllDirectories).ToList();
        }

        public static void ReplaceP8SDKMarco(string scriptFileName, string newPlatform)
        {
            string filePath = GetFilesByRootPath(Application.dataPath, scriptFileName).First();
            string content = File.ReadAllText(filePath);
            Regex regex = new Regex(@"#define (P8SDK_\w+)");
            File.WriteAllText(filePath, regex.Replace(content, $"#define P8SDK_{newPlatform}"));
        }

        [MenuItem("P8SDK/[切换] >>> 抖音SDK环境")]
        public static void ConvertToTTSDKEnvironment()
        {
            if (!EditorUtility.DisplayDialog("[切换MiniGameSDK环境]", "确认切换到\"抖音SDK环境\"？其它环境的SDK文件目录将会备份到\"<项目目录>/Platform@SDK\"下", "确认", "取消"))
                return;
            
            new WXPlatform().SwitchOff();
            new TTPlatform().SwitchOn();
            AssetDatabase.Refresh();
            Debug.Log("已切换 >>> 抖音SDK环境");
        }

        [MenuItem("P8SDK/[切换] >>> 微信SDK环境")]
        public static void ConvertToWxSDKEnvironment()
        {
            if (!EditorUtility.DisplayDialog("[切换MiniGameSDK环境]", "确认切换到\"微信SDK环境\"？其它环境的SDK文件目录将会备份到\"<项目目录>/Platform@SDK\"下", "确认", "取消"))
                return;
            
            new TTPlatform().SwitchOff();
            new WXPlatform().SwitchOn();
            AssetDatabase.Refresh();
            Debug.Log("已切换 >>> 微信SDK环境");
        }

        [MenuItem("P8SDK/[初始化] >>> P8SDK抖音")]
        public static void P8SDKInitializeTT()
        {
            IPlatform platform = new TTPlatform();
            platform.Init();
            Debug.Log($"初始化 {platform.PlatformName} 成功。");
        }

        [MenuItem("P8SDK/[初始化] >>> P8SDK微信")]
        public static void P8SDKInitializeWx()
        {
            IPlatform platform = new WXPlatform();
            platform.Init();
            Debug.Log($"初始化 {platform.PlatformName} 成功。");
        }
    }
}