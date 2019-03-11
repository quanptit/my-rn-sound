import { NativeModules, NativeEventEmitter } from "react-native";
// @ts-ignore
import Tts from 'react-native-tts';
import RNSound from "./RNSound";
import { Toast } from "my-rn-base-component";
import { isEmpty, RNCommonUtils, sendError } from "my-rn-base-utils";
let TTS_LANGUAGE_CODE;
/**Component sử dụng phải viết
 *     componentWillUnmount() {
            AppPlaySoundUtils.removeComponent(this)
        }
 * */
export class AppPlaySoundUtils {
    static playSound(component, audioPath, isFromResourceDir = false) {
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
                return;
            }
            this.currentSound && this.currentSound.play(this.callbackPlayComplete.bind(this));
        }, isFromResourceDir);
    }
    static playSoundWithNoComponent(audioFullPath, isFromResourceDir, callbackPlayComplete) {
        this.initSoundEvent();
        console.log("Play audio: " + audioFullPath);
        this.currentSound = new RNSound(audioFullPath, null, (error, props) => {
            if (error != undefined) {
                callbackPlayComplete(false);
                console.log('failed to load the sound', error);
                return;
            }
            this.currentSound && this.currentSound.play(callbackPlayComplete);
        }, isFromResourceDir);
    }
    static playAudioOrUsingTTS(component, audioPath, voca, isFromResourceDir = false) {
        console.log("playAudioOrUsingTTS: ", audioPath, voca, "isFromResourceDir: " + isFromResourceDir);
        if (!isEmpty(audioPath)) {
            this.playSound(component, audioPath, isFromResourceDir);
            return;
        }
        if (!isEmpty(voca))
            this.ttsPlaySound(component, voca);
    }
    /**
     * Android: => Trong thư mục Asset
     * IOS: => Trong thư mục gốc của project
     * */
    static playSoundFromAssetFolder(subPath) {
        RNCommonUtils.playSoundAssetFile(subPath, 1);
    }
    /**en-US*/
    static setTTS_LANGUAGE_CODE(ttsLanguageCode) {
        TTS_LANGUAGE_CODE = ttsLanguageCode;
    }
    static _initTTS() {
        if (this.hasInitTTS)
            return;
        this.hasInitTTS = true;
        if (TTS_LANGUAGE_CODE == null)
            sendError("TTS_LANGUAGE_CODE==null");
        Tts.setDefaultLanguage(TTS_LANGUAGE_CODE || "en-US");
        Tts.addEventListener('tts-finish', (event) => this.callbackPlayComplete(true));
        Tts.addEventListener('tts-cancel', (event) => this.callbackPlayComplete(false));
    }
    static ttsPlaySound(component, text) {
        this._initTTS();
        this.releaseAll();
        this.currentComponent = component;
        this.currentComponent && this.currentComponent.setPlayingState(true);
        try {
            console.log("Play audio ttsPlaySound: " + text);
            Tts.speak(text);
        }
        catch (e) {
            sendError(e);
        }
    }
    //endregion
    static initSoundEvent() {
        if (this.hasInitSoundEvent)
            return;
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
    static callbackPlayComplete(success) {
        console.log("callbackPlayComplete success: ", success);
        if (this.currentComponent) {
            this.currentComponent.setPlayingState(false);
        }
        else {
            this.relseaseSound();
        }
    }
    static removeComponent(component) {
        if (component === this.currentComponent) {
            this.currentComponent = null;
            this.relseaseSound();
        }
    }
    static releaseAll(callbackComplete) {
        this.currentComponent && this.currentComponent.setPlayingState(false);
        this.currentComponent = null;
        return this.relseaseSound(callbackComplete);
    }
    static relseaseSound(callbackComplete) {
        console.log("Release sound");
        if (this.currentSound != undefined) {
            this.currentSound.release(callbackComplete);
            this.currentSound = null;
        }
        else
            callbackComplete && callbackComplete();
        if (this.hasInitTTS) {
            this.hasInitTTS = undefined;
            Tts.stop();
        }
    }
}
