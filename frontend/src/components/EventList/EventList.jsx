import { NavLink } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useEffect } from "react"
import { restoreEventsList } from "../../store/event"


export const EventList = () => {
    const dispatch = useDispatch()
    const eventList = useSelector(state => state.events.events)
    console.log("EVENTLIST: ",eventList)


    useEffect(() => {
        dispatch(restoreEventsList())
    }, [dispatch])

    let events = []
    let beforeEvent = []
    let afterEvent = []

    eventList?.forEach(event => new Date()>new Date(event.startDate) ?
    afterEvent.push(event) : beforeEvent.push(event))

    beforeEvent.sort((a,b) => new Date(a.startDate)-new Date(b.startDate))

    events = [...beforeEvent, ...afterEvent]
console.log("EVENTSLIST: ",eventList)


    return <div className="EventsListContainerContainer">
        <div className="EventsListContainer">
            <div className="EventsListTitlePages">
                <div className="EventsListTitleDisabled">Events</div>
                <NavLink className={"EventsListTitleEnabled"} to={"/groups"}>Groups</NavLink>
            </div>
            <div className="EventsListTitle">Events in Meetup</div>
            {events?.map(event => {
                const imgSrc = () => {
                    if(event){
                        return event.previewImage
                    }
                }
                return <NavLink className={"EventsListLinks"} to={"/events/"+event.id} key={event.id}>
                    <img src={imgSrc() || "data:image/jpeg;base64,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"}/>
                    <div className="EventsListText">
                        <div className="EventsListStart">{event.startDate.split(" ")[0]} · {event.startDate.split(" ")[1]}</div>
                        <div className="EventsListName">{event.name}</div>
                        <div className="EventsListPlace">{event.Venue.city}, {event.Venue.state}</div>
                    </div>
                    <div className="EventsListDescription">{event.description}</div>
                </NavLink>
            })}
        </div>
    </div>
}