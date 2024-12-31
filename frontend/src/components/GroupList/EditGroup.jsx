import { useState, useEffect } from "react"
import { updateGroup } from "../../store/groups"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { restoreGroup } from "../../store/groups"

export const EditGroup = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    let currGroup
    let userId = useSelector(state => state.session.user?.id)
    let { groupId} = useParams()
    
    async() => {restoreGroup(groupId)}
    
    //protecting against no local storage
    if(localStorage.getItem("groupId")){
        if(localStorage.getItem('groupId')!=='undefined'){
            currGroup = JSON.parse(localStorage.getItem("groupId"))
        }
    }

    //Kicking anyone out who is not the owner
    useEffect(()=>{
        if(!currGroup || +groupId!==+userId){
            navigate("/")
        }
    },[currGroup, navigate, userId, groupId])
    
    
    
// selectors
    let errors = useSelector(state => state.groups?.groupErrs?.errors)
//useState setters
    let [location, setLocation] = useState(`${currGroup?.city}, ${currGroup?.state}`)
    let [name, setName] = useState(currGroup?.name)
    let [about, setAbout] = useState(currGroup?.about)
    let [online, setOnline] = useState(currGroup?.type)
    let [publicity, setPublicity] = useState(currGroup?.private ? true : false)
    let [image, setImage] = useState(currGroup?.GroupImages[0].url)
//submit function
    let onSubmit = async (e) => {
        e.preventDefault()
        let [city, state] = location.split(", ")
        let response = await dispatch(updateGroup({
            name, about, type:online, private:publicity, city, state, currGroupId:currGroup.id
        }))
        if(response) {
            if(Object.values(response).length>0){navigate('/groups/'+currGroup?.id)}
        }
    }
    


    return <div className="CreateGroupFormContainer"><form className="CreateGroupForm" onSubmit={(e)=>{onSubmit(e)}}>
        <div className="CreateGroupTitle">Update your Group</div>
        <div className="createGroup1">
            <div className="createGroup1Command">{"Set your group's location"}</div>
            <div className="CreateGroup1Description">{"Meetup groups meet locally, in person, and online. We'll connect you with people in your area."}</div>
            <input className="createGroup1Input" type="text" placeholder="City, STATE" 
            value={location}
            onChange={(e)=>setLocation(e.target.value)}/>
        </div>
        {errors?.city ? <div>{errors.city}</div> : null}
        {errors?.state ? <div>{errors.state}</div> : null}
        <div className="createGroup1">
            <div className="createGroup1Command">{"What will your group's name be?"}</div>
            <div>{`Chose a name that will give people a clear idea of what the group is about. Feel free to get creative! You can edit this later if you change your mind.`}</div>
            <input type="text" className="createGroup1Input" placeholder="What is your group name?"
            value={name}
            onChange={(e)=>setName(e.target.value)}/>
        </div>
        {errors?.name ? <div>{errors.name}</div> : null}
        <div className="createGroup1">
            <div className="createGroup1Command">Describe the purpose of your group.</div>
            <div>{`People will see this when we promote your group, but you'll be able to add to it later, too. 1. What's the purpose of the group? 2. Who should join? 3. What will you do at your events?`}</div>
            <textarea className="createGroup1Input" placeholder="Please write at least 30 characters." 
            value={about}
            onChange={(e)=>setAbout(e.target.value)}/>
        </div>
        {errors?.about ? <div>{errors.about}</div> : null}
        <div className="createGroup1">
            <label className="createGroup4" htmlFor="online">Is this an in-person or online group?</label>
                <select className="createGroup4Input" name="online" value={online} onChange={(e)=>setOnline(e.target.value)}>
                    <option>In Person</option>
                    <option>Online</option>
                </select>
            
            <label className="createGroup4" htmlFor="private">Is this group private or public?</label>
                <select className="createGroup4Input" name="private" value={publicity} onChange={(e)=>setPublicity(e.target.value)}>
                    <option value={true}>Private</option>
                    <option value={false}>Public</option>
                </select>
            
            <label className="createGroup4" htmlFor="image">Please add an image URL for your group below.</label>
                <input name="image" className="createGroup4Input" type="text" placeholder="Image Url"
                value={image}
                onChange={(e)=>setImage(e.target.value)}/>
            
        </div>
        <button>Update Group</button>
    </form></div>
}