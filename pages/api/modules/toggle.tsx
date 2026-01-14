import { Box, Button, Flex, Icon, Text } from "@chakra-ui/react"
import { getSession } from "next-auth/client"
import BaseLayout from "../../../components/BaseLayout"
import { Modules } from "../../../lib/Modules"
import { FaCheck, FaChessRook, FaDatabase, FaFish, FaHammer, FaHandPaper, FaMailBulk } from "react-icons/fa"
import Switch from "react-switch"
import { useState } from "react"
import api from "../../../lib/api"

type GuildToggleProps = {
  session: any
  guild: any
  moduleSettings: Record<string, any>
}

export default function GuildDashboard({ session, guild, moduleSettings }: GuildToggleProps) {
  // Component to display each module toggle
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
                guild: guild.id, // use guild.id from Discord session
                module: module
              })
              setStatus(newStatus.status)
            }}
          />
        </Flex>
      </Flex>
    )
  }

  // If the bot is not in the guild
  if (!guild) {
    return (
      <BaseLayout pageTitle="Bot not in Guild">
        <Flex alignItems="center" justifyContent="center" direction="column">
          <Text fontSize="2.5vw" textAlign="center">
            To access this guild's Dashboard, you must invite it in the server!
          </Text>
          <Button
            colorScheme="brand.blue"
            onClick={() =>
              window.open(
                `https://discord.com/api/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`,
                "_blank"
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

  // Render the dashboard if the bot is in the guild
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

// SERVER-SIDE PROPS
export const getServerSideProps = async (ctx) => {
  const session = await getSession(ctx)
  const { guildId } = ctx.query

  // redirect if no session
  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false
      }
    }
  }

  // find the guild in the user's Discord session
  const userGuild = session.guilds.find((g) => g.id === guildId)
  const botGuild = userGuild?.bot ? userGuild : null // bot present only if userGuild.bot === true

  // if the bot is not in the guild, guild will be null
  if (!botGuild) {
    return {
      props: {
        session,
        guild: null,
        moduleSettings: {}
      }
    }
  }

  // fetch module settings for this guild from your database
  const moduleManager = new Modules(botGuild.id)
  const moduleSettings = await moduleManager.get()

  return {
    props: {
      session,
      guild: botGuild,
      moduleSettings
    }
  }
}
