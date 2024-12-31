import { useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import './LoginForm.css';
import { useNavigate } from 'react-router-dom';

function LoginFormModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const disabled = () => {return credential.length<4||password.length<6}

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    return dispatch(sessionActions.login({ credential, password }))
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors({credential: 'The provided credentials were invalid'})
            // data.errors);
        } navigate("/")
      });
  };

  const defaultClicked = (e) => {
    e.preventDefault()
    dispatch(sessionActions.defaultLogin())
    closeModal()
    navigate("/")
  }

  return (
    <>
      <h1 className='LoginTitle'>Log In</h1>
      <form onSubmit={handleSubmit} className='LoginForm'>
        {errors.credential && <p>{errors.credential}</p>}
          <input
          placeholder='Username or Email'
          type="text"
          value={credential}
          onChange={(e) => setCredential(e.target.value)}
          required
          />
          <input
            placeholder='Password'
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        <button type="submit" disabled={disabled()}>Log In</button>
      </form>
      <button className='LoginButton' onClick={defaultClicked}>
                Demo User Button
              </button>
    </>
  );
}

export default LoginFormModal;
