import { AbsoluteCenter, Button, Flex, Heading } from "@chakra-ui/react";
import { signIn } from "next-auth/client"; // <-- v3 import
import BaseLayout from "../components/BaseLayout";
import { FaDiscord } from "react-icons/fa";
import { useState } from "react";

export default function SignIn() {
  const [isLoading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await signIn("discord", {
      callbackUrl: "/dashboard", // redirect after login
    });
  };

  return (
    <BaseLayout pageTitle="Login">
      <AbsoluteCenter alignItems="center">
        <Flex justifyContent="center" alignItems="center" direction="column">
          <Heading>You must login with Discord to continue</Heading>
          <Button
            my={5}
            color="white"
            bg="#5966f2"
            _hover={{ bg: "#2c3bed" }}
            leftIcon={<FaDiscord />}
            onClick={handleLogin}
            isLoading={isLoading}
            loadingText="Waiting for Authorization..."
          >
            Login with Discord
          </Button>
        </Flex>
      </AbsoluteCenter>
    </BaseLayout>
  );
}
