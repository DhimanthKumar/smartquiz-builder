// components/Navbar.jsx
import { Flex, Box, Link as ChakraLink, Spacer, useColorMode, IconButton } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const location = useLocation();

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Login', path: '/Login' },
    { name: 'Register', path: '/Register' },
    { name: 'Quizzes', path: '/Quizzes' },
    { name: 'View Score', path: '/Score' },
  ];

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding="1rem 2rem"
      bg="teal.500"
      color="white"
      width="100%"
      boxShadow="md"
    >
      <Box fontWeight="bold" fontSize="xl">
        Quiz App
      </Box>

      <Flex gap={5}>
        {links.map((link) => (
          <ChakraLink
            key={link.name}
            as={Link}
            to={link.path}
            fontWeight={location.pathname === link.path ? 'bold' : 'normal'}
            _hover={{ textDecoration: 'none', color: 'teal.100' }}
          >
            {link.name}
          </ChakraLink>
        ))}

        <IconButton
          size="sm"
          onClick={toggleColorMode}
          icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          aria-label="Toggle Color Mode"
          bg="teal.600"
          _hover={{ bg: 'teal.400' }}
        />
      </Flex>
    </Flex>
  );
};

export default Navbar;
