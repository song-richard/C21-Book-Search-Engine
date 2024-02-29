const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

module.exports = {
    Query: {
        me: async (parent,  args, { user }) => {
            try {
                const foundUser = await User.findOne({
                    $or: [{ _id: user._id}, { username: user.username }],
                });

                if (!foundUser) {
                    return { message: 'Cannot find a user' };
                }

                return foundUser;

            } catch (error) {
                console.log(error);
                return { message: 'Error', error };
            }
        }

    },
}