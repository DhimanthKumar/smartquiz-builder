import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { useContext, useState } from "react";
import { AuthContext } from "../AuthContext";
import { useNavigate } from "react-router-dom";  // ✅ Import this

function Login() {
  const toast = useToast();
  const navigate = useNavigate();  // ✅ Initialize this
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(formData.username, formData.password);
    if (success) {
      toast({
        title: "Login successful",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      navigate("/Home");  // ✅ Redirect after success
    } else {
      toast({
        title: "Login failed",
        description: "Invalid credentials",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.900">
      <Box bg="gray.800" p={10} rounded="md" shadow="xl" w="400px">
        <Heading color="teal.300" mb={6} size="lg" textAlign="center">
          Login
        </Heading>
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <Input
              placeholder="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              bg="gray.700"
              color="white"
              _placeholder={{ color: "gray.400" }}
            />
            <Input
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              bg="gray.700"
              color="white"
              _placeholder={{ color: "gray.400" }}
            />
            <Button type="submit" colorScheme="teal" w="full">
              Login
            </Button>
          </Stack>
        </form>
      </Box>
    </Flex>
  );
}

export default Login;
