import { NativeModules } from 'react-native';
import { isIOS } from "my-rn-base-utils";
const RNSound = NativeModules.RNSound;
let nextKey = 0;
function isRelativePath(path) {
    return !/^\//.test(path);
}
export default class Sound {
    /**Nếu truyền null basePath => Sẽ giữ nguyên fileName. thành địa chỉ của audio
     * callback(error, props)
     * basePath: RNSound.MAIN_BUNDLE => IOS là thư mục gốc của project
     * isStaticSound: Sử dụng cho bên ios. Sẽ dùng cái AVPlayer mặc định => sound không bị release khi play xong
     */
    constructor(filename, isStaticSound, callback, isFromResourceDir = false) {
        this.MAIN_BUNDLE = RNSound.MainBundlePath;
        this._filename = filename;
        if (this._filename.startsWith("file://")) {
            this._filename = this._filename.replace("file://", "");
        }
        this._loaded = false;
        this._key = nextKey++;
        this._duration = -1;
        this._numberOfChannels = -1;
        this._volume = 1;
        this._pan = 0;
        this._numberOfLoops = 0;
        this._speed = 1;
        let prepareComplete = (error, props) => {
            if (props) {
                if (typeof props.duration === 'number') {
                    this._duration = props.duration;
                }
                if (typeof props.numberOfChannels === 'number') {
                    this._numberOfChannels = props.numberOfChannels;
                }
            }
            if (error == null) {
                this._loaded = true;
            }
            callback && callback(error, props);
        };
        if (isIOS()) {
            if (isFromResourceDir)
                isStaticSound = true;
            RNSound.prepare(this._filename, this._key, isStaticSound === true ? 1 : 0, isFromResourceDir === true ? 1 : 0, (error, props) => {
                prepareComplete(error, props);
            });
        }
        else
            RNSound.prepare(this._filename, this._key, isFromResourceDir, (error, props) => {
                prepareComplete(error, props);
            });
    }
    setLooping(isLooping) {
        if (this._loaded) {
            if (isIOS()) {
                // this.setNumberOfLoops(-1);
                RNSound.setNumberOfLoops(this._key, -1);
            }
            else
                RNSound.setLooping(this._key, isLooping);
        }
    }
    getFilePath() {
        return this._filename;
    }
    isLoaded() {
        return this._loaded;
    }
    play(onEnd) {
        if (this._loaded) {
            RNSound.play(this._key, (successfully) => {
                onEnd && onEnd(successfully);
            });
        }
        return this;
    }
    pause() {
        if (this._loaded) {
            RNSound.pause(this._key);
        }
        return this;
    }
    stop() {
        if (this._loaded) {
            RNSound.stop(this._key);
        }
        return this;
    }
    release(callbackComplete) {
        if (!callbackComplete) {
            callbackComplete = () => {
            };
        }
        RNSound.release(this._key, callbackComplete);
        return this;
    }
    getDuration() {
        return this._duration;
    }
    getNumberOfChannels() {
        return this._numberOfChannels;
    }
    getVolume() {
        return this._volume;
    }
    setVolume(value) {
        this._volume = value;
        if (this._loaded) {
            if (!isIOS()) {
                RNSound.setVolume(this._key, value, value);
            }
            else {
                RNSound.setVolume(this._key, value);
            }
        }
        return this;
    }
    getPan() {
        return this._pan;
    }
    setPan(value) {
        if (this._loaded) {
            RNSound.setPan(this._key, this._pan = value);
        }
        return this;
    }
    getNumberOfLoops() {
        return this._numberOfLoops;
    }
    setNumberOfLoops(value) {
        this._numberOfLoops = value;
        if (this._loaded) {
            if (!isIOS()) {
                RNSound.setLooping(this._key, !!value);
            }
            else {
                RNSound.setNumberOfLoops(this._key, value);
            }
        }
        return this;
    }
    setSpeed(value) {
        this._speed = value;
        if (this._loaded) {
            if (isIOS()) {
                RNSound.setSpeed(this._key, value);
            }
        }
        return this;
    }
    getCurrentTime(callback) {
        if (this._loaded) {
            RNSound.getCurrentTime(this._key, callback);
        }
    }
    setCurrentTime(value) {
        if (this._loaded) {
            RNSound.setCurrentTime(this._key, value);
        }
        return this;
    }
    setCategory(value, mixWithOthers = false) {
        if (isIOS()) {
            RNSound.setCategory(value, mixWithOthers);
        }
    }
    enable(enabled) {
        RNSound.enable(enabled);
    }
    enableInSilenceMode(enabled) {
        if (isIOS()) {
            RNSound.enableInSilenceMode(enabled);
        }
    }
}
