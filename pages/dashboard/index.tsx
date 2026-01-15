import { Avatar, Flex, ScaleFade, Text, Tooltip, Badge } from "@chakra-ui/react"
import BaseLayout from "../../components/BaseLayout"
import { getSession } from "next-auth/client"
import { FetchBotGuilds } from "../../lib/DbUtils"
import { useRouter } from "next/router"

export default function DashboardIndex({ session, botGuildIds }) {
    const router = useRouter()

    return (
        <BaseLayout pageTitle="Dashboard">
            <Flex justifyContent="center">
                <Avatar
                    w="100px"
                    src={session.user.image}
                    name={session.user.name}
                />
            </Flex>

            <Text mt="20px" textAlign="center" fontSize="25px">
                {session.user.name}, select a server
            </Text>

            <Flex wrap="wrap" mt={10} justifyContent="center">
                {session.guilds.map((guild, index) => {
                    const hasBot = botGuildIds.includes(guild.id)
                    const icon = guild.icon
                        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
                        : undefined

                    return (
                        <ScaleFade key={guild.id} initialScale={0.4} in delay={0.1 * index}>
                            <Tooltip label={guild.name} hasArrow>
                                <Flex
                                    direction="column"
                                    align="center"
                                    m={3}
                                    cursor="pointer"
                                    onClick={() =>
                                        hasBot
                                            ? router.push(`/dashboard/${guild.id}`)
                                            : window.open(
                                                  `https://discord.com/api/oauth2/authorize?client_id=969263464050741368&permissions=8&scope=bot%20applications.commands`
                                              )
                                    }
                                >
                                    <Avatar
                                        boxSize="80px"
                                        src={icon}
                                        name={guild.name}
                                    />
                                    {!hasBot && (
                                        <Badge mt={2} colorScheme="red">
                                            Invite Bot
                                        </Badge>
                                    )}
                                </Flex>
                            </Tooltip>
                        </ScaleFade>
                    )
                })}
            </Flex>
        </BaseLayout>
    )
}

export const getServerSideProps = async (ctx) => {
    const session = await getSession(ctx)
    if (!session) {
        return {
            redirect: { destination: "/login", permanent: false }
        }
    }

    const botGuilds = await FetchBotGuilds()
    const botGuildIds = botGuilds.map(g => g._id)

    return {
        props: {
            session,
            botGuildIds
        }
    }
}

