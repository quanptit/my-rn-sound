import {AudioPlayControl} from "./components/audioPlayControl/AudioPlayControl";

// let players: Set<AudioPlayControl>;
//
// function getPlayers(): Set<AudioPlayControl> {
//     if (players == null) players = new Set<AudioPlayControl>();
//     return players;
// }

export class ManagerOneAudioPlayer {
    static playerCurrent: AudioPlayControl;

    static startPlayAudio(player: AudioPlayControl) {
        if (player === this.playerCurrent) return;
        this.playerCurrent && this.playerCurrent.releaseAudio(true);
        this.playerCurrent = player;
    }

    // static registerAudioPlayer(player: AudioPlayControl) {
    //     getPlayers().add(player);
    // }

    static unregisterAudioPlayer(player: AudioPlayControl) {
        if (ManagerOneAudioPlayer.playerCurrent === player)
            ManagerOneAudioPlayer.playerCurrent = null;
        // getPlayers().delete(player);
    }
}
