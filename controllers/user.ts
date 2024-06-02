import { User, Event } from "../models"
import { StatusCodes } from "http-status-codes"
import { BadRequestError, UnauthenticatedError, NotFoundError } from "../errors"
import { Request, Response } from "express"
import mongoose from "mongoose"
import {
    uploadProfileImage as cloudinaryUploadProfileImage,
    deleteProfileImage as cloudinaryDeleteProfileImage,
} from "../utils/imageHandlers/cloudinary"
import setAuthTokenCookie from "../utils/setCookie/setAuthToken"

const getMe = async (req: Request, res: Response) => {
    const user = await User.findById(req.user.userId).populate({
        path: "vendorProfile",
        populate: {
            path: "services",
        },
    })
    if (!user) throw new NotFoundError("User Not Found")
    if (user.status === "blocked")
        throw new UnauthenticatedError("User is blocked.")
    if (user.status === "inactive")
        throw new UnauthenticatedError("User is inactive.")

    setAuthTokenCookie(res, user)

    const socketToken = user.generateSocketToken()

    const events = await Event.find({
        $or: [
            { host: user._id },
            { "userList.user": user._id, "userList.status": "accepted" },
        ],
    })
        .select("name startDate endDate host eventType budget")
        .populate({
            path: "host",
            select: "name email phoneNo profileImage",
        })

    const serviceEvents = await Event.find({
        $or: [
            {
                // @ts-ignore
                "serviceList.vendorProfile": user.vendorProfile?._id,
                "serviceList.status": "accepted",
            },
        ],
    })
        .select("name startDate endDate host eventType budget")
        .populate({
            path: "host",
            select: "name email phoneNo profileImage",
        })

    const eventsNotifications = await Event.find({
        $or: [
            {
                userList: {
                    $elemMatch: {
                        user: user._id,
                        status: "pending",
                    },
                },
            },
            {
                serviceList: {
                    $elemMatch: {
                        vendorProfile: user.vendorProfile,
                        status: "pending",
                    },
                },
            },
        ],
    })
        .select("name host startDate endDate userList serviceList")
        .populate({
            path: "host",
            select: "name profileImage email phoneNo",
        })
        .populate({
            path: "userList.subEvents",
            select: "name startDate endDate venue",
        })
        .populate({
            path: "serviceList.subEvent",
            select: "name startDate endDate venue",
        })
        .populate("serviceList.servicesOffering")

    // console.log(eventsNotifications);

    const notifications = eventsNotifications.map((event) => {
        return {
            ...event.toJSON(),
            userList: event.userList.find(
                (user) =>
                    user.user.toString() === req.user.userId.toString() &&
                    user.status === "pending",
            ),
            serviceList: event.serviceList.filter(
                (service) =>
                    (service.vendorProfile.toString() ===
                        //@ts-ignore
                        user?.vendorProfile?._id?.toString() ||
                        null) &&
                    service.status === "pending",
            ),
        }
    })

    const sendUser = {
        userId: user._id,
        name: user.name,
        email: user.email,
        phoneNo: user.phoneNo,
        profileImage: user.profileImage,
        isVendor: user.vendorProfile ? true : false,
        vendorProfile: user.vendorProfile,
        events: events,
        notifications: notifications,
        serviceEvents: serviceEvents,
        socketToken,
    }

    res.status(StatusCodes.OK).json({
        data: sendUser,
        success: true,
        msg: "User Fetched Successfully",
    })
}

const updateUser = async (
    userId: mongoose.Types.ObjectId,
    key: string,
    value: any,
) => {
    const user = await User.findById(userId)
    if (!user) throw new NotFoundError("User Not Found")
    user.set({ [key]: value })
    await user.save()
}

const updateCompleteProfile = async (req: Request, res: Response) => {
    const { name } = req.body
    const userId = req.user.userId

    if (!name) throw new BadRequestError("Name or Phone Number are required")

    const user = await User.findByIdAndUpdate(userId, {
        name,
    })

    res.status(StatusCodes.OK).json({
        success: true,
        msg: "Profile Updated Successfully",
    })
}

const updateProfileImage = async (req: Request, res: Response) => {
    const userId = req.user.userId
    if (!req.file) throw new BadRequestError("Image is required")

    const isDeleted: boolean = await cloudinaryDeleteProfileImage(userId as any)
    if (!isDeleted) throw new BadRequestError("Failed to delete image")

    const cloudinary_img_url = await cloudinaryUploadProfileImage(req)
    await updateUser(userId, "profileImage", cloudinary_img_url)

    res.status(StatusCodes.OK).json({
        data: { profileImage: cloudinary_img_url },
        success: true,
        msg: "Image Updated Successfully",
    })
}

const deleteProfileImage = async (req: Request, res: Response) => {
    const userId = req.user.userId

    const isDeleted: boolean = await cloudinaryDeleteProfileImage(userId as any)
    if (!isDeleted) throw new BadRequestError("Failed to delete image")
    await updateUser(
        userId,
        "profileImage",
        "https://res.cloudinary.com/dzvci8arz/image/upload/v1715358550/iaxzl2ivrkqklfvyasy1.jpg",
    )

    res.status(StatusCodes.OK).json({
        data: {
            defaultProfileImage:
                "https://res.cloudinary.com/dzvci8arz/image/upload/v1715358550/iaxzl2ivrkqklfvyasy1.jpg",
        },
        success: true,
        msg: "Image Deleted Successfully",
    })
}

const makeMeVendor = async (req: Request, res: Response) => {
    const userId = req.user.userId
    const user = await User.findById(userId)
    if (!user) throw new NotFoundError("User Not Found")
    if (user.vendorProfile)
        throw new BadRequestError("User is already a vendor.")
    const vendorProfile = await user.makeVendor()
    if (!vendorProfile)
        throw new BadRequestError("Failed to make user a vendor.")
    res.status(StatusCodes.CREATED).json({
        data: { vendorProfile },
        success: true,
        msg: "User is now a vendor.",
    })
}

export {
    getMe,
    updateCompleteProfile,
    updateProfileImage,
    deleteProfileImage,
    makeMeVendor,
}
