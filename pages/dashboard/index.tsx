import { Avatar, Flex, ScaleFade, Text, Tooltip } from "@chakra-ui/react";
import BaseLayout from "../../components/BaseLayout";
import { getSession } from "next-auth/client";
import { GetGuildIcon } from "../../lib/Utils";
import { useRouter } from "next/router";

export default function DashboardIndex({ session, guilds }) {
  const router = useRouter();

  return (
    <BaseLayout pageTitle="Dashboard">
      <Flex justifyContent="center">
        <Avatar
          w="100px"
          h="auto"
          src={session.user?.image || ""}
          name={session.user?.name || "User"}
        />
      </Flex>

      <Text
        mt="20.5px"
        textAlign="center"
        fontSize={{ base: "5vw", sm: "25px" }}
      >
        {session.user?.name}, select a server!
      </Text>

      <Flex wrap="wrap" mt="3vw" p={10} justifyContent="center">
        {guilds.length === 0 && (
          <Text opacity={0.6}>No servers available</Text>
        )}

        {guilds.map((guild, index) => (
          <ScaleFade
            key={guild.id}
            initialScale={0.4}
            in={true}
            delay={1 + index / 10}
          >
            <Tooltip label={guild.name} bg="black" hasArrow>
              <Avatar
                cursor="pointer"
                src={GetGuildIcon(guild)}
                name={guild.name}
                boxSize="80px"
                m={3}
                _hover={{ transform: "scale(1.1)" }}
                onClick={() => router.push(`/dashboard/${guild.id}`)}
              />
            </Tooltip>
          </ScaleFade>
        ))}
      </Flex>
    </BaseLayout>
  );
}

export const getServerSideProps = async (ctx) => {
  const session = await getSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
      guilds: session.guilds || [], // 🔑 FIX
    },
  };
};
