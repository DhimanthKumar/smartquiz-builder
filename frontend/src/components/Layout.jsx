// components/Layout.jsx
import { Box } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <Box minHeight="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }}>
      <Navbar />
      <Box as="main" p={4}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
