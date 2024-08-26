import { Schema, model } from "mongoose";
import { v4 as uuidv4 } from 'uuid';

const ticketCollection = 'tickets';

const ticketSchema = new Schema(
  {
    ticket_id: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      required: true,
    },
    code: {
      type: String,
      unique: true,
      required: true,
      default: () => uuidv4().replace(/-/g, '').slice(0, 12),
    },
    purchase_datetime: {
      type: Date,
      default: Date.now,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    purchaser: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'purchase_datetime', updatedAt: false },
    versionKey: false,
  }
);

// ODM
export const ticketModel = model(ticketCollection, ticketSchema);