package com.my.rn.sound;

import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import com.appsharelib.KeysAds;
import com.baseLibs.BaseApplication;
import com.baseLibs.utils.BaseUtils;
import com.baseLibs.utils.CommonUtils;
import com.baseLibs.utils.DialogUtils;
import com.baseLibs.utils.L;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.util.ArrayList;


public class RNSpeedToText extends ReactContextBaseJavaModule implements RecognitionListener {
    private SpeechRecognizer mSpeechRecognizer;
    private Intent mSpeechRecognizerIntent;
    private boolean isRecording;

    public RNSpeedToText(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "RNSpeedToText";
    }

    @ReactMethod
    public void initAndRequestPermision(final Callback callback) { //callback(isSuccess, errorMessage, errorCode)
        if (!SpeechRecognizer.isRecognitionAvailable(getReactApplicationContext())) {
            L.d("Show Dialog: " + (getCurrentActivity() != null));
            DialogUtils.buildDialog(getCurrentActivity()).setMessage("Sorry! Your device doesn't support speech input")
                    .setNegativeButton("Close (x)", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialogInterface, int i) {
                            dialogInterface.dismiss();
                        }
                    })
                    .setPositiveButton("Add Speech Recognition Now", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialogInterface, int i) {
                            dialogInterface.dismiss();
                            DialogUtils.showInfoDialog(getReactApplicationContext(),
                                    "Hãy chạy ứng dụng Voice Search sau khi cài đặt ứng dụng của google",
                                    new DialogInterface.OnClickListener() {
                                        @Override
                                        public void onClick(DialogInterface dialogInterface, int i) {
                                            dialogInterface.dismiss();
                                            CommonUtils.openAppFromMarket(getCurrentActivity(), "com.google.android.googlequicksearchbox");
                                        }
                                    });
                        }
                    }).create().show();
            callback.invoke(false, "Your device doesn't support speech input", 0);
        } else
            callback.invoke(true);
    }

    @ReactMethod
    public void startRecording() {
        if (isRecording) return;
        isRecording = true;
        BaseApplication.getHandler().post(new Runnable() {
            @Override
            public void run() {
                if (mSpeechRecognizerIntent == null) {
                    mSpeechRecognizerIntent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                    mSpeechRecognizerIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                    mSpeechRecognizerIntent.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, getReactApplicationContext().getPackageName());
                    mSpeechRecognizerIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, KeysAds.LANGUAGE);
                    mSpeechRecognizerIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, KeysAds.LANGUAGE);
                    mSpeechRecognizerIntent.putExtra(RecognizerIntent.EXTRA_ONLY_RETURN_LANGUAGE_PREFERENCE, KeysAds.LANGUAGE);
                }
                if (mSpeechRecognizer == null) {
                    mSpeechRecognizer = SpeechRecognizer.createSpeechRecognizer(getReactApplicationContext());
                    mSpeechRecognizer.setRecognitionListener(RNSpeedToText.this);
                }
                mSpeechRecognizer.startListening(mSpeechRecognizerIntent);
            }
        });
    }

    @ReactMethod
    public void stopAndRelease(Promise promise) {
        try {
            isRecording = false;
            if (mSpeechRecognizer != null) {
                mSpeechRecognizer.destroy();
                mSpeechRecognizer = null;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        promise.resolve(true);
    }


    @Override
    public void onReadyForSpeech(Bundle params) {
        L.d("onReadyForSpeech");
        BaseUtils.sendEvent(getReactApplicationContext(), "StartSpeakComplete", null);
    }


    @Override
    public void onError(int error) {
        String mError = "";
        switch (error) {
            case SpeechRecognizer.ERROR_NETWORK_TIMEOUT:
                mError = " network timeout";
                break;
            case SpeechRecognizer.ERROR_NETWORK:
                mError = "Please check network";
                return;
            case SpeechRecognizer.ERROR_AUDIO:
                mError = " audio";
                break;
            case SpeechRecognizer.ERROR_SERVER:
                mError = " server";
                break;
            case SpeechRecognizer.ERROR_CLIENT:
                mError = " client";
                break;
            case SpeechRecognizer.ERROR_SPEECH_TIMEOUT:
                mError = " speech time out";
                break;
            case SpeechRecognizer.ERROR_NO_MATCH:
                sendResultData(" ", null);
                return;
            case SpeechRecognizer.ERROR_RECOGNIZER_BUSY:
                mSpeechRecognizer.cancel();
                mSpeechRecognizer.destroy();
                mSpeechRecognizer = null;
                mError = " recogniser busy";
                break;
            case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS:
                mError = " insufficient permissions";
                break;

        }
        isRecording = false;
        L.d("Error: " + error + " - " + mError);
        BaseUtils.sendEvent(getReactApplicationContext(), "ErrorSpeak", mError);
    }

    @Override
    public void onResults(Bundle results) {
        ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
        boolean isFinish;
        if (matches == null || matches.size() == 0) {
            sendResultData(null, "No result");
        } else {
            L.d("onResults matches: " + matches.get(0) + ", Size: " + matches.size());
            sendResultData(matches.get(0), null);
        }
    }

    private void sendResultData(String bestResult, String error) {
        WritableMap writableMap = Arguments.createMap();
        writableMap.putString("bestResult", bestResult);
        writableMap.putString("error", error);
        writableMap.putBoolean("isFinal", true);
        BaseUtils.sendEvent(getReactApplicationContext(), "SeakResult", writableMap);
    }

    //region method thừa
    @Override
    public void onEndOfSpeech() {
    }

    @Override
    public void onBeginningOfSpeech() {
    }

    @Override
    public void onRmsChanged(float rmsdB) {
    }

    @Override
    public void onBufferReceived(byte[] buffer) {

    }


    @Override
    public void onPartialResults(Bundle partialResults) {
    }

    @Override
    public void onEvent(int eventType, Bundle params) {

    }
    //endregion
}
