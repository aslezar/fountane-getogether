import { Schema, model, Types } from "mongoose"
import { IEvent, IUserList } from "../types/models"
import jwt from "jsonwebtoken"
import { NotFoundError } from "../errors"
import { EventPayload } from "../types/express"
import Permissions from "../permissions"
import Roles from "../roles"

const UserList = new Schema<IUserList>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Please Provide User."],
        },
        role: {
            type: String,
            enum: Array.from(Object.values(Roles)),
            required: [true, "Please Provide Role."],
        },
        permission: [
            {
                type: String,
                enum: Array.from(Object.values(Permissions)),
            },
        ],
    },
    { timestamps: true },
)

const EventSchema = new Schema<IEvent>(
    {
        name: {
            type: String,
            required: [true, "Please Provide Name."],
        },
        host: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Please Provide Host."],
        },
        startDate: {
            type: Date,
            required: [true, "Please Provide Start Date."],
        },
        endDate: {
            type: Date,
            required: [true, "Please Provide End Date."],
        },
        budget: {
            type: Number,
            required: [true, "Please Provide Budget."],
        },
        //these are embedded documents
        userList: [UserList],
        subEvents: {
            type: [Schema.Types.ObjectId],
            ref: "SubEvent",
        },
    },
    { timestamps: true },
)

EventSchema.index({ "userList.userId": 1 }, { unique: true })

EventSchema.pre("save", function (next) {
    if (this.isNew === true) {
        //assign host to user list with all permissions
        this.userList.push({
            user: this.host,
            role: Roles.HOST,
            permission: Array.from(Object.values(Permissions)),
        })
    }
    next()
})

EventSchema.methods.generateToken = function (userId: Types.ObjectId) {
    const isHost = this.host.toString() === userId.toString()
    const user = this.userList.find(
        (user: IUserList) => user.user.toString() === userId.toString(),
    )
    if (!user && !isHost)
        throw new NotFoundError("User is not part of this event.")
    const permission = user?.permission
    const role = user?.role

    return jwt.sign(
        {
            eventId: this._id,
            role,
            isHost,
            permission,
        } as EventPayload,
        process.env.JWT_SECRET as jwt.Secret,
        {
            expiresIn: process.env.JWT_LIFETIME,
        },
    )
}

const Event = model<IEvent>("Event", EventSchema)
export default Event
