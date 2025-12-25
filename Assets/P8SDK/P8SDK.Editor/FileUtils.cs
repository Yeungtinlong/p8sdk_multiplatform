using System;
using System.IO;
using UnityEngine;

namespace P8SDK.Editor
{
    public static class FileUtils
    {
        public static string GetFileDirectory(string filePath)
        {
            if (!filePath.Contains(Path.DirectorySeparatorChar)) throw new Exception($"不合法的文件路径 {filePath}");
            return filePath.Substring(0, filePath.LastIndexOf(Path.DirectorySeparatorChar));
        }

        /// <summary>
        /// 移动目录到目标目录下，如果目标目录的父级不存在，则创建父级
        /// </summary>
        /// <param name="srcDirPath"></param>
        /// <param name="dstDirPath"></param>
        /// <param name="moveMetaFile"></param>
        public static void MoveDirectoryAndCreateParentIfNotExists(string srcDirPath, string dstDirPath, bool moveMetaFile)
        {
            string parent = dstDirPath.Substring(0, dstDirPath.LastIndexOf(Path.DirectorySeparatorChar));
            if (!Directory.Exists(parent))
            {
                Directory.CreateDirectory(parent);
            }

            Directory.Move(srcDirPath, dstDirPath);
            if (moveMetaFile && File.Exists($"{srcDirPath}.meta"))
                File.Move($"{srcDirPath}.meta", $"{dstDirPath}.meta");
        }

        /// <summary>
        /// 复制文件到目标目录下，如果目标目录的父级不存在，则创建父级
        /// </summary>
        /// <param name="srcFilePath"></param>
        /// <param name="dstFilePath"></param>
        public static void CopyFileAndCreateParentIfNotExists(string srcFilePath, string dstFilePath)
        {
            if (!Directory.Exists(GetFileDirectory(dstFilePath)))
                Directory.CreateDirectory(GetFileDirectory(dstFilePath));

            File.Copy(srcFilePath, dstFilePath);
        }

        /// <summary>
        /// 获取 Application.dataPath 目录
        /// </summary>
        /// <returns></returns>
        public static string GetAssetsPath()
        {
            return Application.dataPath.Replace('/', Path.DirectorySeparatorChar);
        }

        /// <summary>
        /// 获取 Application.streamingAssetsPath 目录
        /// </summary>
        /// <returns></returns>
        public static string GetStreamingAssetsPath()
        {
            return Application.streamingAssetsPath.Replace('/', Path.DirectorySeparatorChar);
        }
    }
}