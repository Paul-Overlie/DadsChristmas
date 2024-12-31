const express = require('express')
const bcrypt = require('bcryptjs')
const {Group, GroupImage, Membership, Venue, User, Attendance, EventImage, Event}=require("../../db/models")
const Sequelize = require("sequelize")
const {check, validationResult}=require("express-validator")

const { setTokenCookie, requireAuth } = require('../../utils/auth');

const router = express.Router()

let currentTime = Date.now()
let editQueryValidations=[
    check('name')
        .isLength({min:5})
        .withMessage("Name must be at least 5 characters"),
    check('type')
        .isIn(["Online", "In person"])
        .withMessage("Type must be Online or In person"),
    check('capacity')
        .isInt()
        .withMessage("Capacity must be an integer"),
    check("price")
        .isFloat({min:0})
        .withMessage("Price is invalid"),
    check("description")
        .exists()
        .notEmpty()
        .withMessage("Description is required"),
    check("startDate")
        .isISO8601()
        .custom(value=>{if(new Date(value).getTime()>currentTime){return true}else{return false}})
        .withMessage("Start date must be in the future"),
    check("endDate")
        .isISO8601()
        .withMessage("End date is less than start date")
]

let editVenueValidations=[
    check("address")
        .exists()
        .notEmpty()
        .withMessage("Street address is required"),
    check("city")
        .exists()
        .notEmpty()
        .withMessage("City is required"),
    check("state")
        .exists()
        .notEmpty()
        .withMessage("State is required"),
    check("lat")
        .isFloat({min:-90, max:90})
        .withMessage("Latitude must be within -90 and 90"),
        check("lng")
        .isFloat({min:-180, max:180})
        .withMessage("Longitude must be within -180 and 180"),
]

let editGroupValidations = [
    check("name")
        .isLength({max: 60})
        .withMessage("Name must be 60 characters or less"),
    check("about")
        .isLength({min: 50})
        .withMessage("About must be 50 characters or more"),
    check("type")
        .isIn(["Online", "In person"])
        .withMessage("Type must be 'Online' or 'In person'"),
    check("private")
        .isBoolean()
        .withMessage("Private must be a boolean"),
    check("city")
        .exists()
        .notEmpty()
        .withMessage("City is required"),
    check("state")
        .exists()
        .notEmpty()
        .withMessage("State is required")
]

//Get all Groups
router.get("/", async(req, res, next)=>{
    let memberCount = await Membership.count()
    // console.log("memberCount", memberCount)
    let group = await Group.unscoped().findAll({
        include: [Membership, GroupImage.unscoped()]
    })
    
    let groups = []

    group.forEach((oup)=>{
        groups.push({
        id:oup.id,
        organizerId: oup.organizerId,
        name: oup.name,
        about: oup.about,
        type: oup.type,
        private: oup.private,
        city: oup.city,
        state: oup.state,
        createdAt: oup.createdAt,
        updatedAt:oup.updatedAt,
        numMembers: oup.Memberships.length,
        previewImage: oup.GroupImages[0]?.url
    })})

    let payload = {Groups: groups}
    return res.json(payload)
})

//Get all Groups by Current User
router.get("/current", requireAuth, async(req, res, next)=>{
    // console.log(req.user.dataValues.id)
    let group = await Group.unscoped().findAll({
        where: {organizerId: req.user.dataValues.id},
        include: [Membership, GroupImage]
    })

    let groups = []

    group.forEach((oup)=>{groups.push({
        id:oup.id,
        organizerId: oup.organizerId,
        name: oup.name,
        about: oup.about,
        type: oup.type,
        private: oup.private,
        city: oup.city,
        state: oup.state,
        createdAt: oup.createdAt,
        updatedAt:oup.updatedAt,
        numMembers: oup.Memberships.length,
        previewImage: oup.GroupImages[0].url
    })})

    let payload = {Groups:groups}

    res.statusCode=200
    return res.json(payload)
})

//Get details of a Group from an id
router.get("/:groupId", async (req, res, next)=>{
    let id = req.params.groupId
     let group = await Group.unscoped().findAll({
        where: {id: id},
        include: [Membership, GroupImage, User, Venue]
    })

    if(group.length===0){
        res.statusCode = 404
        let body = {message: "Group couldn't be found",}
        return res.json(body)
    }

    let groups = []

    group.forEach((oup)=>{groups.push({
        id:oup.id,
        organizerId: oup.organizerId,
        name: oup.name,
        about: oup.about,
        type: oup.type,
        private: oup.private,
        city: oup.city,
        state: oup.state,
        createdAt: oup.createdAt,
        updatedAt:oup.updatedAt,
        numMembers: oup.Memberships.length,
        GroupImages: oup.GroupImages,
        Organizer: oup.User,
        Venues: oup.Venues
        
    })})

    res.statusCode=200
    return res.json(groups[0])
})

//Create a Group
router.post("/", requireAuth, editGroupValidations, async (req, res, next)=>{
    let result = validationResult(req)
    let errors={}
    if(!req.body.name){errors.name="Name is required"}
    if(!req.body.typer){errors.typer="Group Type is required"}
    if(req.body.privacy!==true&&req.body.privacy!==false){errors.privacy="Visibility Type is required"}
    // console.log("result errors:",result.errors)
    if(result.errors.length>0){
        result.errors.forEach(e=>{errors[e.path]=e.msg})
        res.statusCode=400
        return res.json({
            "message": "Bad Request",
            "errors": errors
        })
    }
    let {name, about, type, private, city, state}= req.body
    try {let newGroup = await Group.create({
        organizerId: req.user.dataValues.id,
        name,
        about,
        type,
        private,
        city,
        state
    })

    let member = await Membership.create({
        userId: req.user.dataValues.id,
        groupId: newGroup.id,
        status: "co-host"
    })
    // console.log(newGroup)
    
    res.statusCode = 201
    return res.json(newGroup)
}
    catch(error){
        res.statusCode=400
        return res.json({
            "message": "Bad Request",
            "errors": {
              "name": "Name must be 60 characters or less",
              "about": "About must be 50 characters or more",
              "type": "Type must be 'Online' or 'In person'",
              "private": "Private must be a boolean",
              "city": "City is required",
              "state": "State is required",
            }
          })
    }
})

//Add an Image to a Group based on the Group's id
router.post("/:groupId/images", requireAuth, async(req,res,next)=>{
    let group = await Group.findOne({where: {id: req.params.groupId}})
    //no group from id
    // console.log("Group", group)
    if(!group){
        res.statusCode=404
        return res.json({message: "Group couldn't be found"})
    }
    // console.log("userId:", req.user.dataValues.id, "organizerId:", group.organizerId)
    //authorization
    if(group.organizerId!==req.user.dataValues.id){
        res.statusCode=403
        return res.json({
            "message": "Forbidden"
          })
    }

    //creating image
    let {url, preview}=req.body
    let image = await GroupImage.create({
        url,
        preview,
        groupId: req.params.groupId
    })
    let payload = {
        id: image.id,
        url: image?.url,
        preview: image.preview
    }
    res.statusCode=200
    return res.json(payload)
})

//Edit a Group
router.put("/:groupId", requireAuth, editGroupValidations, async(req,res,next)=>{
    let result = validationResult(req)
    let errors={}
    // console.log("result errors:",result.errors)
    if(result.errors.length>0){
        result.errors.forEach(e=>{errors[e.path]=e.msg})
        res.statusCode=400
        return res.json({
            "message": "Bad Request",
            "errors": errors
        })
    }
    let group = await Group.unscoped().findOne({where: {id: req.params.groupId}})
    if(!group){
        res.statusCode=404
        return res.json({message: "Group couldn't be found"})
    }

    //authorization
    if(group.organizerId!==req.user.dataValues.id){
        res.statusCode=403
        return res.json({
            "message": "Forbidden"
          })
    }

    try{

        let {name, about, type, private, city, state}=req.body
        if(name){group.name=name}
        if(about){group.about=about}
        if(type){group.type=type}
        if(private){group.private=private}
        if(city){group.city=city}
        if(state){group.state=state}
        await group.save()
        
        res.statusCode=200
        return res.json(group)
    } catch(error){
        res.statusCode=400
        return res.json({
            "message": "Bad Request",
            "errors": {
              "name": "Name must be 60 characters or less",
              "about": "About must be 50 characters or more",
              "type": "Type must be 'Online' or 'In person'",
              "private": "Private must be a boolean",
              "city": "City is required",
              "state": "State is required",
            }
          })
    }
})

    //Delete a Group
router.delete("/:groupId", requireAuth, async(req,res,next)=>{
    let group = await Group.unscoped().findOne({where: {id: req.params.groupId}})
    if(!group){
        res.statusCode=404
        return res.json({
            "message": "Group couldn't be found"
          })
    }

    //authorization
    if(group.organizerId!==req.user.dataValues.id){
        res.statusCode=403
        return res.json({
            "message": "Forbidden"
          })
    }
    await group.destroy()
    res.statusCode=200
    return res.json({
        "message": "Successfully deleted"
      })
})

//Get All Venues for a Group specified by its id
router.get("/:groupId/venues", requireAuth, async(req, res, next)=>{
    let group = await Group.unscoped().findOne({where: {id: req.params.groupId}})
    if(!group){res.statusCode = 404
    return res.json({message: "Group couldn't be found"})}
    let membership = await Membership.findOne({where:{groupId:group.id,
    userId:req.user.dataValues.id}})
    //authorization
    let auth = false
    if(group.organizerId===req.user.dataValues.id){auth=true}
    if(membership){if(membership.status==="co-host"){auth=true}}
    if(auth===false){
        res.statusCode=403
        return res.json({
            "message": "Forbidden"
          })
    }

    let venues = await Venue.findAll({where:{id:group.id}})
    let payload = {Venues: venues}
    res.statusCode = 200
    return res.json(payload)

})

//Create a new venue for a group specified by its id
router.post("/:groupId/venues", requireAuth, editVenueValidations, async(req,res,next)=>{
    let result = validationResult(req)
    let errors={}
    // console.log("result errors:",result.errors)
    if(result.errors.length>0){
        result.errors.forEach(e=>{errors[e.path]=e.msg})
        res.statusCode=400
        return res.json({
            "message": "Bad Request",
            "errors": errors
        })
    }
    let group = await Group.unscoped().findOne({where: {id: req.params.groupId}})
    if(!group){res.statusCode = 404
    return res.json({message: "Group couldn't be found"})}
    let member = await Membership.findOne({where:{userId:req.user.dataValues.id,
    groupId:group.id}})
    //authorization
    let auth = false
    if(group.organizerId===req.user.dataValues.id){auth=true}
    if(member)
    {if(member.status==="co-host"){auth=true}}
        if(auth===false){
        res.statusCode=403
        return res.json({
            "message": "Forbidden"
          })
    }

    try{
        let {address, city, state, lat, lng}=req.body
        let venue = await Venue.create({
            address,
            city,
            state,
            lat,
            lng,
            groupId: group.id
        })
        
        let payload = {
            id: venue.id,
            groupId: venue.groupId,
            address: venue.address,
            city: venue.city,
            state: venue.state,
            lat: venue.lat,
            lng: venue.lng
        }
        
        res.statusCode=200
        return res.json(payload)
    }catch(err){
        res.statusCode=400
        return res.json({
            "message": "Bad Request", // (or "Validation error" if generated by Sequelize),
            "errors": {
              "address": "Street address is required",
              "city": "City is required",
              "state": "State is required",
              "lat": "Latitude must be within -90 and 90",
              "lng": "Longitude must be within -180 and 180",
            }
          })
    }
    })

    //Get all Events of a Group specified by its id
    router.get("/:groupId/events", async (req,res)=>{
        let tester = await Group.findOne({where:{id:req.params.groupId}})
        if(!tester){
            res.statusCode=404
            return res.json({message: "Group couldn't be found"})
        }

        let events = await Event.findAll({where:{groupId:req.params.groupId},
        include: [Attendance, Group, Venue, EventImage]})
        // let attendees = await Attendance.findAll({where:{eventId:events.id}})
        // let groups = await Group.findAll({where:{id:req.params.id}})
        // let venues = await Venue.findAll({where: {}})
        let stuff =[]

    events.forEach((event)=>{

        //FORMAT DATE!!!
        let formatDate = (date) => {
            let startYear = date.getFullYear()
            let startMonth = date.getMonth()
            let startDay = date.getDate()
            let startHour = date.getHours()
            let startMinute = date.getMinutes()
            let startSecond = date.getSeconds()
            return `${startYear}-${startMonth}-${startDay} ${startHour}:${startMinute}:${startSecond}`
            }

        let prevImage = []
        event.EventImages.forEach((image)=>{
            // console.log("IMAGGEEEEE",image)
            if(image.preview===true){prevImage.push(image.url)}
        })

        let gru = null
        if(event.Group){
            gru = {
                id:event.Group.id,
                name:event.Group.name,
                city:event.Group.city,
                state:event.Group.state
            }
        }
        let ven = null
        if(event.Venue){
            ven = {
                id:event.Venue.id,
                city:event.Venue.city,
                state:event.Venue.state
            }
        }

        stuff.push({
        id: event.id,
        groupId: event.groupId,
        venueId: event.venueId,
        name: event.name,
        type: event.type,
        startDate: formatDate(event.startDate),
        endDate: formatDate(event.endDate),
        numAttending: event.Attendances.length,
        previewImage: prevImage[0]||null,
        Group: gru,
        Venue: ven,
        description: event.description
    })})
    
    let payload = {Events: stuff}

    res.statusCode = 200
    return res.json(payload)
    })

    //Create an Event for a Group specified by its id
    router.post("/:groupId/events", requireAuth, editQueryValidations, async(req,res)=>{
        let result = validationResult(req)
    if(!result.errors.find(e=>e.path==="endDate")&&new Date(req.body.startDate).getTime()>new Date(req.body.endDate).getTime()){
        result.errors.push({path:"endDate",
            msg:"End date is less than start date"
        })
    }
if(req.body?.description?.length<30 && !result.errors.path?.description){result.errors.push({path:'description', msg:'Description must be at least 30 characters long.'})}
    let errors={}
    // console.log("result errors:",result.errors)
    if(result.errors.length>0){
        result.errors.forEach(e=>{errors[e.path]=e.msg})
        res.statusCode=400
        return res.json({
            "message": "Bad Request",
            "errors": errors
        })
    }
        let group = await Group.unscoped().findOne({where: {id: req.params.groupId}})
    if(!group){res.statusCode = 404
    return res.json({message: "Group couldn't be found"})}

    let member = await Membership.findOne({where:{userId:req.user.dataValues.id,
    groupId:group.id}})
    //authorization
    let auth = false
    if(group.organizerId===req.user.dataValues.id){auth=true}
    if(member)
    {if(member.status==="co-host"){auth=true}}
        if(auth===false){
        res.statusCode=403
        return res.json({
            "message": "Forbidden"
          })
    }
    let {venueId, name, type, capacity, price, description, startDate, endDate}=req.body
    let ven = await Venue.findOne({where:{id:venueId}})
    if(!ven){
        res.statusCode=404
        return res.json({message: "Venue couldn't be found"})
    }

    try {
        let event = await Event.create({
            venueId,
            name,
            type,
            capacity,
            price,
            description,
            startDate,
            endDate,
            groupId:+req.params.groupId
        })
        await Attendance.create({
            eventId:event.id,
            userId:req.user.dataValues.id,
            status:"attending"
        })

        let payload = {
            id:event.id,
            groupId:event.groupId,
            venueId:event.id,
            name:event.name,
            type:event.type,
            capacity:event.capacity,
            price:event.price,
            description:event.description,
            startDate:event.startDate,
            endDate:event.endDate
        }
        
        res.statusCode = 200
        return res.json(payload)
    } catch (err) {
        res.statusCode =400
        return res.json({
            "message": "Bad Request", // (or "Validation error" if generated by Sequelize),
            "errors": {
              "name": "Name must be at least 5 characters",
              "type": "Type must be Online or In person",
              "capacity": "Capacity must be an integer",
              "price": "Price is invalid",
              "description": "Description is required",
              "startDate": "Start date must be in the future",
              "endDate": "End date is less than start date",
            }
          })
    }
        
    })

    //Get all Members of a Group specified by its id
    router.get("/:groupId/members", async(req,res)=>{
        let group = await Group.findOne({where:{id:req.params.groupId},
        include: [Membership]})
        if(!group){
            res.statusCode=404
            return res.json({message: "Group couldn't be found"})
        }
        let members = await Membership.findAll({where:{groupId:req.params.groupId},
        include: [User]})

        let elite = false
        if(req.user.dataValues.id===group.organizerId){elite=true}
        group.Memberships.forEach((member)=>{
            if(req.user.dataValues.id===member.userId&&member.status==="co-host")
            {elite=true}
        })
        // console.log(elite, group.organizerId)
        if(elite===true){
            let eliteReturn = {Members: []}
            members.forEach((dude)=>{
                eliteReturn.Members.push({
                    id:dude.User.id,
                    firstName:dude.User.firstName,
                    lastName:dude.User.lastName,
                    Membership: {status:dude.status}
                })
            })
            res.statusCode=200
            return res.json(eliteReturn)
        } else {
            let normalReturn = {Members: []}
            members.forEach((dude)=>{
                if(dude.status!=="pending")
                {normalReturn.Members.push({
                    id:dude.User.id,
                    firstName:dude.User.firstName,
                    lastName:dude.User.lastName,
                    Membership: {status:dude.status}
                })}
            })
            res.statusCode=200
            return res.json(normalReturn)
        }

    })

    //Request a Membership for a Group based on the Group's id
    router.post("/:groupId/membership", requireAuth, async(req,res)=>{
        let group = await Group.findOne({where:{id:req.params.groupId}})
        if(!group){res.statusCode=404
        return res.json({message: "Group couldn't be found"})}
        let user = await User.findOne({where:{id:req.user.dataValues.id},
        include: [Membership]})

        let inProcess = false
        let inGroup = false
        user.Memberships.forEach((member)=>{
            if(member.status === "pending" && member.groupId === +req.params.groupId){
                inProcess=true
            }
            if(member.status === "member"||member.status === "co-host" && member.groupId === +req.params.groupId)
            {inGroup = true}
        })
        if(inGroup === true){res.statusCode = 400
        return res.json({message: "User is already a member of the group"})}
        if(inProcess===true){res.statusCode=400
        return res.json({message: "Membership has already been requested"})}


        let mem = await Membership.create({
            userId: req.user.dataValues.id,
            groupId: +req.params.groupId,
            status: "pending"
        })
        let payload = {
            memberId:mem.userId,
            status:mem.status
        }
        res.statusCode = 200
        return res.json(payload)
    })

    //Change the status of a membership for a group specified by id
    router.put("/:groupId/membership", requireAuth, async (req,res)=>{
        let group = await Group.findOne({where:{id:req.params.groupId},
        include:[Membership]})
        if(!group){res.statusCode=404
        return res.json({
            "message": "Group couldn't be found"
          })}
        //   console.log("Group:", group)

        let {memberId, status}=req.body
        // console.log("userId:",req.user.dataValues.id,"groupId:",req.params.groupId)
        
        // console.log("memberId:",memberId,"group.id:",group.id,"membership:",membership)
        
        let membership = await Membership.findOne({where:{userId:memberId,
            groupId:req.params.groupId}})
            
            //authorization
            let memAuth = false
            let hostAuth = false
            
            if(membership)
            {if((status==="member"&&membership.status==="pending")&&group.organizerId===req.user.dataValues.id){memAuth=true}
            if((status==="member"&&membership.status==="pending")&&membership.status==="co-host"){memAuth=true}}
            
            if(group.organizerId===req.user.dataValues.id){hostAuth=true}
            if(memAuth===false&&hostAuth===false){
                res.statusCode=403
                return res.json({
                    "message": "Forbidden"
                })
            }
            let user = await User.findOne({where:{id:memberId}})
            if(!user){res.statusCode=404
          return res.json({
              "message": "User couldn't be found"
            })}

            let member = await Membership.findOne({where:{userId:memberId,
                groupId: req.params.groupId}})
                if(!member){
                    res.statusCode=404
                    return res.json({message: "Membership between the user and the group does not exist"})
                }

            if(status==="pending"){res.statusCode = 400
                return res.json({
                    "message": "Bad Request", // (or "Validation error" if generated by Sequelize),
                    "errors": {
              "status" : "Cannot change a membership status to pending"
            }
          })}

        // console.log("status:", status, "member:", membership)
        if(membership){membership.status=status
        await membership.save()}
        let response = {
            id:membership.userId,
            groupId: group.id,
            memberId: membership.id,
            status: membership.status
        }
        res.statusCode = 200
        return res.json(response)

    })

    //Delete membership to a group specified by id
    router.delete("/:groupId/membership/:memberId", requireAuth, async(req,res)=>{
        let group = await Group.findOne({where:{id:req.params.groupId}})
        if(!group){res.statusCode=404
        return res.json({message: "Group couldn't be found"})}

        let user = await User.findOne({where:{id:req.params.memberId}})
        if(!user){res.statusCode=404
        return res.json({message: "User couldn't be found"})}

        let membership = await Membership.findOne({where:{userId:req.params.memberId,
            groupId: req.params.groupId}})
        if(!membership){res.statusCode=404
        return res.json({message: "Membership does not exist for this User"})}

        // console.log("currId:",req.user.dataValues.id,"groupOrg:",group.organizerId,"memberId:",membership.userId)
        //authorize
        let auth = false
        if(req.user.dataValues.id===group.organizerId){auth=true}
        if(req.user.dataValues.id===membership.userId){auth=true}
        if(auth===false){
        res.statusCode=403
        return res.json({
            "message": "Forbidden"
          })
    }
    // console.log("group:", group, "User:", user,
    // "membership:", membership)

    

    await membership.destroy()
    res.statusCode=200
    return res.json({
        "message": "Successfully deleted membership from group"
      })

    })
    
    module.exports = router