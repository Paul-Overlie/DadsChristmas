const express = require('express')
const bcrypt = require('bcryptjs')
const {Group, GroupImage, Membership, Venue, User, Event, EventImage, Attendance}=require("../../db/models")
const Sequelize = require("sequelize")
const {check, validationResult}=require("express-validator")

const { setTokenCookie, requireAuth } = require('../../utils/auth');

const router = express.Router()
let queryValidations=[
    check('page')
        .isInt({min:1})
        .withMessage("Page must be greater than or equal to 1"),
    check('size')
        .isInt({min:1})
        .withMessage("Size must be greater than or equal to 1")
]

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

//Get all Events
router.get("/", queryValidations, async(req,res)=>{
    let result = validationResult(req)
    let errArr = []
    result.errors.forEach(e=>{if(e.value!==undefined){errArr.push(e)}})
    let errors={}
    // console.log(result.errors)
    if(errArr.length>0){
        errArr.forEach(e=>{errors[e.path]=e.msg})
        res.statusCode=400
        return res.json({
            "message": "Bad Request",
            "Errors": errors
        })
    }
    // console.log("body",req.body)
    let errmessage = {message: "Bad Request",
errors:{}}
    let {page, size}=req.query
    // console.log("page:",page,"size:",size)
    let limit = 20
    let offset = 0
    let Pages =1
    if(Number.isInteger(+page)){
        let Page = +page
        // console.log("Page:",Page)
        if(!Page){Page=1}
        if(Page>10){Page=10}
        Pages = Page
    }
    if(Number.isInteger(+size)){
        let Size = +size
        // console.log("Size:",Size)
        if(!Size){Size=20}
        if(Size>20){Size=20}
        limit = Size
    }
    // console.log("end limit:",limit, "end page:", Pages)
    offset=limit*(Pages-1)

    
    let origin = await Event.findAll({
        include: [Attendance, EventImage, Venue, Group],
        limit:limit,
        offset:offset
    })
    // console.log("origin", origin, "originId", origin.id)
    let events =[]

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

        origin.forEach((event)=>{
            // console.log("Group:", event.Group, "Venue:",event.Venue)
            // console.log("PASSED HERE")
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
        let prev = []
        event.EventImages.forEach((img)=>{
            if(img.preview===true){prev.push(img.url)}
        })
        if(prev[0]){prev=prev[0]}else{prev=null}
        // console.log("events", event.dataValues)
        events.push({
        id: event.id,
        groupId: event.groupId,
        venueId: event.venueId,
        name: event.name,
        type: event.type,
        startDate: formatDate(event.startDate),
        endDate: formatDate(event.endDate),
        numAttending: event.Attendances.length,
        previewImage: prev,
        Group: gru,
        Venue: ven,
        description: event.description
    })})
    
    let payload = {Events: events}

    res.statusCode = 200
    return res.json(payload)
})

//Get details of an Event specified by its id
router.get("/:eventId", async(req,res)=>{
    let event = await Event.findOne({where:{id:req.params.eventId},
    include: [Attendance, Group, Venue, EventImage]})
    if(!event){
        res.statusCode=404
        return res.json({message: "Event couldn't be found"})
    }

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

    let {id, groupId, venueId, name, description, type, capacity, price, startDate, endDate}=event
    let payload = {
        id,
        groupId,
        venueId,
        name,
        description,
        type,
        capacity,
        price,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        numAttending:event.Attendances.length,
        Group: {id:event.Group.id,
            name:event.Group.name,
            private: event.Group.private,
            city:event.Group.city,
            state:event.Group.state},
        Venue: {id:event.Venue.id,
            address:event.Venue.address,
            city:event.Venue.city,
            state:event.Venue.state,
            lat:event.Venue.lat,
            lng:event.Venue.lng},
        EventImages: []
    }

    event.EventImages.forEach((img)=>{
        payload.EventImages.push({
            id:img.id,
            url:img.url,
            preview:img.preview
        })
    })

    res.statusCode=200
    return res.json(payload)
})

//Add an Image to an Event based on the Event's id
router.post("/:eventId/images", requireAuth, async(req,res)=>{
    let event = await Event.unscoped().findOne({where: {id: req.params.eventId},
    include: [Group]})
    
    if(!event){res.statusCode = 404
        return res.json({message: "Event couldn't be found"})}

        //authorization
        let auth = false
        let attendance = await Attendance.findOne({where:{userId:req.user.dataValues.id, eventId:event.id}})
        let membership = await Membership.findOne({where:{groupId:event.groupId,
        userId:req.user.dataValues.id}})
            // console.log("status:",membership.status,"Id:",membership.userId,"realId:",req.user.dataValues.id,
            // "attendStatus:",attendance.status)
            if(membership)
            {if(membership.status==="co-host"){auth=true}}
        
    if(attendance&&attendance.status==="attending"){auth=true}
    if(event.Group)
    {if(event.Group.organizerId===req.user.dataValues.id){auth=true}}
    if(auth===false){
        res.statusCode=403
        return res.json({
            "message": "Forbidden"
          })
    }

    let {url, preview}=req.body
    let img = await EventImage.create({
        url: url,
        preview: preview,
        eventId: req.params.eventId
    })

    let payload = {
        id: img.id,
        url: img.url,
        preview: img.preview
    }

    res.statusCode=200
    return res.json(payload)
})

//Edit an Event specified by its id
router.put("/:eventId", requireAuth, editQueryValidations, async(req,res)=>{
    let result = validationResult(req)
    if(!result.errors.find(e=>e.path==="endDate")&&new Date(req.body.startDate).getTime()>new Date(req.body.endDate).getTime()){
        result.errors.push({path:"endDate",
            msg:"End date is less than start date"
        })
    }
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
    let event = await Event.findOne({where:{id:req.params.eventId}})
    if(!event){res.statusCode=404
    return res.json({message: "Event couldn't be found"})}
    let group = await Group.findOne({where: {id:event.groupId},
    include: [Membership]})
    let attend = await Attendance.findOne({where:{eventId:req.params.eventId,
    userId:req.user.dataValues.id}})
    
    //authorize
    let auth=false
    group.Memberships.forEach((member)=>{
        if(member.userId===req.user.dataValues.id&&member.status==="co-host")
        {auth=true}
    })
    if(req.user.dataValues.id===group.organizerId){auth=true}
    if(attend)
    {if(attend.status==='attending'){auth=true}}
    if(auth===false){
        res.statusCode=403
        return res.json({
            "message": "Forbidden"
        })
    }
    let {venueId, name, type, capacity, price, description, startDate, endDate}=req.body

    let venue = await Venue.findOne({where:{id:venueId}})
    if(!venue){
        res.statusCode=404
        return res.json({message: "Venue couldn't be found"})
    }

    if(venueId){event.venueId = venueId}
    if(name)event.name = name
    if(type)event.type=type
    if(capacity)event.capacity=capacity
    if(price)event.price=price
    if(description)event.description=description
    if(startDate)event.startDate=startDate
    if(endDate)event.endDate=endDate
    try{
        await event.save()

        let payload = {
            id:event.id,
            groupId:event.groupId,
            venueId:event.venueId,
            name:event.name,
            type:event.type,
            capacity:event.capacity,
            price:event.price,
            description:event.description,
            startDate:event.startDate,
            endDate:event.endDate
        }
        
        res.statusCode=200
        return res.json(payload)
    }catch(err){
        res.statusCode=400
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

//Delete an Event specified by its id
router.delete("/:eventId", requireAuth, async(req,res)=>{
    let event = await Event.findOne({where:{id:req.params.eventId}})

    if(!event){res.statusCode=404
    return res.json({message: "Event couldn't be found"})}

    let group = await Group.findOne({where:{id:event.groupId},
    include: [Membership]})
    //authorize
    let auth=false
    group.Memberships.forEach((member)=>{
        if(member.userId===req.user.dataValues.id&&member.status==="co-host")
        {auth=true}
    })
    if(req.user.dataValues.id===group.organizerId){auth=true}
    if(auth===false){
        res.statusCode=403
        return res.json({
            "message": "Forbidden"
        })
    }

    await event.destroy()
    res.statusCode=200
    return res.json({message: "Successfully deleted"})
})

//Get all Attendees of an Event specified by its id
router.get("/:eventId/attendees", async(req,res)=>{
    // console.log(1)
    let event = await Event.findOne({where:{id:req.params.eventId}})
    if(!event){res.statusCode=404
    return res.json({message:"Event couldn't be found"})}
    // console.log(2)
    let group = await Group.findOne({where:{id:event.groupId},
    include:[Membership]})
    // console.log(3)
    let attendance = await Attendance.findAll({where:{eventId:req.params.eventId},
    include: [User]})
    // console.log(4)
    // console.log("userId:",req.user.dataValues.id,"organizerId:",group.organizerId)

    //is organizer or a co-host
        let elite = false
        if(group&&req.user.dataValues.id===group.organizerId){elite=true}
        group.Memberships.forEach((member)=>{
            if(member.userId===req.user.dataValues.id&&member.status==="co-host")
            {elite=true}
        })
        // console.log(5)
        if(elite===true){
            let attend = {Attendees: []}
            attendance.forEach((at)=>{
                attend.Attendees.push({
                    id:at.User.id,
                    firstName:at.User.firstName,
                    lastName:at.User.lastName,
                    Attendance: {status:at.status}
                })
                // console.log(6)
            })
            // console.log(7)
            res.statusCode=200
            return res.json(attend)

        } else {
            // console.log(8)
            let attends = {Attendees: []}
            attendance.forEach((att)=>{
                if(att.status!=="pending"){
                    attends.Attendees.push({
                        id:att.User.id,
                        firstName:att.User.firstName,
                        lastName:att.User.lastName,
                        Attendance: {status:att.status}
                    })
                    // console.log(9)
                }
                // console.log(10)
            })
            res.statusCode=200
            return res.json(attends)
        }

})

//Request to Attend an Event based on the Event's id
router.post("/:eventId/attendance", requireAuth, async(req,res)=>{
    let event = await Event.findOne({where:{id:req.params.eventId}})
    if(!event){res.statusCode=404
    return res.json({message: "Event couldn't be found"})}
    let group = await Group.findOne({where:{id:event.groupId},
    include: [Membership]})

    let attendance = await Attendance.findOne({where:{eventId:event.id,
    userId:req.user.dataValues.id}})

    //authorize
    let auth=false
    
    group.Memberships.forEach((member)=>{
        // console.log("user:", req.user.dataValues.id,
        // "memberId:", member.userId,
        // "status:",member.status)
        if(member)
        {if(req.user.dataValues.id===member.userId&&(member.status==="co-host"||member.status==="member")){auth=true}}

        // console.log("current user:",req.user.dataValues.id,"userId:",attendance.userId,"status:",attendance.status)
        if(attendance)
        {if(req.user.dataValues.id===attendance.userId&&attendance.status==="pending")
        {res.statusCode=400
        return res.json({message:"Attendance has already been requested"})}
        if(req.user.dataValues.id===attendance.userId&&attendance.status==="attending")
        {res.statusCode=400
        return res.json({message: "User is already an attendee of the event"})}}
    })
    if(auth===false){
        res.statusCode=403
        return res.json({
            "message": "Forbidden"
        })
    }

    

    let request = await Attendance.create({
        eventId:req.params.eventId,
        userId: req.user.dataValues.id,
        status: "pending"
    })
    let payload = {
        userId:request.userId,
        status:request.status
    }

    res.statusCode=200
    return res.json(payload)
})

//Change the status of an attendance for an event specified by id
router.put("/:eventId/attendance", requireAuth, async(req,res)=>{
    let event = await Event.findOne({where:{id:req.params.eventId},
    include: [Group]})
    if(!event){res.statusCode=404
    return res.json({message: "Event couldn't be found"})}
    let member = await Membership.findAll({where:{groupId:event.Group.id}})

    
    
    //authorize
    let auth = false
    if(event.Group.organizerId===req.user.dataValues.id){auth=true}
    member.forEach((mem)=>{
        // console.log("organizerId:",event.Group.organizerId,
        // "userId:",req.user.dataValues.id,
        // "member'sUserId:",mem.userId,
        // "memberStatus:",mem.status)
        // console.log("mem:",mem)
        if(mem.userId===req.user.dataValues.id&&mem.status==="co-host"){auth=true}
    })
    if(auth===false){
        res.statusCode=403
        return res.json({
            "message": "Forbidden"
        })
    }

    let {userId, status}=req.body

    let user = await User.findOne({where:{id:userId}})
    if(!user){res.statusCode=404
    return res.json({message: "User couldn't be found"})}
    if(status==="pending"){res.statusCode=400
    return res.json({
        "message": "Bad Request", // (or "Validation error" if generated by Sequelize),
        "errors": {
          "status" : "Cannot change an attendance status to pending"
        }
      })}

    let attendance = await Attendance.findOne({where:{userId:userId,
    eventId:req.params.eventId}})
    if(!attendance){res.statusCode=404
    return res.json({
        "message": "Attendance between the user and the event does not exist"
      })}
    attendance.status=status
    await attendance.save()

    let payload = {
        id:attendance.id,
        eventId:attendance.eventId,
        userId:attendance.userId,
        status:attendance.status
    }

    res.statusCode=200
    return res.json(payload)
})

//Delete attendance to an event specified by id
router.delete("/:eventId/attendance/:userId", requireAuth, async(req,res)=>{
    let event = await Event.findOne({where:{id:req.params.eventId},
    include: [Group]})
    if(!event){res.statusCode=404
    return res.json({message: "Event couldn't be found"})}
    let user = await User.findOne({where:{id:req.params.userId}})
    if(!user){res.statusCode=404
    return res.json({message: "User couldn't be found"})}

    
    //authorize
    let auth = false
    if(event.Group.organizerId===req.user.dataValues.id){auth=true}
    if(+req.params.userId===req.user.dataValues.id){auth=true}
    if(auth===false){
        res.statusCode=403
        return res.json({
            "message": "Forbidden"
        })
    }    
    
    let attendance = await Attendance.findOne({where:{userId:req.user.dataValues.id,
    eventId:req.params.eventId}})
    if(!attendance){res.statusCode=404
    return res.json({message: "Attendance does not exist for this User"})}
    await attendance.destroy()

    res.statusCode=200
    return res.json({
        "message": "Successfully deleted attendance from event"
      })
})

module.exports = router