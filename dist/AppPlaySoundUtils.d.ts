/**Component sử dụng phải viết
 *     componentWillUnmount() {
            AppPlaySoundUtils.removeComponent(this)
        }
 * */
export declare class AppPlaySoundUtils {
    private static currentComponent;
    private static currentSound;
    private static hasInitSoundEvent;
    static playSound(component: IPlaySoundComponent, audioPath: string, isFromResourceDir?: boolean): void;
    static playSoundWithNoComponent(audioFullPath: string, isFromResourceDir: boolean, callbackPlayComplete: any): void;
    static playAudioOrUsingTTS(component?: IPlaySoundComponent, audioPath?: string, voca?: string, isFromResourceDir?: boolean): void;
    /**
     * Android: => Trong thư mục Asset
     * IOS: => Trong thư mục gốc của project
     * */
    static playSoundFromAssetFolder(subPath: string): void;
    private static hasInitTTS;
    /**en-US*/
    static setTTS_LANGUAGE_CODE(ttsLanguageCode: string): void;
    private static _initTTS;
    static ttsPlaySound(component: IPlaySoundComponent, text: string): void;
    private static initSoundEvent;
    private static callbackPlayComplete;
    static removeComponent(component: IPlaySoundComponent): void;
    static releaseAll(callbackComplete?: any): void;
    private static relseaseSound;
}
export interface IPlaySoundComponent {
    setPlayingState(isPlaying: boolean): any;
}
