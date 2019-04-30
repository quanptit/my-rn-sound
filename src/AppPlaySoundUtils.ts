import {NativeModules, NativeEventEmitter} from "react-native"
// @ts-ignore
import Tts from 'react-native-tts'
import RNSound from "./RNSound"
import {Toast} from "my-rn-base-component";
import {isEmpty, RNCommonUtils, sendError} from "my-rn-base-utils";
import {getStringsCommon} from "my-rn-common-resource";

let TTS_LANGUAGE_CODE;

/**Component sử dụng phải viết
 *     componentWillUnmount() {
            AppPlaySoundUtils.removeComponent(this)
        }
 * */
export class AppPlaySoundUtils {
    private static currentComponent: any;
    private static currentSound: RNSound;
    private static hasInitSoundEvent: boolean;

    static playSound(component: IPlaySoundComponent, audioPath: string, isFromResourceDir: boolean = false) {
        this.initSoundEvent();
        if (component === this.currentComponent) {
            if (this.currentSound != undefined && this.currentSound.getFilePath() === audioPath) {
                this.currentSound.play(this.callbackPlayComplete.bind(this));
                this.currentComponent && this.currentComponent.setPlayingState(true);
                return;
            }
        }
        this.releaseAll();
        this.currentComponent = component;
        this.currentComponent && this.currentComponent.setPlayingState(true);

        console.log("Play audio: " + audioPath);
        if (audioPath.startsWith("http")) {
            Toast.showShortBottom("Play sound online");
        }
        this.currentSound = new RNSound(audioPath, null, (error, props) => {
            if (error != undefined) {
                this.currentComponent && this.currentComponent.setPlayingState(false);
                console.log('failed to load the sound', error);
                return
            }
            this.currentSound && this.currentSound.play(this.callbackPlayComplete.bind(this));
        }, isFromResourceDir)
    }

    static playSoundWithNoComponent(audioFullPath: string, isFromResourceDir: boolean, callbackPlayComplete) {
        this.initSoundEvent();
        console.log("Play audio: " + audioFullPath);
        this.currentSound = new RNSound(audioFullPath, null, (error, props) => {
            if (error != undefined) {
                callbackPlayComplete(false);
                console.log('failed to load the sound', error);
                return
            }
            this.currentSound && this.currentSound.play(callbackPlayComplete)
        }, isFromResourceDir)
    }

    static playAudioOrUsingTTS(component?: IPlaySoundComponent, audioPath?: string, voca?: string, isFromResourceDir: boolean = false) {
        console.log("playAudioOrUsingTTS: ", audioPath, voca, "isFromResourceDir: " + isFromResourceDir);
        if (!isEmpty(audioPath)) {
            this.playSound(component, audioPath, isFromResourceDir);
            return
        }

        if (!isEmpty(voca))
            this.ttsPlaySound(component, voca);
    }

    /**
     * Android: => Trong thư mục Asset
     * IOS: => Trong thư mục gốc của project
     * */
    static playSoundFromAssetFolder(subPath: string) {
        RNCommonUtils.playSoundAssetFile(subPath, 1);
    }

    //region TTS =============
    private static hasInitTTS: boolean;

    /**en-US*/
    public static setTTS_LANGUAGE_CODE(ttsLanguageCode: string) {
        TTS_LANGUAGE_CODE = ttsLanguageCode;
    }

    private static _initTTS(callbackSuccess: VoidFunction) {
        if (this.hasInitTTS) {
            callbackSuccess();
            return;
        }
        if (TTS_LANGUAGE_CODE == null)
            sendError("TTS_LANGUAGE_CODE==null");
        Tts.getInitStatus().then(() => {
            this.hasInitTTS = true;
            Tts.setDefaultLanguage(TTS_LANGUAGE_CODE || "en-US");
            Tts.addEventListener('tts-finish', (event) => this.callbackPlayComplete(true));
            Tts.addEventListener('tts-cancel', (event) => this.callbackPlayComplete(false));
            callbackSuccess();
        }, (err) => {
            if (err.code === 'no_engine')
                try {
                    Tts.requestInstallEngine();
                } catch (e) {
                    Toast.showLongBottom(getStringsCommon().has_error);
                }
            else
                Toast.showLongBottom(getStringsCommon().has_error);
        });
    }

    static ttsPlaySound(component: IPlaySoundComponent, text: string) {
        this._initTTS(() => {
            this.releaseAll();
            this.currentComponent = component;
            this.currentComponent && this.currentComponent.setPlayingState(true);
            try {
                console.log("Play audio ttsPlaySound: " + text);
                Tts.speak(text)
            } catch (e) {
                sendError(e)
            }
        });
    }

    //endregion

    private static initSoundEvent() {
        if (this.hasInitSoundEvent) return;
        console.log("initSoundEvent");
        const mRNSoundModule = new NativeEventEmitter(NativeModules.RNSound);
        mRNSoundModule.addListener('PlayerStateChange', (event) => {
            let newState = event.state;
            if (newState === "error") {
                this.callbackPlayComplete(false);
            }
        });
        this.hasInitSoundEvent = true;
    }

    private static callbackPlayComplete(success) {
        console.log("callbackPlayComplete success: ", success);
        if (this.currentComponent) {
            this.currentComponent.setPlayingState(false);
        } else {
            this.relseaseSound();
        }
    }

    static removeComponent(component: IPlaySoundComponent) {
        if (component === this.currentComponent) {
            this.currentComponent = null;
            this.relseaseSound();
        }
    }

    static releaseAll(callbackComplete?) {
        this.currentComponent && this.currentComponent.setPlayingState(false);
        this.currentComponent = null;
        return this.relseaseSound(callbackComplete);
    }

    private static relseaseSound(callbackComplete?) {
        console.log("Release sound");
        if (this.currentSound != undefined) {
            this.currentSound.release(callbackComplete);
            this.currentSound = null;
        } else
            callbackComplete && callbackComplete();
        if (this.hasInitTTS) {
            this.hasInitTTS = undefined;
            Tts.stop();
        }
    }
}

export interface IPlaySoundComponent {
    setPlayingState(isPlaying: boolean);
}
