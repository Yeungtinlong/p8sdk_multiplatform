using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using UnityEditor;
using UnityEngine;

namespace P8SDK.Editor
{
    public static class P8SDKEditorTools
    {
        private static string k_ttDstFullPath => Path.Combine(Application.streamingAssetsPath, "__cp_js_files");
        private static List<string> k_wxSDKDirNames = new List<string>() { "WX-WASM-SDK-V2", "WebGLTemplates" };

        private static string GetFullPathByPatternUnderAssets(string pattern)
        {
            var targetPath = Directory.GetDirectories(Application.dataPath, pattern, SearchOption.AllDirectories);
            if (targetPath.Length != 1)
            {
                Debug.LogError("存在多个目标目录。");
                return null;
            }

            return targetPath[0];
        }

        private static List<string> GetFilesByRootPath(string rootPath, string pattern)
        {
            return Directory.GetFiles(rootPath, pattern, SearchOption.AllDirectories).ToList();
        }

        private static void DeleteFilesAndMetaFilesByPathAndPattern(string rootPath, string pattern)
        {
            string[] files = Directory.GetFiles(rootPath, pattern, searchOption: SearchOption.AllDirectories);
            foreach (var filePath in files)
            {
                File.Delete(filePath);
                if (File.Exists($"{filePath}.meta"))
                    File.Delete($"{filePath}.meta");
            }
        }

        private static void DeleteFilesAndMetaFilesByRegex(List<string> filePaths, Regex regex, Predicate<Match> filter)
        {
            for (int i = 0; i < filePaths.Count; i++)
            {
                Match match = regex.Match(filePaths[i]);
                if (match.Success)
                {
                    if (filter(match))
                    {
                        File.Delete(filePaths[i]);
                        if (File.Exists($"{filePaths[i]}.meta"))
                        {
                            File.Delete($"{filePaths[i]}.meta");
                        }

                        filePaths[i] = null;
                    }
                }
            }

            filePaths.RemoveAll(string.IsNullOrEmpty);
        }

        private static void CopyFilesToDstPath(List<string> files, string dstPath, bool overwrite = true)
        {
            foreach (var fileFullName in files)
            {
                File.Copy(fileFullName, Path.Combine(dstPath, Path.GetFileName(fileFullName)), overwrite);
            }
        }

        private static void CreateP8SDKRequireFileThenRequire(List<string> filesToRequire, string dstPath)
        {
            List<string> fileNamesWithoutExtension = filesToRequire.Select(Path.GetFileNameWithoutExtension).ToList();

            StringBuilder requires = new StringBuilder();
            foreach (var p8SDKFileName in fileNamesWithoutExtension)
                requires.Append($"require('./{p8SDKFileName}');\n");

            // 创建p8sdk.js，require其它所有p8sdk相关的文件
            File.WriteAllText(Path.Combine(dstPath, "p8sdk.js"), requires.ToString());
        }

        private static void ReplaceMarco(string scriptFileName, string marcoFrom, string marcoTo)
        {
            string filePath = GetFilesByRootPath(Application.dataPath, scriptFileName).First();
            string content = File.ReadAllText(filePath);
            string newContent = content.Replace($"#define {marcoFrom}", $"#define {marcoTo}");
            File.WriteAllText(filePath, newContent);
        }

        // [MenuItem("P8SDK/备份微信SDK")]
        public static void BackupWxSDK()
        {
            if (k_wxSDKDirNames.Any(p => !Directory.Exists(Path.Combine(Application.dataPath, p))))
            {
                Debug.Log("微信SDK环境不存在或损坏");
                return;
            }

            string dstRootFullPath = Path.Combine(Application.dataPath, "..", "GameSDK");
            if (!Directory.Exists(dstRootFullPath)) Directory.CreateDirectory(dstRootFullPath);

            foreach (var dirName in k_wxSDKDirNames)
            {
                string srcFullPath = Path.Combine(Application.dataPath, dirName);
                string dstFullPath = Path.Combine(dstRootFullPath, dirName);

                Directory.Move(srcFullPath, dstFullPath);
                File.Move($"{srcFullPath}.meta", $"{dstFullPath}.meta");
            }

            AssetDatabase.Refresh();
        }

        // [MenuItem("P8SDK/还原微信SDK")]
        public static void MoveBackWxSDK()
        {
            string backupPath = Path.Combine(Application.dataPath, "..", "GameSDK");
            if (!Directory.Exists(backupPath))
            {
                Debug.Log("没有备份WxSDK");
                return;
            }

            string sdkTargetPath = Path.Combine(Application.dataPath, "WX-WASM-SDK-V2");
            string templateTargetPath = Path.Combine(Application.dataPath, "WebGLTemplates");
            Directory.Move(Path.Combine(backupPath, "WX-WASM-SDK-V2"), sdkTargetPath);
            File.Move($"{Path.Combine(backupPath, "WX-WASM-SDK-V2")}.meta", $"{sdkTargetPath}.meta");
            Directory.Move(Path.Combine(backupPath, "WebGLTemplates"), templateTargetPath);
            File.Move($"{Path.Combine(backupPath, "WebGLTemplates")}.meta", $"{templateTargetPath}.meta");
            AssetDatabase.Refresh();
        }

        // [MenuItem("P8SDK/备份抖音SDK")]
        public static void BackupTTSDK()
        {
            string sdkPath = GetFullPathByPatternUnderAssets("ByteGame");
            if (!Directory.Exists(sdkPath))
            {
                Debug.Log("抖音SDK环境不存在");
                return;
            }

            string targetPath = Path.Combine(Application.dataPath, "..", "GameSDK");
            if (!Directory.Exists(targetPath)) Directory.CreateDirectory(targetPath);
            Directory.Move(sdkPath, Path.Combine(targetPath, "ByteGame"));
            File.Move($"{sdkPath}.meta", $"{Path.Combine(targetPath, "ByteGame")}.meta");
            AssetDatabase.Refresh();
        }

        // [MenuItem("P8SDK/还原抖音SDK")]
        public static void MoveBackTTSDK()
        {
            string backupPath = Path.Combine(Application.dataPath, "..", "GameSDK");
            if (!Directory.Exists(backupPath))
            {
                Debug.Log("没有备份抖音SDK");
                return;
            }

            string sdkTargetPath = Path.Combine(Application.dataPath, "Plugins", "ByteGame");

            Directory.Move(Path.Combine(backupPath, "ByteGame"), sdkTargetPath);
            File.Move($"{Path.Combine(backupPath, "ByteGame")}.meta", $"{sdkTargetPath}.meta");

            AssetDatabase.Refresh();
        }

        // [MenuItem("P8SDK/[切换]>>>抖音SDK环境")]
        public static void ConvertToTTSDKEnvironment()
        {
            if (GetFullPathByPatternUnderAssets("ByteGame") != null)
            {
                Debug.Log("Assets已存在抖音SDK的目录，已经在微信SDK环境中");
                return;
            }

            BackupWxSDK();
            MoveBackTTSDK();
            P8SDKInitializeTT();
            ReplaceMarco("P8SDKPanelUI.cs", "P8SDK_WX", "P8SDK_TT");
            PlayerSettings.WebGL.template = "APPLICATION:Default";
        }

        // [MenuItem("P8SDK/[切换]>>>微信SDK环境")]
        public static void ConvertToWxSDKEnvironment()
        {
            if (k_wxSDKDirNames.Any(n => GetFullPathByPatternUnderAssets(n) != null))
            {
                Debug.Log("Assets已存在微信SDK的目录，已经在微信SDK环境中");
                return;
            }

            BackupTTSDK();
            MoveBackWxSDK();
            P8SDKInitializeWx();
            ReplaceMarco("P8SDKPanelUI.cs", "P8SDK_TT", "P8SDK_WX");
            PlayerSettings.WebGL.template = "PROJECT:WXTemplate2022";
        }

        [MenuItem("P8SDK/初始化P8SDK>>[抖音]")]
        public static void P8SDKInitializeTT()
        {
            var p8sdkRootPath = GetFullPathByPatternUnderAssets("P8SDK");

            // 搜索js文件
            List<string> p8sdkFiles = GetFilesByRootPath(p8sdkRootPath, "p8sdk-tt*.js");
            if (p8sdkFiles.Count < 2)
            {
                Debug.LogError("P8SDK内容缺失，请删除并重新导入。");
                return;
            }

            if (!Directory.Exists(k_ttDstFullPath)) Directory.CreateDirectory(k_ttDstFullPath);
            DeleteFilesAndMetaFilesByPathAndPattern(k_ttDstFullPath, "p8sdk*.js");
            CopyFilesToDstPath(p8sdkFiles, k_ttDstFullPath);
            Debug.Log("初始化P8SDK抖音，成功。");
            AssetDatabase.Refresh();
        }

        private static void CleanP8SDKInitializeTT()
        {
            if (Directory.Exists(k_ttDstFullPath))
            {
                Directory.Delete(k_ttDstFullPath, true);
                if (File.Exists($"{k_ttDstFullPath}.meta"))
                    File.Delete($"{k_ttDstFullPath}.meta");
            }
        }

        [MenuItem("P8SDK/初始化P8SDK>>[微信]")]
        public static void P8SDKInitializeWx()
        {
            CleanP8SDKInitializeTT();

            // 搜索P8SDK根目录
            var p8sdkRootPath = GetFullPathByPatternUnderAssets("P8SDK");

            // 搜索js文件
            List<string> p8sdkFiles = GetFilesByRootPath(p8sdkRootPath, "p8sdk-wechat*.js");
            if (p8sdkFiles.Count < 2)
            {
                Debug.LogError("P8SDK内容缺失，请删除并重新导入。");
                return;
            }

            // 搜索wx目标文件夹
            string wechatScriptsDir = GetFullPathByPatternUnderAssets("wechat-default");
            string gamejsPath = Path.Combine(wechatScriptsDir, "game.js");
            if (!File.Exists(gamejsPath))
            {
                Debug.LogError("game.js文件不存在，WXSDK内容缺失，请删除并重新导入。");
                return;
            }
            
            // 复制sdk文件到目标目录
            CopyFilesToDstPath(p8sdkFiles, wechatScriptsDir);
            // 在目标目录创建require文件
            CreateP8SDKRequireFileThenRequire(p8sdkFiles, wechatScriptsDir);

            try
            {
                string gamejsContent = File.ReadAllText(gamejsPath);
                if (!gamejsContent.Contains("require('./p8sdk');"))
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
            Debug.Log("初始化P8SDK微信，成功。");
        }
    }
}