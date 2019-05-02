import { AudioPlayControl } from "./components/audioPlayControl/AudioPlayControl";
export declare class ManagerOneAudioPlayer {
    static playerCurrent: AudioPlayControl;
    static startPlayAudio(player: AudioPlayControl): void;
    static unregisterAudioPlayer(player: AudioPlayControl): void;
}
