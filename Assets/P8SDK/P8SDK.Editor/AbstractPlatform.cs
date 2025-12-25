using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEngine;

namespace P8SDK.Editor
{
    public abstract class AbstractPlatform : IPlatform
    {
        public abstract string PlatformName { get; }
        public abstract List<string> BackupDirsRelateToAssetsPath { get; }
        public abstract List<PathPair> CopyFilesRelateToAssetsPathWhenOn { get; }
        public virtual List<string> DeleteFilesRelateToAssetsPathWhenOff { get; }

        protected string _backupDirName => $"{PlatformName}@SDK";
        protected string _backupPath => Path.Combine(FileUtils.GetAssetsPath(), "..", "Platform@SDK", _backupDirName);

        public abstract bool Init();

        public void SwitchOn()
        {
            if (!Directory.Exists(_backupPath))
            {
                Debug.Log($"备份目录 {_backupDirName} 不存在，将会只执行初始化");
            }

            RecoverDirs();
            CopyFiles();
            Init();

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
        }

        public void SwitchOff()
        {
            if (!Directory.Exists(_backupPath))
                Directory.CreateDirectory(_backupPath);

            BackupDirs();
            DeleteFiles();

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
        }

        protected void RecoverDirs()
        {
            foreach (var path in BackupDirsRelateToAssetsPath)
            {
                string srcPath = Path.Combine(_backupPath, path);
                if (!Directory.Exists(srcPath)) continue;

                string dstPath = Path.Combine(FileUtils.GetAssetsPath(), path);
                FileUtils.MoveDirectoryAndCreateParentIfNotExists(srcPath, dstPath, true);
            }
        }

        protected void CopyFiles()
        {
            foreach (var filePair in CopyFilesRelateToAssetsPathWhenOn)
            {
                string from = Path.Combine(FileUtils.GetAssetsPath(), filePair.from);
                string to = Path.Combine(FileUtils.GetAssetsPath(), filePair.to);
                
                if (File.Exists(to))
                    File.Delete(to);

                FileUtils.CopyFileAndCreateParentIfNotExists(from, to);
            }
        }

        protected void BackupDirs()
        {
            foreach (var path in BackupDirsRelateToAssetsPath)
            {
                string srcDir = Path.Combine(FileUtils.GetAssetsPath(), path);
                if (!Directory.Exists(srcDir))
                    continue;

                string dstDir = Path.Combine(_backupPath, path);
                FileUtils.MoveDirectoryAndCreateParentIfNotExists(srcDir, dstDir, true);
            }
        }

        protected void DeleteFiles()
        {
            if (DeleteFilesRelateToAssetsPathWhenOff == null || DeleteFilesRelateToAssetsPathWhenOff.Count == 0)
                return;

            foreach (var deleteFile in DeleteFilesRelateToAssetsPathWhenOff)
            {
                string deleteFileFullName = Path.Combine(FileUtils.GetAssetsPath(), deleteFile);
                if (File.Exists(deleteFileFullName))
                    File.Delete(deleteFileFullName);
            }
        }
    }
}