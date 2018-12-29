import React from 'react';
import {View} from 'react-native';

import {Button, Dialog, Paragraph, Portal, RadioButton, TouchableRipple} from "react-native-paper";

class ScheduleFilterDialog extends React.Component {

    FilterEnum = {ALL: 1, UPCOMING: 2, SAVED: 3};

    constructor(props) {
        super(props);

        this.state = {
            visible: false,
            filter: this.props.currFilter
        };

        this.showDialog = this.showDialog.bind(this);
        this.hideDialog = this.hideDialog.bind(this);
        this.submitFilterChange = this.submitFilterChange.bind(this);
    }

    showDialog = () => this.setState({visible: true});

    hideDialog = () => this.setState({visible: false});

    submitFilterChange() {
        this.props.setFilter(this.state.filter);
        this.hideDialog();
    }

    render() {
        return (
            <Portal>
                <Dialog
                    visible={this.state.visible}
                    onDismiss={this.hideDialog}>
                    <Dialog.Title>Choose Event Filter</Dialog.Title>
                    <Dialog.Content>
                        <RadioButton.Group
                            onValueChange={value => this.setState({filter: value})}
                            value={this.state.filter}
                        >
                            <TouchableRipple onPress={() => this.setState({filter: this.FilterEnum.ALL})}>
                                <View style={styles.row}>
                                    <Paragraph>All Events</Paragraph>
                                    <RadioButton value={this.FilterEnum.ALL}/>
                                </View>
                            </TouchableRipple>
                            <TouchableRipple onPress={() => this.setState({filter: this.FilterEnum.UPCOMING})}>
                                <View style={styles.row}>
                                    <Paragraph>Upcoming Events</Paragraph>
                                    <RadioButton value={this.FilterEnum.UPCOMING}/>
                                </View>
                            </TouchableRipple>
                        </RadioButton.Group>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={this.submitFilterChange} color={colors.submit_button}>Done</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        );
    }
}

const colors = {
    submit_button: '#ee5956'
};

const styles = {
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
};

export default ScheduleFilterDialog;