import NextAuth from "next-auth";
import GoggleProvider from "next-auth/providers/google";

import User from "@models/user";

import { connectToDB } from "@utils/database";
// console.log(process.env);

const handler = NextAuth({
  providers: [
    GoggleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session }) {
      const sessionUser = await User.findOne({
        email: session.user.email,
      });

      session.user.id = sessionUser._id.toString();

      return session;
    },
    async signIn({ account, profile, user, credentials }) {
      try {
        await connectToDB();

        // check if user exists
        const userExists = await User.findOne({
          email: profile?.email,
        });

        console.log("does user exist?", userExists);

        // if not create a new user
        if (!userExists) {
          await User.create({
            email: profile.email,
            username: profile.name.replace(/\s+/g, "").toLowerCase(),
            image: profile.image,
          });
        }
        return true;
        //serverLess -> Lambda -> dynamoDB
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST };
