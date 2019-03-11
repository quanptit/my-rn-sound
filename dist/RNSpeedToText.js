import { NativeModules } from 'react-native';
import { AppPlaySoundUtils } from './AppPlaySoundUtils';
import { getStringsCommon } from "my-rn-common-resource";
import { isIOS, RNAppUtils } from "my-rn-base-utils";
import { DialogUtils } from "my-rn-base-component";
let RNSpeedToText = NativeModules.RNSpeedToText;
export default {
    isHasPermisionLuyenNoi: false,
    initAndRequestPermisionAndShowDialogIfError() {
        if (this.isHasPermisionLuyenNoi)
            return undefined;
        this.isHasPermisionLuyenNoi = true;
        return new Promise(function (resolve, reject) {
            RNSpeedToText.initAndRequestPermision((isSuccess, errorMessage, errorCode) => {
                if (isSuccess)
                    resolve();
                else {
                    if (isIOS())
                        DialogUtils.showInfoDialog("ERROR", errorMessage, {
                            text: getStringsCommon().Ok.toUpperCase(), onPress: () => {
                                if (errorCode === 1) {
                                    RNAppUtils.IOS_openAppSetting();
                                }
                            }
                        });
                    reject(errorMessage);
                }
            });
        });
    },
    startRecording() {
        AppPlaySoundUtils.releaseAll(() => {
            RNSpeedToText.startRecording();
        });
        console.log("RNSpeedToText startRecording");
    },
    stopAndRelease(iSetAVAudioSessionCategoryPlayback) {
        if (isIOS())
            return RNSpeedToText.stopAndRelease(iSetAVAudioSessionCategoryPlayback);
        else
            return RNSpeedToText.stopAndRelease();
    },
    setAudioCategoryRecord() {
        RNSpeedToText.setAudioCategoryRecord();
    }
};
