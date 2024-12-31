import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, createBrowserRouter, RouterProvider } from 'react-router-dom';
// import LoginFormPage from './components/LoginFormPage';
// import SignupFormPage from './components/SignupFormPage';
import Navigation from './components/Navigation/Navigation-bonus';
import LandingPage from './components/LandingPage/LandingPage';
import * as sessionActions from './store/session';
import { Modal } from './context/Modal';
import GroupList from './components/GroupList/GroupList';
import { SpecificGroup } from './components/GroupList/SpecificGroup';
import { SpecificEvent } from './components/EventList/SpecificEvent';
import { EventList } from './components/EventList/EventList';
import { CreateGroup } from './components/GroupList/CreateGroup';
import { CreateEvent } from './components/EventList/CreateEvent';
import { EditGroup } from './components/GroupList/EditGroup';

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true)
    });
  }, [dispatch]);

  return (
    <>
      <Modal/>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && <Outlet />}
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <LandingPage />
      },
      {
        path: '/groups',
        element: <GroupList />
      },
      {
        path: '/groups/:groupId',
        element: <SpecificGroup />
      },
      {
        path: '/events',
        element: <EventList />
      },
      {
        path: '/events/:eventId',
        element: <SpecificEvent />
      },
      {
        path: '/groups/create',
        element: <CreateGroup />
      },
      {
        path: '/events/create',
        element: <CreateEvent />
      },
      {
        path: '/groups/:groupId/edit',
        element: <EditGroup />
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
