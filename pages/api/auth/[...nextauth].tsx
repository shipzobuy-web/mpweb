import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import Cache from "../../../lib/Cache";

// Fetch user info from Discord + cache
const formUser = async (token: string) => {
  const userCache = new Cache("userCache", 1);
  const cachedData = await userCache.retrieve({ _id: token });
  if (cachedData.user) return cachedData.user;

  const res = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();

  if (!("id" in data)) return (await userCache.retrieve({ _id: token })) || {};

  await userCache.update({ _id: token }, { user: data });
  return data;
};

// Fetch guilds from Discord + cache
const formGuilds = async (token: string) => {
  const userCache = new Cache("userCache", 1);
  const cachedData = await userCache.retrieve({ _id: token });
  if (cachedData.guilds) return cachedData.guilds;

  const res = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();

  if (!data[0]) return (await userCache.retrieve({ _id: token }, true)) || [];

  await userCache.update({ _id: token }, { guilds: data });
  return data;
};

export default NextAuth({
  providers: [
    Providers.Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      scope: "identify guilds",
    }),
  ],
  pages: { signIn: "/login" },
  session: {
    // v3 session config
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    // v3 uses this to modify the session object
    async session(session, user) {
      if (user?.accessToken) {
        session.accessToken = user.accessToken;
      }

      // Fetch cached Discord user and guilds
      if (user?.accessToken) {
        session.data = await formUser(user.accessToken);
        const guilds = await formGuilds(user.accessToken);
        session.guilds = guilds
          .filter((g) => (g.permissions & 0x20) > 0)
          .sort((a, b) => a.name.charCodeAt(0) - b.name.charCodeAt(0));
      }

      return session;
    },
    // Optional: modify redirect after sign in
    async redirect(url, baseUrl) {
      return baseUrl; // always redirect to homepage or dashboard
    },
  },
});
