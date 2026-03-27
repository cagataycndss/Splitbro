import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'member'],
    default: 'member',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Grup ismi zorunludur!'],
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Grup bir sahibe (owner) ait olmalıdır!'],
    },
    members: [memberSchema],
  },
  { timestamps: true }
);

// Virtual alanlarla harcamaları vb. alabiliriz
// groupSchema.virtual('expenses', {
//   ref: 'Expense',
//   foreignField: 'group',
//   localField: '_id'
// });

const Group = mongoose.model('Group', groupSchema);
export default Group;
