import { useContext } from 'react';
import { 
  Flex, 
  Box, 
  Link as ChakraLink, 
  Spacer, 
  useColorMode, 
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Text,
  HStack
} from '@chakra-ui/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MoonIcon, SunIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { AuthContext } from '../AuthContext';

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Different navigation links based on user role
  const getNavigationLinks = () => {
    if (!user) {
      return [
        { name: 'Home', path: '/' },
        { name: 'Login', path: '/login' },
        { name: 'Register', path: '/register' }
      ];
    }

    if (user.typeofrole === 'student') {
      return [
        { name: 'Dashboard', path: '/student' },
        { name: 'My Courses', path: '/student' },
        { name: 'All Quizzes', path: '/student/quizzes' },
        { name: 'My Scores', path: '/student/scores' }
      ];
    }

    if (user.typeofrole === 'teacher' || user.typeofrole === 'admin') {
      return [
        { name: 'Dashboard', path: '/teacher' },
        { name: 'Create Quiz', path: '/teacher/create-quiz' },
        { name: 'Manage Quizzes', path: '/teacher/manage-quizzes' }
      ];
    }

    return [];
  };

  const navigationLinks = getNavigationLinks();

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
        <ChakraLink as={Link} to="/" _hover={{ textDecoration: 'none' }}>
          QuizMaster {user?.typeofrole === 'teacher' ? 'Pro' : ''}
        </ChakraLink>
      </Box>

      <Flex gap={5} align="center">
        {navigationLinks.map((link) => (
          <ChakraLink
            key={link.name}
            as={Link}
            to={link.path}
            fontWeight={location.pathname === link.path ? 'bold' : 'normal'}
            _hover={{ textDecoration: 'none', color: 'teal.100' }}
            display={{ base: 'none', md: 'block' }}
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

        {user ? (
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} bg="teal.600" _hover={{ bg: 'teal.400' }}>
              <HStack spacing={2}>
                <Avatar size="sm" name={user.username} bg="teal.300" />
                <Text display={{ base: 'none', md: 'block' }}>{user.username}</Text>
              </HStack>
            </MenuButton>
            <MenuList color="black">
              <MenuItem as={Text} fontWeight="bold" cursor="default" _hover={{}}>
                {user.typeofrole.charAt(0).toUpperCase() + user.typeofrole.slice(1)} Account
              </MenuItem>
              <MenuItem onClick={() => navigate(user.typeofrole === 'student' ? '/student' : '/teacher')}>
                Dashboard
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        ) : null}
      </Flex>
    </Flex>
  );
};

export default Navbar;