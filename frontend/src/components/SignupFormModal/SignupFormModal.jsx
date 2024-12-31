import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import * as sessionActions from '../../store/session';
import './SignupForm.css';

function SignupFormModal() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();
  console.log("ERRORS: ",errors)

  const disabled = () => {
    return email.length<1||username.length<4||firstName.length<1||lastName.length<1||password.length<6||confirmPassword.length<1||password!==confirmPassword
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === confirmPassword) {
      setErrors({});
      return dispatch(
        sessionActions.signup({
          email,
          username,
          firstName,
          lastName,
          password,
          confirmPassword
        })
      )
        .then(closeModal)
        .catch(async (res) => {
          const data = await res.json();
          console.log("CATCHDATA: ",data)
          if (data?.errors) {
            setErrors(data.errors);
          }
        });
    } else {setErrors({confirmPassword: "Password and Confirm Password need to match."})}
  };

  return (
    <>
      <h1 className='SignupTitle'>Sign Up</h1>
      <form onSubmit={handleSubmit} className='SignupContainer'>
        {errors.firstName && <p>{errors.firstName}</p>}
        {errors.lastName && <p>{errors.lastName}</p>}
        {errors.email && <p>{errors.email}</p>}
        {errors.username && <p>{errors.username}</p>}
    {errors.password && <p>{errors.password}</p>}
        {errors.confirmPassword && <p>{errors.confirmPassword}</p>}
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            placeholder='First Name'
          />
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            placeholder='Last Name'
          />
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder='Email'
          />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder='Username'
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder='Password'
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder='Confirm Password'
          />
          {/* {errors.confirmPassword ? <p>{errors.confirmPassword}</p> : null} */}
        <button type="submit" disabled={disabled()}>Sign Up</button>
      </form>
    </>
  );
}

export default SignupFormModal;
