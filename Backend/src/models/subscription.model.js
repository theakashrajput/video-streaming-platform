import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
    {
        channel: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        subscriber: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

subscriptionSchema.index({ channel: 1, subscriber: 1 }, { unique: true });

const subscriptionModel = mongoose.model("Subscription", subscriptionSchema);

export default subscriptionModel;