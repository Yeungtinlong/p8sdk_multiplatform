using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using P8SDKWeChat;
using UnityEditor;
using UnityEngine;

namespace P8SDK.Editor
{
    public class P8SDKEditorTools
    {
        [MenuItem("P8SDK/初始化P8SDK")]
        public static void P8SDKInitialize()
        {
            // 搜索P8SDK根目录
            var assetRootPath = Directory.CreateDirectory($"{Application.dataPath}");
            var p8sdkRootPath = Directory.GetDirectories(assetRootPath.FullName, "P8SDK", SearchOption.AllDirectories);
            if (p8sdkRootPath.Length != 1)
            {
                Debug.LogError("存在多个P8SDK目录，初始化失败。");
                return;
            }

            // 搜索js文件
            List<string> p8sdkFiles =
                Directory.GetFiles(p8sdkRootPath[0], "p8sdk*.js", SearchOption.AllDirectories).ToList();
            if (p8sdkFiles.Count < 2)
            {
                Debug.LogError("P8SDK内容缺失，请删除并重新导入。");
                return;
            }

            // 移除版本不符的sdk，避免重复导入
            Regex regex = new Regex(@"(p8sdk-wechat-)(.*?)(\.js)");
            for (int i = 0; i < p8sdkFiles.Count(); i++)
            {
                Match match = regex.Match(p8sdkFiles[i]);
                if (match.Success)
                {
                    // foreach (Group group in match.Groups)
                    // {
                    //     Debug.Log($"group name:{group.Name}, value:{group.Value}");    
                    // }
                    if (match.Groups[2].Value != P8SDKManager.VERSION)
                    {
                        File.Delete(p8sdkFiles[i]);
                        if (File.Exists($"{p8sdkFiles[i]}.meta"))
                        {
                            File.Delete($"{p8sdkFiles[i]}.meta");
                        }

                        p8sdkFiles[i] = null;
                    }
                }
            }

            p8sdkFiles.RemoveAll(string.IsNullOrEmpty);

            // 搜索wx目标文件夹
            string[] wechatScriptsDir = Directory.GetDirectories(assetRootPath.FullName, "wechat-default",
                SearchOption.AllDirectories);
            if (wechatScriptsDir.Length != 1)
            {
                Debug.LogError("WXSDK内容缺失，请删除并重新导入。");
                return;
            }

            // 删除已存在的旧文件
            string[] wechatScriptsFiles = Directory.GetFiles(wechatScriptsDir[0], "p8sdk*.js", searchOption: SearchOption.AllDirectories);
            foreach (var wechatScriptsFile in wechatScriptsFiles)
            {
                File.Delete(wechatScriptsFile);
                if (File.Exists($"{wechatScriptsFile}.meta"))
                {
                    File.Delete($"{wechatScriptsFile}.meta");
                }

                // Debug.Log($"已删除 {wechatScriptsFile}.");
            }

            try
            {
                List<string> p8sdkFileNames = new List<string>();
                foreach (var p8sdkFile in p8sdkFiles)
                {
                    p8sdkFileNames.Add(Path.GetFileNameWithoutExtension(p8sdkFile));
                    File.Copy(p8sdkFile, Path.Combine(wechatScriptsDir[0], Path.GetFileName(p8sdkFile)), true);
                }

                StringBuilder stringBuilder = new StringBuilder();
                foreach (var p8SDKFileName in p8sdkFileNames)
                {
                    stringBuilder.Append($"require('./{p8SDKFileName}');\n");
                }

                File.WriteAllText(Path.Combine(wechatScriptsDir[0], "p8sdk.js"), stringBuilder.ToString());
            }
            catch (Exception e)
            {
                Debug.LogError($"复制sdk到wechat-default目录失败，请检查原因。 {e}");
                return;
            }

            string gamejsPath = Path.Combine(wechatScriptsDir[0], "game.js");

            if (!File.Exists(gamejsPath))
            {
                Debug.LogError("game.js文件不存在，WXSDK内容缺失，请删除并重新导入。");
                return;
            }

            try
            {
                string gamejsContent = File.ReadAllText(gamejsPath);
                if (gamejsContent.Contains("require('./p8sdk');"))
                {
                    // Debug.Log("P8SDK已require在game.js中。");
                }
                else
                {
                    File.WriteAllText(gamejsPath, $"require('./p8sdk');\n{gamejsContent}");
                }
            }
            catch (Exception e)
            {
                Debug.LogError("引入p8sdk到game.js失败，请自行添加require('./p8sdk');");
                return;
            }

            AssetDatabase.Refresh();
            Debug.Log("初始化P8SDK成功。");
        }
    }
}