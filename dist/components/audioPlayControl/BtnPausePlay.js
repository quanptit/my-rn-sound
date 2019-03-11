import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { ComponentUpdateOnlyState, Spinner, StyleUtils, Touchable } from "my-rn-base-component";
const s = StyleUtils.getAllStyle();
export default class BtnPausePlay extends ComponentUpdateOnlyState {
    constructor(props) {
        super(props);
        this.state = { statePlayer: "stopped" };
    }
    /**
     * state: buffering, playing, stopped, error, paused, complete
     * */
    updateState(statePlayer) {
        this.setState({ statePlayer: statePlayer });
    }
    render() {
        let img = this.state.statePlayer === "playing" ? require('../../../assets/ic_player_pause.png')
            : require('../../../assets/ic_player_play.png');
        return (<Touchable style={[{ width: 45, height: 45 }, styles.center, this.props.style]} onPress={this.props.onPress}>
                <Image source={img} style={{ width: 45, height: 45, resizeMode: "cover" }}/>
                {this._renderSpinner()}
            </Touchable>);
    }
    _renderSpinner() {
        if (this.state.statePlayer === "buffering") {
            return (<View style={[s.absolute_fill, styles.center]}>
                    <Spinner size="small" color="gray"/>
                </View>);
        }
        return null;
    }
}
const styles = StyleSheet.create({
    center: { justifyContent: 'center', alignItems: 'center' }
});
