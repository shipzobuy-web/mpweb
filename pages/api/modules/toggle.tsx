import { Box, Button, Flex, Icon, Text } from "@chakra-ui/react"
import { getSession } from "next-auth/client"
import BaseLayout from "../../../components/BaseLayout"
import { FetchBotGuilds } from "../../../lib/DbUtils"
import { Modules } from "../../../lib/Modules"
import { FaCheck, FaChessRook, FaDatabase, FaFish, FaHammer, FaHandPaper, FaMailBulk } from "react-icons/fa"
import Switch from "react-switch"
import api from "../../../lib/api"
import { useState } from "react"

export default function GuildDashboard({ session, guild, moduleSettings }) {
  const ModuleBox = ({ moduleName, module, modStatus, icon }) => {
    const [status, setStatus] = useState(modStatus)

    return (
      <Flex
        p={5}
        bg="gray.800"
        rounded="md"
        w="25vw"
        position="relative"
        overflow="hidden"
        direction="column"
      >
        <Icon as={icon} position="absolute" fontSize="8vw" top="-15px" right="10px" opacity={0.3} />
        <Flex alignItems="center" justifyContent="space-between" wrap="wrap">
          <Text fontSize="1.5vw">{moduleName || module}</Text>
          <Switch
            checked={status}
            onChange={async () => {
              const newStatus = await api("/modules/toggle", "POST", {
                guild: guild.id, // use Discord guild ID
                module: module
              })
              setStatus(newStatus.status)
            }}
          />
        </Flex>
      </Flex>
    )
  }

  // If bot isn't in guild, show invite
  if (!guild) {
    return (
      <BaseLayout pageTitle={"Bot not in Guild"}>
        <Flex alignItems="center" justifyContent="center" direction="column">
          <Text fontSize="2.5vw" textAlign="center">
            {"To access this guild's Dashboard, you must invite it in the server!"}
          </Text>
          <Button
            colorScheme="brand.blue"
            onClick={() =>
              window.open(
                `https://discord.com/api/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`
              )
            }
            h="60px"
            w="200px"
            m={2}
          >
            Invite Bot
          </Button>
        </Flex>
      </BaseLayout>
    )
  }

  // Bot is in guild
  return (
    <BaseLayout pageTitle={guild.name} navGuild={guild}>
      <Flex p={5} justifyContent="center" gap={10} wrap="wrap">
        <ModuleBox
          module="Moderation"
          icon={FaHammer}
          modStatus={moduleSettings?.Moderation?.enabled ?? true}
        />
        <ModuleBox
          module="Rules"
          icon={FaCheck}
          modStatus={moduleSettings?.Rules?.enabled ?? true}
        />
        <ModuleBox
          module="Backups"
          icon={FaDatabase}
          modStatus={moduleSettings?.Backups?.enabled ?? true}
        />
        <ModuleBox
          moduleName="Anti Raid"
          module="AntiRaid"
          icon={FaHandPaper}
          modStatus={moduleSettings?.AntiRaid?.enabled ?? true}
        />
        <ModuleBox
          moduleName="Anti Phishing"
          module="AntiPhishing"
          icon={FaFish}
          modStatus={moduleSettings?.AntiPhishing?.enabled ?? true}
        />
        <ModuleBox
          moduleName="Webhook Protection"
          module="Webhooks"
          icon={FaChessRook}
          modStatus={moduleSettings?.Webhooks?.enabled ?? true}
        />
        <ModuleBox
          moduleName="Special Channels"
          module="ContentProtect"
          icon={FaMailBulk}
          modStatus={moduleSettings?.ContentProtect?.enabled ?? true}
        />
      </Flex>
    </BaseLayout>
  )
}

export const getServerSideProps = async (ctx) => {
  const session = await getSession(ctx)
  const { guildId } = ctx.query

  if (!session) {
    return { redirect: { destination: "/login", permanent: false } }
  }

  // Check user has access
  const userGuild = session.guilds.find((g) => g.id === guildId)
  if (!userGuild) {
    return { redirect: { destination: "/login", permanent: false } }
  }

  const botGuilds = await FetchBotGuilds()

  // Use Discord ID consistently
  const guild = botGuilds.find((g) => g.id === guildId) || null

  let moduleSettings = {}
  if (guild) {
    const module = new Modules(guild.id) // pass Discord ID
    moduleSettings = await module.get()
  }

  return { props: { session, guild, moduleSettings } }
}
