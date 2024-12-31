import { restoreGroups, restoreEvents } from "../../store/groups"
import { useDispatch, useSelector } from "react-redux"
import { useEffect } from "react"
import { NavLink } from "react-router-dom"
import './GroupList.css'

const GroupList = () => {
const dispatch = useDispatch()

let groups = useSelector(state => state.groups.groups)
let events = useSelector(state => state.groups.events)

groups?.forEach(group => {
    group.events = []
})


groups?.forEach(group => {
    let currEvent = events?.filter(event => {return group.id===event.groupId})
    currEvent ? group.events = currEvent : group.events = [] 
})


useEffect (() => {
    dispatch(restoreGroups())
    dispatch(restoreEvents())
}, [dispatch])


    return <div className="GroupListPageContainer">
    <div className="GroupListNavs">
        <NavLink to={"/events"} className="GroupListNavEnabled">Events</NavLink>
        <div className="GroupListNavDisabled">Groups</div>
    </div>
    <div className="GroupListItemsContainer">
        <div className="GroupListCaption">Groups in Meetup</div>
        {groups?.map(group=>
        {
            return <NavLink to={"/groups/"+group.id} key={group.id} className={"GroupListItems"}>
                <img src={group.previewImage} className="GroupListImage"/>
                <div className="GroupListText">
                    <div className="GroupListName">{group.name}</div>
                    <div className="GroupListLocation">{group.city}, {group.state}</div>
                    <div className="GroupListDescription">{group.about}</div>
                    <div className="GroupListEventsAndPublic">
                        {group.events.length} event(s) • {group.private?"Private":"Public"}</div>
                </div>    
            </NavLink>})}
    </div>
    </div>
}

export default GroupList