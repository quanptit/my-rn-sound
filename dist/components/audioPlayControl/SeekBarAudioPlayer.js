import React from 'react';
import { View, Slider, Text } from 'react-native';
import { DataTypeUtils } from "my-rn-base-utils";
import { ComponentUpdateOnlyState, StyleUtils } from "my-rn-base-component";
const s = StyleUtils.getAllStyle();
export default class SeekBarAudioPlayer extends ComponentUpdateOnlyState {
    constructor(props) {
        super(props);
        this.state = { duration: 0, value: 0 };
    }
    updateCurrentTime(current) {
        this.setState({ value: current });
    }
    updateState(duration) {
        this.setState({ duration: duration });
    }
    render() {
        let durationStr = DataTypeUtils.convertTimeDisplayInPlay(this.state.duration);
        let currentStr = DataTypeUtils.convertTimeDisplayInPlay(this.state.value);
        return (<View style={[this.props.style, { flexDirection: "row", alignItems: "center" }]}>
                <Text style={[s.f_nor, s.black]}>{currentStr}</Text>
                <Slider maximumValue={this.state.duration} value={this.state.value} style={{ marginLeft: 5, marginRight: 5, flex: 1 }} onValueChange={this.props.onValueChange}/>
                <Text style={[s.black, s.f_nor]}>{durationStr}</Text>
            </View>);
    }
}
