import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import * as sessionActions from '../../store/session';
import OpenModalMenuItem from './OpenModalMenuItem';
import LoginFormModal from '../LoginFormModal';
import SignupFormModal from '../SignupFormModal';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaAngleDown } from "react-icons/fa";
import { IoIosArrowUp } from "react-icons/io";

function ProfileButton({ user }) {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef();
  const navigate = useNavigate()
  // console.log("INITIAL SHOWMENU",showMenu)

  const toggleMenu = (e) => {
    e.stopPropagation(); // Keep from bubbling up to document and triggering closeMenu
    setShowMenu(!showMenu);
  };

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      // console.log("CURR ULREF: ",ulRef.current, "E.TARGET: ",e.target)
      if (ulRef.current && !ulRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', closeMenu);

    return () => document.removeEventListener('click', closeMenu);
  }, [showMenu]);

  const closeMenu = () => setShowMenu(false);

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout());
    closeMenu();
    localStorage.setItem("groupId", "")
    navigate("/")
  };

  const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");
  // console.log("END SHOWMENU",showMenu)

  return (
    <nav className='userProfileButtonContainer'>
      <button className='ProfileButtonContainer' onClick={toggleMenu}>
        <img className='ProfileButtonImg' src='data:image/jpeg;base64,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'/>
        <i className="fas fa-user-circle" />
        {showMenu ? <IoIosArrowUp className='ProfileButtonArrow'/> : <FaAngleDown className='ProfileButtonArrow'/> }
      </button>
      <ul className={ulClassName} ref={ulRef}>
        {user ? (
          <>
            <li>Hello, {user.firstName}</li>
            <li>{user.email}</li>
            <li>
              <button onClick={logout}>Log Out</button>
            </li>
            <li>
              <NavLink to={"/groups"}>View groups</NavLink>
            </li>
            <li>
              <NavLink to={"/events"}>View Events</NavLink>
            </li>
          </>
        ) : (
          <>
            <OpenModalMenuItem
              itemText="Log In"
              onItemClick={closeMenu}
              modalComponent={<LoginFormModal />}
            />
            <OpenModalMenuItem
              itemText="Sign Up"
              onItemClick={closeMenu}
              modalComponent={<SignupFormModal />}
            />
            <li>
              <NavLink to={"/groups"}>View groups</NavLink>
            </li>
            <li>
              <NavLink to={"/events"}>View Events</NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default ProfileButton;
