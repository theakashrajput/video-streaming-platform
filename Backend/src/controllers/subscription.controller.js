import subscriptionModel from "../models/subscription.model.js";
import AppError from "../utils/AppError.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import AppResponse from "../utils/AppResponse.js";
import { isValidObjectId } from "mongoose";

export const toggleSubscription = asyncWrapper(async (req, res) => {
    // Basic validation
    const { channelId } = req.params;
    const subscriberId = req.user._id;

    if (!isValidObjectId(channelId))
        throw new AppError("Invlid channel Id", 400);

    // Prevent self-subscription
    if (channelId.toString() === subscriberId.toString())
        throw new AppError("You cannot subscribe to your own channel", 400);

    // Check for existion subscription
    const existingSubscription = await subscriptionModel.findOne({
        channel: channelId,
        subscriber: subscriberId,
    });

    if (existingSubscription) {
        // Unsubscribe them
        await subscriptionModel.findByIdAndDelete(existingSubscription._id);

        return res
            .status(200)
            .json(
                new AppResponse(200, "Unsubscribed successfully", {
                    subscribed: false,
                })
            );
    } else {
        // Subscribe them
        await subscriptionModel.create({
            channel: channelId,
            subscriber: subscriberId,
        });

        return res
            .status(201)
            .json(
                new AppResponse(201, "Subscribed successfully", {
                    subscribed: true,
                })
            );
    }
});
