import React from 'react';
import {ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View} from 'react-native';
import EventCard from "./EventCard";
import ScheduleFilterDialog from "./ScheduleFilterDialog";
import {EVENTBRITE_API_KEY, IFF_ORG_ID} from '../../Constants';
import {Appbar, Text} from "react-native-paper";

class Schedule extends React.Component {

    constructor(props) {
        super(props);

        // Initial state
        this.state = {
            filter: this.FilterEnum.UPCOMING,
            events: [],
            loadingEvents: false
        };

        this.getEvents = this.getEvents.bind(this);
        this.getEventsAndUpdate = this.getEventsAndUpdate.bind(this);
        this.setFilter = this.setFilter.bind(this);
        this.dialog = React.createRef();
        this.openFilterDialog = this.openFilterDialog.bind(this);
    }

    FilterEnum = {ALL: 1, UPCOMING: 2, SAVED: 3};

    static navigationOptions = ({navigation}) => {
        return ({
            header: (
                <Appbar.Header style={styles.header}>
                    <Appbar.Content title={'Schedule'} color={colors.header_color}/>
                    <Appbar.Action icon={'filter-list'} onPress={() => navigation.state.params.openFilterDialog()}
                                   color={colors.header_color}/>
                    <Appbar.Action icon={'bookmark'} color={colors.header_color}/>
                </Appbar.Header>),
        });
    };

    openFilterDialog() {
        this.dialog.current.showDialog();
    }

    getEvents = async (filter, date) => {
        const events = [];
        this.setState({loadingEvents: true});

        try {
            const apiCall = await fetch(`https://www.eventbriteapi.com/v3/organizations/${IFF_ORG_ID}/events`, {
                headers: new Headers({
                    'Authorization': 'Bearer ' + EVENTBRITE_API_KEY,
                    'Content-Type': 'application/json'
                })
            });
            const eventData = await apiCall.json();

            if (typeof eventData !== 'undefined') {
                switch (filter) {
                    case this.FilterEnum.ALL:
                        eventData.events.forEach(function (element) {
                            events.push({
                                name: element.name.text,
                                description: element.description.text,
                                url: element.url,
                                start: element.start.utc,
                                end: element.end.utc,
                                image_url: element.logo.url //logo.original.url 8x longer
                            });
                        });
                        break;
                    case this.FilterEnum.UPCOMING:
                        eventData.events.forEach(function (element) {
                            if (element.end.utc >= date) {
                                events.push({
                                    name: element.name.text,
                                    description: element.description.text,
                                    url: element.url,
                                    start: element.start.utc,
                                    end: element.end.utc,
                                    image_url: element.logo.url //logo.original.url 8x longer
                                });
                            }
                        });
                        break;
                    case this.FilterEnum.SAVED:
                        break;
                }
            }
        } catch (error) {
            console.log('Error parsing and retrieving event data');
            this.setState({loadingEvents: false});
            throw error;
        }


        return events;
    };

    async getEventsAndUpdate() {
        const newEvents = await this.getEvents(this.state.filter, Date.now());

        this.setState({
            events: newEvents,
            loadingEvents: false,
            refreshing: false
        });
    }

    // TODO: very slow to update scrollview due to long event list. mb bring loading higher and either display spinner or scrollview
    async setFilter(newFilter) {
        await this.setState({filter: newFilter}); //Doesn't refresh on getEventsAndUpdate() so this is alternative
        this.getEventsAndUpdate();
    };

    componentDidMount() {
        this.getEventsAndUpdate();
        this.props.navigation.setParams({
            openFilterDialog: this.openFilterDialog
        });
    }

    render() {
        const EventCards = (typeof this.state.events !== 'undefined') && this.state.events.length ?
            this.state.events.map((event, eventKey) => {
                return (
                    <EventCard event={event} navigation={this.props.navigation} key={eventKey}/>
                );
            }) :
            this.state.loadingEvents ?
                <View style={styles.loadingView}>
                    <ActivityIndicator size="large" color={colors.spinner_color}/>
                    <Text style={styles.loadingText}>Loading events...</Text>
                </View> :
                <View style={styles.loadingView}>
                    <Text style={styles.loadingText}>No events to display</Text>
                </View>;
        //TODO: chg to spinner

        return (
            <ScrollView contentContainerStyle={styles.scrollContainer} refreshControl={
                <RefreshControl
                    refreshing={this.state.refreshing}
                    onRefresh={this.getEventsAndUpdate}
                />
            }>
                <ScheduleFilterDialog ref={this.dialog} currFilter={this.state.filter} setFilter={this.setFilter}/>
                {EventCards}
            </ScrollView>
        );
    }
}

const colors = {
    header_background_color: '#ee5956',
    header_color: '#ffffff',
    spinner_color: '#0e3737'
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: colors.header_background_color,
    },
    content: {
        padding: 4,
    },
    scrollContainer: {
        flexGrow: 1
    },
    loadingView: {
        flex: 1,
        justifyContent: 'center',
    },
    loadingText: {
        textAlign: 'center',
        textAlignVertical: 'center',
    }
});

export default Schedule;