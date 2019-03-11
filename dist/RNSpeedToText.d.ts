declare const _default: {
    isHasPermisionLuyenNoi: boolean;
    initAndRequestPermisionAndShowDialogIfError(): Promise<void>;
    startRecording(): void;
    stopAndRelease(iSetAVAudioSessionCategoryPlayback: number): Promise<void>;
    setAudioCategoryRecord(): void;
};
export default _default;
