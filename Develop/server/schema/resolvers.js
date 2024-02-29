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
        Mutation: {
        addUser: async (parent, { username, email, password }) => {
            try {
                const user = await User.create({username, email, password});
                if (!user) {
                    return { message: 'Error' };
                }
                const token = signToken(user);
                return { token, user };
            } catch (error) {
                console.log(error);
                return { message: 'Error 400', error };
            }
        },

        login: async (parent, { email, password }) => {
            try {
                const user = await User.findOne({ email });
                if (!user) {
                    throw AuthenticationError;
                };

                const correctPw = await user.isCorrectPassword(password);

                if (!correctPw) {
                    throw AuthenticationError;
                }
                const token = signToken(user);
                return { token, user };
            } catch (error) {
                console.log(error);
                return { message: 'Error', error };
            }
        },

        saveBook: async (parent, {bookInput} , context) => {
            try {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: bookInput } },
                    { new: true, runValidators: true }
                );
                
                return updatedUser;
            } catch (error) {
                console.log(error);
                return { message: 'Error 400', error };
            }
        },
        removeBook: async (parent, {bookId}, {user}) => {
            console.log(bookId)
            try {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: user._id },
                    { $pull: { savedBooks: { bookId: bookId } } },
                    { new: true }
                );
                if (!updatedUser) {
                    return { message: "Unable to find user" };
                }
                return updatedUser;
            } catch (error) {
                console.log(error);
                return { message: 'Error', error };
            }
        }
    }
}