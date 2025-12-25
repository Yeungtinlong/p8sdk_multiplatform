namespace P8SDK.Editor
{
    public interface IPlatform
    {
        string PlatformName { get; }
        bool Init();
        void SwitchOn();
        void SwitchOff();
    }
}