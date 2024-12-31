import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { createEvent, } from "../../store/event"
import { useSelector } from "react-redux"
import { restoreVenues } from "../../store/event"
import { useNavigate } from "react-router-dom"

export const CreateEvent = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const errors = useSelector(state => state.events.eventErrs)
    const venues = useSelector(state => state.events.venues)
    // console.log("SERVER VENUES: ",venues)

    let group = JSON.parse(localStorage.getItem("groupId"))
    // console.log("GROUP: ",group)

    const [name, setName] = useState("")
    const [inPerson, setInPerson] = useState("In person")
    const [price, setPrice] = useState(0)
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [capacity, setCapacity] = useState(1)
    const [img, setImg] = useState("")
    const [description, setDescription] = useState("")
    const [venue, setVenue] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("")
    
    // let currVenue
    // if(venues && venues?.length>0){currVenue = venues.find(ven => ven.address === venue)}
    
    useEffect(() => {
        dispatch(restoreVenues(group.id))
    }, [dispatch, group.id])

    useEffect(() => {
        if(venues?.length>0){
            setVenue(venues[0]?.address)
        }
    },[venues])
    

    const onSubmit = async (e) => {
        e.preventDefault()

        //fixing dates
        const fixDate = (body) => {
        if(body) {
            let [date, wholeTime] = body.split(", ")
            if(date) {
                let [month, day, year] = date.split("/")
                if(wholeTime) {
                    let [time, evening] = wholeTime.split(" ")
                    if(time) {
                        let [hour, minute] = time.split("/")
                        if(evening==="PM"){
                            if(hour!=='12'){hour = `${+hour+12}`}
                            else {hour = '00'; day=day+1}
                        }
                        return `${year}-${month}-${day} ${hour}:${minute}:00`}
                    }
                }
            }
        }
        let start = fixDate(startDate)
        let end = fixDate(endDate)
        //submitting thunk
        let newEvent = await dispatch(createEvent({name, inPerson, price, startDate:start, endDate:end, 
            img, description, groupId:group.id, capacity, venue, city, state}))
            if(newEvent){
        navigate("/events/"+newEvent.id)
    }}

    return <div className="CreateEventFormContainer"><form onSubmit={onSubmit} className="CreateEventForm">
    <div className="CreateEventTitle">Create a new event for {group?.name}</div>
    <label className="CreateEventNormal" htmlFor="name">What is the name of your event?</label>
        <input className="CreateEventInput" type="text" name="name" placeholder="Event Name"
        value={name} onChange={(e)=>{setName(e.target.value)}}/>
    
    {errors?.name ?<div className="CreateError">{errors.name}</div> : null}
    <label className="UnderALine" htmlFor="inPerson">Is this an in-person or online group?</label>
        <select className="CreateEventInput CreateEventSnugInput" value={inPerson} name="inPerson" onChange={(e)=>{setInPerson(e.target.value)}}>
            <option>In person</option>
            <option>Online</option>
        </select>
    
    {errors?.type ? <div className="CreateError">{errors.type}</div> : null}
    <label className="GapInput" htmlFor="price" value="$">What is the price for your event?</label>
    <div className="MoneyContainer">
    <i className="Money">$</i>
        <input className="CreateEventInput CreateEventSnugInput RightInput" name="price" type="number" placeholder="0" 
        value={price} onChange={(e)=>{setPrice(e.target.value)}}/>
        </div>
    
    {errors?.price ? <div className="CreateError">{errors.price}</div> : null}
    <label className="UnderALine" htmlFor="start">When does your event start?</label>
        <input className="CreateEventInput CreateEventSnugInput" type="text" name="start" placeholder="MM/DD/YYYY, HH/mm AM"
        value={startDate} onChange={(e)=>{setStartDate(e.target.value)}}/>
    
    {errors?.startDate ? <div className="CreateError">{errors.startDate}</div> : null}
    <label className="GapInput" htmlFor="end">When does your event end?</label>
        <input className="CreateEventInput CreateEventSnugInput" type="text" name="end" placeholder="MM/DD/YYYY, HH/mm PM"
        value={endDate} onChange={(e)=>{setEndDate(e.target.value)}}/>
    
    {errors?.endDate ? <div className="CreateError">{errors.endDate}</div> : null}
    <label className="UnderALine" htmlFor="attendance">How many people can attend?</label>
        <input className="CreateEventInput CreateEventSnugInput" type="number" value={capacity} name="attendance" onChange={(e)=>{setCapacity(e.target.value)}}/>
    
    {errors?.capacity ? <div className="CreateError">{errors.capacity}</div> : null}
    <label className="UnderALine" htmlFor="image">Please add an image url for your event below.</label>
        <input className="CreateEventInput" type="text" name="image" placeholder="Image URL"
        value={img} onChange={(e)=>{setImg(e.target.value)}}/>
    
    {/* {errors?.img ? <div>{errors.img}</div> : null} */}
    <label className="UnderALine" htmlFor="description">Please describe your event</label>
        <textarea className="CreateEventInput" name="description" placeholder="Please include at least 30 characters"
        value={description} onChange={(e)=>{setDescription(e.target.value)}}/>
    
    {errors?.description ? <div className="CreateError">{errors.description}</div> : null}
    <label className="UnderALine" htmlFor="venue">{"What is your venue's address?"}</label>
        {/* <select className="CreateEventInput" type="text" value={venue} name="venue" onChange={(e)=>{setVenue(e.target.value)}} placeholder="Venue Name">
            {venues?.length>0 ? venues.map(venue => {
                // console.log("OPTION: ",venue.address);
                return <option key={venue.id}>{venue.address}</option>
            })
             : null }
        </select> */}
        <input className="CreateEventInput" type="text" name="venue" placeholder="Venue Address"
        value={venue} onChange={(e)=>{setVenue(e.target.value)}}/>

    {/* <label className="UnderALine" htmlFor="city">{"What is your venue's city?"}</label> */}
    <input className="CreateEventInput" type="text" name="city" placeholder="Venue City"
        value={city} onChange={(e)=>{setCity(e.target.value)}}/>
    <input className="CreateEventInput" type="text" name="state" placeholder="Venue State"
        value={state} onChange={(e)=>{setState(e.target.value)}}/>
    
    <button className="CreateEventButton">Create Event</button>
    </form>
    </div>
}