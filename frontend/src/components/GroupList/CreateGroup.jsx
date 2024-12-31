import { useState } from "react"
import { createGroup } from "../../store/groups"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

export const CreateGroup = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    
    let errors = useSelector(state => state.groups?.groupErrs?.errors)

    let [location, setLocation] = useState("")
    let [name, setName] = useState("")
    let [about, setAbout] = useState("")
    let [online, setOnline] = useState("")
    let [publicity, setPublicity] = useState("")
    let [image, setImage] = useState("")

    let onSubmit = async (e) => {
        e.preventDefault()
        let [city, state] = location.split(", ")
        let response = await dispatch(createGroup({
            name, about, type:online, private:publicity, city, state, image
        }))
        if(response) {
            if(Object.values(response).length>0){navigate('/groups/'+response.group.id)}
        }
    }
    console.log("ERRORS: ",errors)
    console.log("ONLINE AND PUBLICITY: ",online, publicity)


    return <div className="CreateGroupFormContainer"> <form className="CreateGroupForm" onSubmit={(e)=>{onSubmit(e)}}>
        <div className="CreateGroupTitle">Start a new group</div>
        <div className="createGroup1">
            <div className="createGroup1Command">{"Set your group's location"}</div>
            <div className="createGroup1Description">{"Meetup groups meet locally, in person, and online. We'll connect you with people in your area."}</div>
            <input className="createGroup1Input" type="text" placeholder="City, STATE" 
            value={location}
            onChange={(e)=>setLocation(e.target.value)}/>
        </div>
        {errors?.city ? <div className="createGroupErrors">{errors.city}</div> : null}
        {errors?.state ? <div className="createGroupErrors">{errors.state}</div> : null}
        <div className="createGroup1">
            <div className="createGroup1Command">{"What will your group's name be?"}</div>
            <div>{`Chose a name that will give people a clear idea of what the group is about. Feel free to get creative! You can edit this later if you change your mind.`}</div>
            <input className="createGroup1Input" type="text" placeholder="What is your group name?"
            value={name}
            onChange={(e)=>setName(e.target.value)}/>
        </div>
        {errors?.name ? <div className="createGroupErrors">{errors.name}</div> : null}
        <div className="createGroup1">
            <div className="createGroup1Command">Describe the purpose of your group.</div>
            <div>{"People will see this when we promote your group, but you'll be able to add to it later, too."}</div>
            <ol>
                <li>{"What's the purpose of the group?"}</li>
                <li>Who should join?</li>
                <li>What will you do at your events?</li>
            </ol>
            <textarea className="createGroup1Input createGroup3Input" placeholder="Please write at least 30 characters." 
            value={about}
            onChange={(e)=>setAbout(e.target.value)}/>
        </div>
        {errors?.about ? <div className="createGroupErrors">{errors.about}</div> : null}
        <div className="createGroup1">
            <label htmlFor="online" className="createGroup4">Is this an in-person or online group?</label>
                <select className="createGroup4Input" name="online" onChange={(e)=>setOnline(e.target.value)}>
                    <option className="createGroupOption">(select one)</option>
                    <option className="createGroupOption" value={"In person"}>In Person</option>
                    <option className="createGroupOption" value={"Online"}>Online</option>
                </select>
                {errors?.typer ? <div className="createGroupErrors">{errors.typer}</div> : null}
            <label htmlFor="publicity" className="createGroup4">Is this group private or public?</label>
                <select className="createGroup4Input" name="publicity" onChange={(e)=>setPublicity(e.target.value)}>
                    <option className="createGroupOption">(select one)</option>
                    <option className="createGroupOption" value={true}>Private</option>
                    <option className="createGroupOption" value={false}>Public</option>
                </select>
                {errors?.privacy ? <div className="createGroupErrors">{errors.privacy}</div> : null}
            <label className="createGroup4" htmlFor="image">Please add an image URL for your group below.</label>
                <input name="image" className="createGroup4Input" type="text" placeholder="Image Url"
                value={image}
                onChange={(e)=>setImage(e.target.value)}/>
                {errors?.image ? <div className="createGroupErrors">{errors.image}</div> : null}
        </div>
        <button>Create Group</button>
    </form>
    </div>
}