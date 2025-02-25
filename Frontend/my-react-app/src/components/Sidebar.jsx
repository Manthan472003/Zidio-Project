import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, VStack, Button, Flex, Image, Text, useDisclosure, useToast, Menu, MenuButton, MenuList, MenuItem,
  SimpleGrid, Badge
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircleIcon, DeleteIcon } from '@chakra-ui/icons';
import { MdAddTask, MdDashboard, MdPermDeviceInformation, MdOutlineBuildCircle } from "react-icons/md";
import { FaTasks } from "react-icons/fa";
import { HiOutlineFolderAdd } from "react-icons/hi";
import { RiInformationFill } from "react-icons/ri";
import { TbReport } from "react-icons/tb";
import logo from '../assets/logo.png';
import AddSectionModal from './AddSectionModal';
import AddTaskModal from './AddTaskModal';
import { getSections } from '../Services/SectionService';
import ConfirmLogoutModal from './ConfirmLogoutModal';
import jwt_decode from 'jwt-decode'; // Import jwt-decode
import NotificationPopover from './NotificationPopover';
import { IoMdPricetags } from "react-icons/io";
import { FaAngleUp, FaList, FaUserCheck } from "react-icons/fa"; // Import the notification icon
import { getUnreadNotificationsCount } from '../Services/NotificationService'; // Add this import
import { GrTestDesktop } from "react-icons/gr";
// import bgImage from '../assets/MBGG.png';
import Cookies from 'universal-cookie';


const Sidebar = ({ onSectionAdded, onTaskAdded }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeButton, setActiveButton] = useState(location.pathname);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [unreadCount, setUnreadCount] = useState(0); // State to store unread count
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [, setIsOpen] = useState(location.pathname === '/Home'); // Manage Collapse state
  const { isOpen: isSectionOpen, onOpen: onSectionOpen, onClose: onSectionClose } = useDisclosure();
  const { isOpen: isTaskOpen, onOpen: onTaskOpen, onClose: onTaskClose } = useDisclosure();
  const { isOpen: isLogoutOpen, onOpen: onLogoutOpen, onClose: onLogoutClose } = useDisclosure();
  const toast = useToast();

  const cookies = useMemo(() => new Cookies(), []);

  // Fetch unread notifications count when Sidebar is loaded
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await getUnreadNotificationsCount(userId);
      setUnreadCount(response.data.count); // Update unread count
    } catch (error) {
      console.error('Error fetching unread notifications count:', error);
    }
  }, [userId]);

  // Fetch sections list
  const fetchSections = useCallback(async () => {
    try {
      const response = await getSections();
      if (response && response.data) {
        // Handle sections data if needed
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Fetch Sections Error:', error);
    }
  }, []);

  useEffect(() => {
    fetchSections();
    // const token = localStorage.getItem('token'); 
    const token = cookies.get("token");
    if (token) {
      const decoded = jwt_decode(token); // Decode the JWT token
      setUserName(decoded.userName); // Set the user information state
      setUserId(decoded.id);
    }
    if (userId) {
      fetchUnreadCount(); // Initial fetch when Sidebar loads

      // Set interval to fetch unread count every 3 seconds
      const intervalId = setInterval(() => {
        fetchUnreadCount();
      }, 3000);

      // Clean up the interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [userId, fetchUnreadCount, fetchSections, cookies]);

  useEffect(() => {
    setActiveButton(location.pathname);
    if (location.pathname === '/Home') {
      setIsOpen(true); // Open Collapse when navigating to Home
    } else {
      setIsOpen(false); // Close Collapse when navigating elsewhere
    }
  }, [location.pathname]);

  const handleNavigation = (path) => {
    setActiveButton(path);
    navigate(path);
  };

  const handleLogout = () => {
    onLogoutOpen();

  };

  const confirmLogout = () => {
    // localStorage.removeItem('token'); // Remove token on logout
    navigate('/login');
    cookies.remove('token');
    handleReload();
  };

  const handleReload = () => {
    window.location.reload();
  };

  const handleSectionAdded = async () => {
    await fetchSections();
    if (onSectionAdded) {
      onSectionAdded(); // Notify TaskManager to refresh
    }

  };

  const handleTaskAdded = async () => {
    toast({
      title: "Task added.",
      description: "The new task was successfully added.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });

    if (onTaskAdded) {
      await onTaskAdded();  // Notify TaskManager to refresh tasks
    }
  };

  const buttonStyles = {
    base: {
      fontSize: '15px',
      fontWeight: 'bold',
      borderWidth: '1px',
      borderColor: 'white',
      color: '#2D5BA8',
      backgroundColor: '#edf9ff',
      padding: '8px 6px',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      marginBottom: '2px',
      width: '100%',
      textAlign: 'left',
      justifyContent: 'start',
    },
    hover: {
      color: '#ffffff',
      backgroundImage: "linear-gradient(288deg, rgba(0,85,255,0.8) 1.5%, rgba(4,56,115,0.8) 91.6%)"
    },
    active: {
      borderWidth: '2px',
      borderColor: '#007bff',
      backgroundImage: "linear-gradient(288deg, rgba(0,85,255,1) 1.5%, rgba(4,56,115,1) 91.6%)",
      color: '#ffffff',
      _hover: {
        backgroundImage: "linear-gradient(288deg, rgba(0,85,255,0.8) 1.5%, rgba(4,56,115,0.8) 91.6%)",
      },
    },
  };

  return (
    <Box
      width="300px"
      padding="16px"
      // backgroundImage={`url(${bgImage})`}
      // backgroundSize="cover"
      // backgroundPosition="center"
      backgroundColor='#eeeffd'
      color="#2D5BA8"
      height="100vh"
      position="fixed"
      top="0"
      left="0"
      display="flex"
      flexDirection="column"
    >
      <Flex direction="row" align="center" mb={2} onClick={handleReload} cursor="pointer"
      >
        <Image ml={5} src={logo} alt="App Logo" width="60px" height={10} />
        <Text
          color="#2D5BA8"
          fontSize="1.4rem"
          fontWeight="bold"
          ml={4}
        >
          Zidio Task Management
        </Text>
      </Flex>

      <Box height="100vh" overflowY="auto">
        <VStack
          spacing={2}
          align="start"
          background="#FFFFFF"
          padding={2.5}
          borderRadius="md"
          flex="1"
          position="relative"
        >

          <SimpleGrid columns={2} spacing={2} width="100%">
            <Button
              {...buttonStyles.base}
              {...(activeButton === '/add-section' && buttonStyles.active)}
              _hover={{ ...buttonStyles.hover }}
              onClick={onSectionOpen}
              flexDirection="column"
              alignItems="center"
              size="xl"
              padding={4}
            >
              <Box as={HiOutlineFolderAdd} size={24} mb={2} />
              Add Section
            </Button>
            <AddSectionModal
              isOpen={isSectionOpen}
              onClose={onSectionClose}
              onSectionAdded={handleSectionAdded}
            />

            <Button
              {...buttonStyles.base}
              {...(activeButton === '/add-task' && buttonStyles.active)}
              _hover={{ ...buttonStyles.hover }}
              onClick={onTaskOpen}
              flexDirection="column"
              alignItems="center"
              size="xl"
              padding={4}
            >
              <Box as={MdAddTask} size={24} mb={2} />
              Add Task
            </Button>
            <AddTaskModal
              isOpen={isTaskOpen}
              onClose={onTaskClose}
              onSubmit={handleTaskAdded}
              userId={userName}
              sectionID={null}
            />
          </SimpleGrid>

          <Button
            leftIcon={<MdDashboard size={20} />}
            {...buttonStyles.base}
            {...(activeButton === '/Home' && buttonStyles.active)}
            _hover={{ ...buttonStyles.hover }}
            onClick={() => handleNavigation('/Home')}
          >
            Dashboard
          </Button>

          <Button
            leftIcon={<FaTasks />}
            {...buttonStyles.base}
            {...(activeButton === '/my-tasks' && buttonStyles.active)}
            _hover={{ ...buttonStyles.hover }}
            onClick={() => handleNavigation('/my-tasks')}
          >
            My Tasks
          </Button>

          <Button
            leftIcon={<FaList size={15} />}
            {...buttonStyles.base}
            {...(activeButton === '/sections' && buttonStyles.active)}
            _hover={{ ...buttonStyles.hover }}
            onClick={() => handleNavigation('/sections')}
          >
            Sections
          </Button>

          <Button
            leftIcon={<GrTestDesktop size={18.5} />}
            {...buttonStyles.base}
            {...(activeButton === '/QA-tester' && buttonStyles.active)}
            _hover={{ ...buttonStyles.hover }}
            onClick={() => handleNavigation('/QA-tester')}
          >
            QA / Tester
          </Button>

          <Button
            leftIcon={<CheckCircleIcon size={25} />}
            {...buttonStyles.base}
            {...(activeButton === '/completed-tasks' && buttonStyles.active)}
            _hover={{ ...buttonStyles.hover }}
            onClick={() => handleNavigation('/completed-tasks')}
          >
            Completed Tasks
          </Button>

          <Button
            leftIcon={<FaUserCheck size={20} />}
            {...buttonStyles.base}
            {...(activeButton === '/users' && buttonStyles.active)}
            _hover={{ ...buttonStyles.hover }}
            onClick={() => handleNavigation('/users')}
          >
            Users
          </Button>

          <Button
            leftIcon={<IoMdPricetags size={20} />}
            {...buttonStyles.base}
            {...(activeButton === '/tag' && buttonStyles.active)}
            _hover={{ ...buttonStyles.hover }}
            onClick={() => handleNavigation('/tag')}
          >
            Tags
          </Button>

          <Button
            leftIcon={<DeleteIcon />}
            {...buttonStyles.base}
            {...(activeButton === '/bin' && buttonStyles.active)}
            _hover={{ ...buttonStyles.hover }}
            onClick={() => handleNavigation('/bin')}
          >
            Bin
          </Button>


        </VStack>
      </Box>

      <Flex
        direction="column"
        align="center"
        mt="auto"
        padding="16px"
        backgroundColor="#ecf2f7"
      >
        <Flex width="113%" align="center">
          <Menu>
            <MenuButton as={Button} rightIcon={<FaAngleUp size={20} />} colorScheme="#086F83" width="100%" backgroundImage="linear-gradient(288deg, rgba(0,85,255,1) 1.5%, rgba(4,56,115,1) 91.6%)" color="white">
              Hi, {userName.split(' ')[0] || 'User'}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => navigate('/profile')}>Profile Settings</MenuItem>
              <MenuItem onClick={handleLogout} colorScheme="red">Logout</MenuItem>
            </MenuList>
          </Menu>

          <Box position="relative">
            <NotificationPopover
              isOpen={isNotificationOpen}
              onToggle={() => setNotificationOpen(!isNotificationOpen)}
              userId={userId}
              setUnreadCount={setUnreadCount} // Pass setUnreadCount here
              unreadCount={unreadCount}
            />
            {unreadCount > 0 && (
              <Badge
                colorScheme="red"
                position="absolute"
                top="-5px"
                right="-10px"
                borderRadius="full"
                fontSize="0.8em"
                paddingX="0.5em"
              >
                {unreadCount}
              </Badge>
            )}
          </Box>
        </Flex>


        <ConfirmLogoutModal
          isOpen={isLogoutOpen}
          onClose={onLogoutClose}
          onConfirm={confirmLogout}
        />
      </Flex>
    </Box>
  );
};

export default Sidebar;