// let players: Set<AudioPlayControl>;
//
// function getPlayers(): Set<AudioPlayControl> {
//     if (players == null) players = new Set<AudioPlayControl>();
//     return players;
// }
export class ManagerOneAudioPlayer {
    static startPlayAudio(player) {
        if (player === this.playerCurrent)
            return;
        this.playerCurrent && this.playerCurrent.releaseAudio(true);
        this.playerCurrent = player;
    }
    // static registerAudioPlayer(player: AudioPlayControl) {
    //     getPlayers().add(player);
    // }
    static unregisterAudioPlayer(player) {
        if (ManagerOneAudioPlayer.playerCurrent === player)
            ManagerOneAudioPlayer.playerCurrent = null;
        // getPlayers().delete(player);
    }
}
